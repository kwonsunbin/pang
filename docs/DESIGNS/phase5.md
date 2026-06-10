# Phase 5 설계 문서 — 충돌 판정 & 승패 시스템

## 목표
플레이어-방울 충돌로 목숨이 줄고, 목숨 소진 시 Game Over, 방울 전멸 시 Mission Clear가 되는 완전한 게임 루프를 완성한다.

---

## 게임 상태 확장

```ts
type GameStatus = 'playing' | 'dead' | 'clear' | 'gameover'

const lives = useRef(3)
const status = useRef<GameStatus>('playing')
const invincible = useRef(0)   // 무적 프레임 카운터 (0이면 피해 받음)
```

모두 `useRef`로 관리 — Canvas 루프 내에서 참조·변경만 하고, 결과 화면 전환만 React 상태로 올림.

---

## 플레이어-방울 충돌 판정

플레이어 히트박스: 머리(원)와 몸통(사각형) 모두 판정 대상.  
구현 단순화를 위해 **플레이어 중심점 기반 원형 히트박스** 사용:

```ts
const PLAYER_HIT_R = 18   // px, 실제 스프라이트보다 약간 작게 설정 (억울한 죽음 방지)

const pcx = playerX.current + PLAYER_W / 2
const pcy = PLAYER_Y + PLAYER_H / 2

for (const b of bubbles.current) {
  const dx = pcx - b.x
  const dy = pcy - b.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < PLAYER_HIT_R + b.r && invincible.current === 0) {
    // 충돌 처리
  }
}
```

---

## 충돌 처리 흐름

```
충돌 감지
  └─ lives-- 
  └─ invincible.current = 120   (약 2초 무적, 60fps 기준)
  └─ lives === 0 → status = 'gameover'
     lives > 0  → status = 'dead' (짧은 깜빡임 후 'playing' 복귀)
```

매 프레임: `if (invincible.current > 0) invincible.current--`

---

## Mission Clear 판정

```ts
if (bubbles.current.length === 0 && status.current === 'playing') {
  status.current = 'clear'
}
```

방울 배열이 빈 배열이 되는 순간 클리어.

---

## 결과 화면 오버레이 (Canvas 위에 React DOM으로 표시)

Canvas 위에 절대 위치 div를 겹쳐서 결과 화면을 표시한다.  
Canvas 루프는 중단하지 않고, 오버레이가 입력을 차단.

```
부모 div (relative)
  ├── <canvas>
  └── {status === 'gameover' && <GameOverOverlay />}
      {status === 'clear'    && <ClearOverlay />}
```

### GameOverOverlay
- "GAME OVER" 텍스트
- 남은 목숨: 0
- [다시 시작] 버튼 → 게임 상태 초기화
- [메인으로] 버튼 → `onBack()` 호출

### ClearOverlay
- "MISSION CLEAR!" 텍스트
- [다시 시작] / [메인으로] 버튼

---

## HUD (Canvas 위에 직접 그리기)

루프 내 매 프레임 Canvas에 직접 렌더:

```ts
// 목숨 표시 (좌상단)
ctx.fillStyle = '#ef4444'
for (let i = 0; i < lives.current; i++) {
  ctx.fillText('♥', WALL + 8 + i * 28, WALL + 16)
}
```

---

## 게임 초기화 (다시 시작)

```ts
function resetGame() {
  playerX.current = GW / 2 - PLAYER_W / 2
  wire.current = { x: 0, y: 0, active: false }
  bubbles.current = [초기 방울 2개]
  lives.current = 3
  invincible.current = 0
  status.current = 'playing'
}
```

`useRef` 값들을 직접 초기화하면 루프가 다음 프레임에 새 상태로 동작.

---

## 상태 전이 다이어그램

```
         [playing]
            │
    방울 충돌 (목숨 > 0)
            │
         [dead] ── 120프레임 후 ──► [playing]
            │
    방울 충돌 (목숨 = 0)
            │
        [gameover]
            │
     [다시 시작 버튼]
            │
         [playing]

         [playing]
            │
     방울 전멸
            │
          [clear]
```
