# Refactoring Phase 5 — 게임 루프 훅 분리 ✅ 완료

## 현재 문제

`GameScreen.tsx` 컴포넌트가 두 가지 역할을 동시에 담당한다.

1. **게임 루프** — `useEffect` 안의 `requestAnimationFrame` 루프, 물리, 충돌, 상태 관리
2. **UI 렌더** — JSX, Canvas 엘리먼트, 결과 오버레이 컴포넌트

```ts
// GameScreen.tsx (356줄)
export default function GameScreen({ onBack }) {
  // ref 10개 선언
  // resetGame()
  // useEffect → 키 리스너 + 게임 루프 (200줄)
  // return JSX
}
```

### 문제점
- 컴포넌트가 356줄로 단일 책임을 위반
- 게임 루프 로직 테스트를 위해 React 컴포넌트 전체를 마운트해야 함
- 나중에 게임 루프를 다른 화면(미션 선택 등)에서 재사용하기 어려움

---

## 목표

게임 루프 전체를 `useGameLoop` 커스텀 훅으로 추출한다.
`GameScreen.tsx`는 **"훅을 실행하고 결과를 JSX로 연결하는 얇은 층"** 만 담당한다.

---

## 대상 파일

### `src/game/useGameLoop.ts` (신규)

```ts
import { useEffect, useRef, useState } from 'react'
import { initialBubbles, resetBubbleIds } from './bubbles'
import { stepBubble, wireHitsBubble, splitBubble, playerHitsBubble } from './physics'
import { drawBackground, drawWire, drawBubbles, drawPlayer, drawHUD, drawCountdown } from './renderer'
import { GW, GH, WALL, PLAYER_W, PLAYER_H, PLAYER_SPEED, WIRE_SPEED,
         PLAYER_HIT_R, INVINCIBLE_FRAMES, COUNTDOWN_FRAMES } from './constants'
import type { Bubble, Wire, Overlay } from './types'

interface UseGameLoopReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>
  overlay: Overlay
  resetGame: () => void
}

export function useGameLoop(onBack: () => void): UseGameLoopReturn {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const keys           = useRef<Set<string>>(new Set())
  const playerX        = useRef(GW / 2 - PLAYER_W / 2)
  const wire           = useRef<Wire>({ x: 0, y: 0, active: false })
  const bubblesRef     = useRef<Bubble[]>(initialBubbles())
  const livesRef       = useRef(3)
  const invincible     = useRef(0)
  const overlayRef     = useRef<Overlay>('none')
  const countdownStep  = useRef(3)
  const countdownTimer = useRef(COUNTDOWN_FRAMES)
  const rafId          = useRef(0)

  const [overlay, setOverlay] = useState<Overlay>('none')

  function showOverlay(o: Overlay) {
    overlayRef.current = o
    setOverlay(o)
  }

  function resetGame() {
    resetBubbleIds()
    playerX.current      = GW / 2 - PLAYER_W / 2
    wire.current         = { x: 0, y: 0, active: false }
    bubblesRef.current   = initialBubbles()
    livesRef.current     = 3
    invincible.current   = 0
    overlayRef.current   = 'none'
    countdownStep.current  = 3
    countdownTimer.current = COUNTDOWN_FRAMES
    setOverlay('none')
  }

  useEffect(() => {
    // 키 리스너 + 게임 루프
    // ... (Phase 1~4 리팩토링 결과 코드 사용)
    return () => { cancelAnimationFrame(rafId.current); /* removeEventListener */ }
  }, [])

  return { canvasRef, overlay, resetGame }
}
```

### `GameScreen.tsx` 변경 후

```ts
import { useGameLoop } from '../game/useGameLoop'

export default function GameScreen({ onBack }: { onBack: () => void }) {
  const { canvasRef, overlay, resetGame } = useGameLoop(onBack)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-3">
      <div className="relative">
        <canvas ref={canvasRef} width={GW} height={GH} className="block border-2 border-gray-700 rounded-sm" />
        {overlay !== 'none' && (
          <ResultOverlay
            title={overlay === 'clear' ? 'MISSION CLEAR!' : 'GAME OVER'}
            titleColor={overlay === 'clear' ? 'text-yellow-400' : 'text-red-500'}
            onRetry={resetGame}
            onBack={onBack}
          />
        )}
      </div>
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        ← 메인으로
      </button>
    </div>
  )
}
```

---

## 변경 범위

| 파일 | 작업 |
|---|---|
| `src/game/useGameLoop.ts` | 신규 생성 |
| `src/screens/GameScreen.tsx` | 루프 코드 전량 제거, 훅 호출로 대체 → 약 30줄로 압축 |

---

## Phase 1~5 리팩토링 완료 후 예상 구조

```
src/
  App.tsx                   (12줄, 변동 없음)
  screens/
    MainScreen.tsx           (83줄, 변동 없음)
    GameScreen.tsx           (30줄 ← 현재 356줄)
  game/
    constants.ts             (신규, ~40줄)
    types.ts                 (신규, ~20줄)
    bubbles.ts               (신규, ~25줄)
    physics.ts               (신규, ~40줄)
    renderer.ts              (신규, ~70줄)
    useGameLoop.ts           (신규, ~120줄)
```

총 코드량 변화 없음. 파일당 줄 수는 감소, 역할은 명확해짐.
