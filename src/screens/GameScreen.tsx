import { useEffect, useRef, useState } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────
const GW = 800
const GH = 560
const WALL = 20
const PLAYER_W = 40
const PLAYER_H = 50
const PLAYER_SPEED = 5
const WIRE_SPEED = 10
const GRAVITY = 0.35
const PEAK_H = GH - WALL * 2 - 30
const JUMP_VY = -Math.sqrt(2 * GRAVITY * PEAK_H)
const PLAYER_HIT_R = 18    // 히트박스 반지름 (스프라이트보다 약간 작게)
const INVINCIBLE_FRAMES = 120  // 충돌 후 무적 시간 (~2초 @ 60fps)

const BUBBLE_CONFIG = {
  large:  { r: 36, speed: 2.2 },
  medium: { r: 22, speed: 2.8 },
  small:  { r: 13, speed: 3.4 },
} as const
type BubbleSize = keyof typeof BUBBLE_CONFIG

const BUBBLE_COLORS: Record<BubbleSize, string> = {
  large:  '#ef4444',
  medium: '#f97316',
  small:  '#a78bfa',
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Bubble {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: BubbleSize
  r: number
}

interface Wire {
  x: number
  y: number
  active: boolean
}

type Overlay = 'none' | 'gameover' | 'clear'

let nextId = 1
function makeBubble(x: number, y: number, vx: number, size: BubbleSize): Bubble {
  return { id: nextId++, x, y, vx, vy: 0, size, r: BUBBLE_CONFIG[size].r }
}
function initialBubbles(): Bubble[] {
  return [
    makeBubble(GW * 0.3, GH - WALL - BUBBLE_CONFIG.large.r - 1,  BUBBLE_CONFIG.large.speed, 'large'),
    makeBubble(GW * 0.7, GH - WALL - BUBBLE_CONFIG.large.r - 1, -BUBBLE_CONFIG.large.speed, 'large'),
  ]
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function GameScreen({ onBack }: { onBack: () => void }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const keys        = useRef<Set<string>>(new Set())
  const playerX     = useRef(GW / 2 - PLAYER_W / 2)
  const wire        = useRef<Wire>({ x: 0, y: 0, active: false })
  const bubblesRef  = useRef<Bubble[]>(initialBubbles())
  const livesRef    = useRef(3)
  const invincible  = useRef(0)
  const overlayRef  = useRef<Overlay>('none')  // 루프 내 클로저에서 읽는 미러 값
  const rafId       = useRef(0)

  const [overlay, setOverlay] = useState<Overlay>('none')

  // overlayRef와 useState를 동시에 업데이트
  function showOverlay(o: Overlay) {
    overlayRef.current = o
    setOverlay(o)
  }

  function resetGame() {
    playerX.current    = GW / 2 - PLAYER_W / 2
    wire.current       = { x: 0, y: 0, active: false }
    bubblesRef.current = initialBubbles()
    livesRef.current   = 3
    invincible.current = 0
    overlayRef.current = 'none'
    setOverlay('none')
  }

  useEffect(() => {
    const PLAYER_Y = GH - WALL - PLAYER_H
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault()
      keys.current.add(e.key)
      if (e.key === ' ' && !wire.current.active && overlayRef.current === 'none') {
        wire.current = { x: playerX.current + PLAYER_W / 2, y: PLAYER_Y, active: true }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const loop = () => {
      const active = overlayRef.current === 'none'

      // ── Update (overlay 없을 때만) ────────────────────────────────────────────
      if (active) {

        // Player
        if (keys.current.has('ArrowLeft'))
          playerX.current = Math.max(WALL, playerX.current - PLAYER_SPEED)
        if (keys.current.has('ArrowRight'))
          playerX.current = Math.min(GW - WALL - PLAYER_W, playerX.current + PLAYER_SPEED)

        // Wire
        const w = wire.current
        if (w.active) {
          w.y -= WIRE_SPEED
          if (w.y <= WALL) w.active = false
        }

        // Bubbles
        const next: Bubble[] = []
        for (const b of bubblesRef.current) {
          b.vy += GRAVITY
          b.x  += b.vx
          b.y  += b.vy

          if (b.x - b.r < WALL)        { b.x = WALL + b.r;          b.vx =  Math.abs(b.vx) }
          if (b.x + b.r > GW - WALL)   { b.x = GW - WALL - b.r;     b.vx = -Math.abs(b.vx) }
          if (b.y - b.r < WALL)        { b.y = WALL + b.r;           b.vy =  Math.abs(b.vy) }
          if (b.y + b.r >= GH - WALL)  { b.y = GH - WALL - b.r;     b.vy = JUMP_VY }

          // Wire hit
          if (w.active) {
            const hit = b.x - b.r < w.x && w.x < b.x + b.r
                     && w.y > b.y - b.r && w.y < b.y + b.r
            if (hit) {
              w.active = false
              if (b.size === 'large') {
                const s = BUBBLE_CONFIG.medium.speed
                next.push(makeBubble(b.x, b.y, -s, 'medium'))
                next.push(makeBubble(b.x, b.y,  s, 'medium'))
              } else if (b.size === 'medium') {
                const s = BUBBLE_CONFIG.small.speed
                next.push(makeBubble(b.x, b.y, -s, 'small'))
                next.push(makeBubble(b.x, b.y,  s, 'small'))
              }
              continue
            }
          }
          next.push(b)
        }
        bubblesRef.current = next

        // 무적 카운트다운
        if (invincible.current > 0) invincible.current--

        // 플레이어-방울 충돌
        if (invincible.current === 0) {
          const pcx = playerX.current + PLAYER_W / 2
          const pcy = PLAYER_Y + PLAYER_H / 2
          for (const b of bubblesRef.current) {
            const dx = pcx - b.x
            const dy = pcy - b.y
            if (Math.sqrt(dx * dx + dy * dy) < PLAYER_HIT_R + b.r) {
              livesRef.current -= 1
              invincible.current = INVINCIBLE_FRAMES
              if (livesRef.current <= 0) showOverlay('gameover')
              break
            }
          }
        }

        // Mission Clear
        if (bubblesRef.current.length === 0) showOverlay('clear')
      }

      // ── Draw ──────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, GW, GH)

      // 벽
      ctx.fillStyle = '#3a3a5c'
      ctx.fillRect(0, 0, WALL, GH)
      ctx.fillRect(GW - WALL, 0, WALL, GH)
      ctx.fillRect(0, 0, GW, WALL)
      ctx.fillRect(0, GH - WALL, GW, WALL)

      // 와이어
      const w = wire.current
      if (w.active) {
        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(w.x, PLAYER_Y)
        ctx.lineTo(w.x, w.y)
        ctx.stroke()
      }

      // 방울
      for (const b of bubblesRef.current) {
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

      // 플레이어 (무적 중 깜빡임)
      const blink = invincible.current > 0 && Math.floor(invincible.current / 6) % 2 === 1
      if (!blink) {
        const px = playerX.current
        ctx.fillStyle = '#facc15'
        ctx.fillRect(px + 8, PLAYER_Y, PLAYER_W - 16, PLAYER_H - 10)
        ctx.beginPath()
        ctx.arc(px + PLAYER_W / 2, PLAYER_Y + 4, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      // HUD — 목숨
      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#ef4444'
      for (let i = 0; i < livesRef.current; i++) {
        ctx.fillText('♥', WALL + 8 + i * 26, WALL + 22)
      }

      rafId.current = requestAnimationFrame(loop)
    }

    rafId.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GW}
          height={GH}
          className="block border-2 border-gray-700 rounded-sm"
        />
        {overlay !== 'none' && (
          <ResultOverlay
            title={overlay === 'clear' ? 'MISSION CLEAR!' : 'GAME OVER'}
            titleColor={overlay === 'clear' ? 'text-yellow-400' : 'text-red-500'}
            onRetry={resetGame}
            onBack={onBack}
          />
        )}
      </div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        ← 메인으로
      </button>
    </div>
  )
}

// ── Result Overlay ─────────────────────────────────────────────────────────────
function ResultOverlay({ title, titleColor, onRetry, onBack }: {
  title: string
  titleColor: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-sm">
      <div className="text-center">
        <h2 className={`text-5xl font-extrabold mb-10 tracking-wide ${titleColor}`}>{title}</h2>
        <div className="flex flex-col gap-3 w-48 mx-auto">
          <button
            onClick={onRetry}
            className="py-3 text-lg font-bold bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 active:scale-95 transition-all"
          >
            다시 시작
          </button>
          <button
            onClick={onBack}
            className="py-3 text-lg font-bold border-2 border-gray-500 text-gray-300 rounded-lg hover:border-gray-300 hover:text-white active:scale-95 transition-all"
          >
            메인으로
          </button>
        </div>
      </div>
    </div>
  )
}
