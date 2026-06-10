# Refactoring Phase 3 — 물리 & 충돌 로직 분리

## 현재 문제

`GameScreen.tsx`의 게임 루프 안에 물리 연산과 충돌 판정이 인라인으로 작성되어 있다.

```ts
// loop() 내부에 60줄 이상의 물리/충돌 코드가 직접 존재
for (const b of bubblesRef.current) {
  b.vy += GRAVITY
  b.x += b.vx
  // ... 벽 반사, 와이어 적중, 분할 ...
}
if (invincible.current === 0) {
  // ... 플레이어-방울 충돌 ...
}
```

### 문제점
- 루프 함수가 업데이트(물리) + 렌더(Canvas draw) 두 역할을 모두 담당
- 물리 버그 수정 시 렌더 코드 사이를 탐색해야 함
- 단위 테스트 작성 불가 (브라우저 Canvas와 결합)

---

## 목표

물리 연산과 충돌 판정을 순수 함수로 추출하여 `src/game/physics.ts`로 분리한다.

---

## 대상 파일

### `src/game/physics.ts` (신규)

```ts
import { GRAVITY, JUMP_VY, WALL, GW, GH, BUBBLE_CONFIG } from './constants'
import { makeBubble } from './bubbles'
import type { Bubble, Wire } from './types'

/** 방울 1개의 물리를 1프레임 진행한다. 배열 교체는 호출자가 담당 */
export function stepBubble(b: Bubble): Bubble {
  const next = { ...b }
  next.vy += GRAVITY
  next.x  += next.vx
  next.y  += next.vy

  if (next.x - next.r < WALL)       { next.x = WALL + next.r;      next.vx =  Math.abs(next.vx) }
  if (next.x + next.r > GW - WALL)  { next.x = GW - WALL - next.r; next.vx = -Math.abs(next.vx) }
  if (next.y - next.r < WALL)       { next.y = WALL + next.r;       next.vy =  Math.abs(next.vy) }
  if (next.y + next.r >= GH - WALL) { next.y = GH - WALL - next.r; next.vy = JUMP_VY }
  return next
}

/** 와이어-방울 적중 여부 */
export function wireHitsBubble(w: Wire, b: Bubble): boolean {
  return w.active
    && b.x - b.r < w.x && w.x < b.x + b.r
    && w.y > b.y - b.r && w.y < b.y + b.r
}

/** 적중된 방울을 분할한다. 소멸 시 빈 배열 반환 */
export function splitBubble(b: Bubble): Bubble[] {
  if (b.size === 'large') {
    const s = BUBBLE_CONFIG.medium.speed
    return [makeBubble(b.x, b.y, -s, 'medium'), makeBubble(b.x, b.y, s, 'medium')]
  }
  if (b.size === 'medium') {
    const s = BUBBLE_CONFIG.small.speed
    return [makeBubble(b.x, b.y, -s, 'small'), makeBubble(b.x, b.y, s, 'small')]
  }
  return []   // small → 소멸
}

/** 플레이어-방울 충돌 여부 */
export function playerHitsBubble(
  pcx: number, pcy: number, hitR: number, b: Bubble
): boolean {
  const dx = pcx - b.x
  const dy = pcy - b.y
  return Math.sqrt(dx * dx + dy * dy) < hitR + b.r
}
```

### `GameScreen.tsx` 루프 변경 (before → after)

```ts
// before: 60줄 인라인 물리
for (const b of bubblesRef.current) {
  b.vy += GRAVITY; b.x += b.vx; ...
}

// after: 함수 호출
import { stepBubble, wireHitsBubble, splitBubble, playerHitsBubble } from '../game/physics'

const next: Bubble[] = []
for (const b of bubblesRef.current) {
  const moved = stepBubble(b)
  if (wireHitsBubble(wire.current, moved)) {
    wire.current.active = false
    next.push(...splitBubble(moved))
    continue
  }
  next.push(moved)
}
```

---

## 변경 범위

| 파일 | 작업 |
|---|---|
| `src/game/physics.ts` | 신규 생성 |
| `src/screens/GameScreen.tsx` | 물리/충돌 인라인 코드 → 함수 호출로 교체 |

---

## 기대 효과

- `GameScreen.tsx` 루프에서 약 50줄 제거
- `physics.ts` 함수는 순수 함수 → Vitest 등으로 단위 테스트 가능
- 충돌 판정 버그 수정 시 `physics.ts`만 수정
