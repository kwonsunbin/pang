# Refactoring Phase 4 — 렌더러 분리

## 현재 문제

`GameScreen.tsx`의 루프 후반부에 Canvas 렌더링 코드가 약 70줄 인라인으로 작성되어 있다.

```ts
// loop() 내부
ctx.fillStyle = '#0f0f1a'
ctx.fillRect(...)     // 배경
ctx.fillRect(...)     // 벽 × 4
// 와이어 draw...
// 방울 × N draw...
// 플레이어 draw...
// HUD draw...
// 카운트다운 draw...
```

### 문제점
- 업데이트(물리) 코드와 렌더(draw) 코드가 한 함수 안에 섞여 있음
- 렌더 순서나 색상을 바꾸려면 250줄짜리 루프를 탐색해야 함
- Canvas 컨텍스트(`ctx`)가 루프에 직접 캡처되어 있어 재사용 어려움

---

## 목표

Canvas 드로잉 코드를 `src/game/renderer.ts`로 분리하고, 루프는 **업데이트 → render() 호출** 구조로 단순화한다.

---

## 대상 파일

### `src/game/renderer.ts` (신규)

```ts
import { WALL, GW, GH, PLAYER_W, PLAYER_H, BUBBLE_COLORS, COUNTDOWN_FRAMES, GO_FRAMES } from './constants'
import type { Bubble, Wire } from './types'

const PLAYER_Y = GH - WALL - PLAYER_H

export function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0f0f1a'
  ctx.fillRect(0, 0, GW, GH)
  ctx.fillStyle = '#3a3a5c'
  ctx.fillRect(0, 0, WALL, GH)
  ctx.fillRect(GW - WALL, 0, WALL, GH)
  ctx.fillRect(0, 0, GW, WALL)
  ctx.fillRect(0, GH - WALL, GW, WALL)
}

export function drawWire(ctx: CanvasRenderingContext2D, wire: Wire) {
  if (!wire.active) return
  ctx.strokeStyle = '#facc15'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(wire.x, PLAYER_Y)
  ctx.lineTo(wire.x, wire.y)
  ctx.stroke()
}

export function drawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[]) {
  for (const b of bubbles) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = BUBBLE_COLORS[b.size]
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fill()
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, px: number, blink: boolean) {
  if (blink) return
  ctx.fillStyle = '#facc15'
  ctx.fillRect(px + 8, PLAYER_Y, PLAYER_W - 16, PLAYER_H - 10)
  ctx.beginPath()
  ctx.arc(px + PLAYER_W / 2, PLAYER_Y + 4, 12, 0, Math.PI * 2)
  ctx.fill()
}

export function drawHUD(ctx: CanvasRenderingContext2D, lives: number, bubbleCount: number) {
  ctx.font = 'bold 18px sans-serif'
  ctx.fillStyle = '#ef4444'
  for (let i = 0; i < lives; i++) ctx.fillText('♥', WALL + 8 + i * 26, WALL + 22)

  ctx.font = 'bold 13px monospace'
  ctx.fillStyle = '#94a3b8'
  ctx.textAlign = 'center'
  ctx.fillText('MISSION 1', GW / 2, WALL + 20)
  ctx.textAlign = 'right'
  ctx.fillText(`방울 ${bubbleCount}`, GW - WALL - 8, WALL + 20)
  ctx.textAlign = 'left'
}

export function drawCountdown(ctx: CanvasRenderingContext2D, step: number, timer: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(WALL, WALL, GW - WALL * 2, GH - WALL * 2)

  const text = step > 0 ? String(step) : 'GO!'
  const maxFrames = step === 0 ? GO_FRAMES : COUNTDOWN_FRAMES
  const progress = timer / maxFrames
  const scale = step > 0 ? 1 + (1 - progress) * 0.3 : 1 + progress * 0.15

  ctx.save()
  ctx.translate(GW / 2, GH / 2)
  ctx.scale(scale, scale)
  ctx.font = 'bold 110px monospace'
  ctx.fillStyle = step > 0 ? '#facc15' : '#4ade80'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  ctx.restore()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}
```

### `GameScreen.tsx` 루프 후반부 변경

```ts
// before: 70줄 인라인 draw
ctx.fillStyle = '#0f0f1a'
ctx.fillRect(...)
// ...

// after: 함수 호출 6줄
drawBackground(ctx)
drawWire(ctx, wire.current)
drawBubbles(ctx, bubblesRef.current)
drawPlayer(ctx, playerX.current, blink)
drawHUD(ctx, livesRef.current, bubblesRef.current.length)
if (inCountdown) drawCountdown(ctx, countdownStep.current, countdownTimer.current)
```

---

## 변경 범위

| 파일 | 작업 |
|---|---|
| `src/game/renderer.ts` | 신규 생성 |
| `src/screens/GameScreen.tsx` | 렌더 인라인 코드 → 함수 호출로 교체 |

---

## 기대 효과

- `GameScreen.tsx` 루프에서 약 70줄 제거
- 렌더 함수 개별 수정 시 루프 전체를 건드리지 않아도 됨
- Phase 1~3 리팩토링과 합치면 `GameScreen.tsx`의 루프 함수가 약 40줄로 압축됨
