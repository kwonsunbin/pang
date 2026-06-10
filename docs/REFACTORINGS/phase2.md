# Refactoring Phase 2 — 방울 팩토리 & 초기 상태 분리 ✅ 완료

## 현재 문제

`makeBubble`과 `initialBubbles`가 `GameScreen.tsx` 모듈 스코프에 정의되어 있고,
`nextId`가 모듈 레벨 전역 변수로 선언되어 있다.

```ts
// GameScreen.tsx 모듈 스코프
let nextId = 1   // ← 컴포넌트 리마운트 시 초기화되지 않음
function makeBubble(...) { ... }
function initialBubbles() { ... }
```

### 문제점
- `nextId`가 전역 변수이므로 컴포넌트가 언마운트/리마운트되어도 누적된다 (ID 1000+이 될 수 있음)
- `initialBubbles`가 미션 설정과 강결합 — 미션 2를 추가하면 이 함수를 직접 수정해야 함

---

## 목표

방울 생성 로직을 `src/game/bubbles.ts`로 분리하고, ID 생성을 컴포넌트 생명주기에 맞게 수정한다.

---

## 대상 파일

### `src/game/bubbles.ts` (신규)

```ts
import { BUBBLE_CONFIG } from './constants'
import type { Bubble, BubbleSize } from './types'

let _nextId = 0

export function resetBubbleIds() {
  _nextId = 0
}

export function makeBubble(x: number, y: number, vx: number, size: BubbleSize): Bubble {
  return { id: _nextId++, x, y, vx, vy: 0, size, r: BUBBLE_CONFIG[size].r }
}

export function initialBubbles(): Bubble[] {
  // Mission 1 초기 배치
  return [
    makeBubble(GW * 0.3, GH - WALL - BUBBLE_CONFIG.large.r - 1,  BUBBLE_CONFIG.large.speed, 'large'),
    makeBubble(GW * 0.7, GH - WALL - BUBBLE_CONFIG.large.r - 1, -BUBBLE_CONFIG.large.speed, 'large'),
  ]
}
```

### `GameScreen.tsx` 변경

```ts
// 제거
let nextId = 1
function makeBubble(...) { ... }
function initialBubbles() { ... }

// 추가
import { makeBubble, initialBubbles, resetBubbleIds } from '../game/bubbles'

// resetGame 내부에 추가
resetBubbleIds()
```

---

## 변경 범위

| 파일 | 작업 |
|---|---|
| `src/game/bubbles.ts` | 신규 생성 |
| `src/screens/GameScreen.tsx` | makeBubble/initialBubbles 제거, import로 대체 |

---

## 기대 효과

- 전역 변수 `nextId` 제거 → 컴포넌트 재시작 시 ID 항상 0부터 시작
- 미션별 초기 배치를 `bubbles.ts` 안에서 함수로 구분 가능 (향후 확장 용이)
