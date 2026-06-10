# Phase 5 설계 문서 — 충돌 판정 & 승패 시스템

## 목표
플레이어-방울 충돌로 목숨이 줄고, 목숨 소진 시 Game Over, 방울 전멸 시 Mission Clear가 되는 완전한 게임 루프를 완성한다.

---

## 게임 오버레이 상태

```ts
type Overlay = 'none' | 'gameover' | 'clear'
```

- 루프 내 stale closure 방지를 위해 `overlayRef`(useRef)와 `overlay`(useState)를 동시에 관리
- `overlayRef` — 게임 루프에서 매 프레임 읽는 값
- `overlay` (useState) — React DOM에서 결과 오버레이 컴포넌트 렌더 트리거

```ts
const overlayRef = useRef<Overlay>('none')
const [overlay, setOverlay] = useState<Overlay>('none')

function showOverlay(o: Overlay) {
  overlayRef.current = o   // 루프에서 읽기 위한 ref
  setOverlay(o)            // React 리렌더 트리거
}
```

그 외 게임 루프 전용 ref:
```ts
const livesRef    = useRef(3)
const invincible  = useRef(0)   // 무적 프레임 카운터 (0이면 피해 받음)
```

---

## 플레이어-방울 충돌 판정

플레이어 히트박스: 머리(원)와 몸통(사각형) 모두 판정 대상.
구현 단순화를 위해 **플레이어 중심점 기반 원형 히트박스** 사용:

```ts
const PLAYER_HIT_R = 18   // px, 스프라이트보다 약간 작게 (억울한 죽음 방지)

const pcx = playerX.current + PLAYER_W / 2
const pcy = PLAYER_Y + PLAYER_H / 2

for (const b of bubblesRef.current) {
  const dx = pcx - b.x
  const dy = pcy - b.y
  if (Math.sqrt(dx * dx + dy * dy) < PLAYER_HIT_R + b.r) {
    // 충돌 처리
  }
}
```

---

## 충돌 처리 흐름

```
충돌 감지 (invincible === 0 일 때만)
  └─ livesRef.current--
  └─ invincible.current = 120   (약 2초 무적, 60fps 기준)
  └─ lives === 0 → showOverlay('gameover')
     lives > 0  → 계속 플레이 (invincible 동안 플레이어 깜빡임)
```

매 프레임: `if (invincible.current > 0) invincible.current--`

플레이어 깜빡임 처리:
```ts
const blink = invincible.current > 0 && Math.floor(invincible.current / 6) % 2 === 1
if (!blink) { /* 플레이어 렌더 */ }
```

---

## Mission Clear 판정

```ts
if (bubblesRef.current.length === 0) showOverlay('clear')
```

`overlayRef.current !== 'none'`이면 루프 상단에서 업데이트 전체를 건너뛰므로 중복 호출 없음.

---

## 결과 화면 오버레이 (Canvas 위 React DOM)

Canvas 위에 absolute 위치 div를 겹쳐 결과 화면을 표시한다.
Canvas 루프는 계속 실행되며 결과 화면 뒤 필드를 렌더.

```
부모 div (relative)
  ├── <canvas>
  └── {overlay !== 'none' && <ResultOverlay title titleColor onRetry onBack />}
```

`ResultOverlay`는 GAME OVER / MISSION CLEAR! 두 케이스를 props로 구분:
- `title`: "GAME OVER" | "MISSION CLEAR!"
- `titleColor`: Tailwind 클래스 (`text-red-500` | `text-yellow-400`)
- `onRetry`: `resetGame()` 호출
- `onBack`: `onBack()` 호출

---

## 게임 초기화 (다시 시작)

```ts
function resetGame() {
  playerX.current      = GW / 2 - PLAYER_W / 2
  wire.current         = { x: 0, y: 0, active: false }
  bubblesRef.current   = initialBubbles()
  livesRef.current     = 3
  invincible.current   = 0
  overlayRef.current   = 'none'
  countdownStep.current  = 3          // Phase 6에서 추가
  countdownTimer.current = COUNTDOWN_FRAMES
  setOverlay('none')
}
```

---

## HUD (Canvas에 직접 렌더)

```ts
ctx.font = 'bold 18px sans-serif'
ctx.fillStyle = '#ef4444'
for (let i = 0; i < livesRef.current; i++) {
  ctx.fillText('♥', WALL + 8 + i * 26, WALL + 22)
}
```

---

## 상태 전이 다이어그램

```
      [카운트다운] ──완료──► [playing]
                                │
                       방울 충돌 (목숨 > 0)
                                │
                    invincible=120, 플레이어 깜빡임
                                │
                           [playing] (복귀)
                                │
                       방울 충돌 (목숨 = 0)
                                │
                           [gameover]
                                │
                        [다시 시작 버튼]
                                │
                           [카운트다운]

      [playing]
          │
       방울 전멸
          │
        [clear]
```
