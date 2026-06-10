import { useEffect, useRef } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const GW = 800
const GH = 560
const WALL = 20
const PLAYER_W = 40
const PLAYER_H = 50
const PLAYER_SPEED = 5
const WIRE_SPEED = 10
const GRAVITY = 0.35

// Bubble size config
const BUBBLE_CONFIG = {
  large:  { r: 36, speed: 2.2 },
  medium: { r: 22, speed: 2.8 },
  small:  { r: 13, speed: 3.4 },
} as const
type BubbleSize = keyof typeof BUBBLE_CONFIG

// Jump velocity needed to reach a fixed peak height (same for all sizes)
// peak height from floor = PEAK_Y, using v² = 2gh → v = sqrt(2 * GRAVITY * peakH)
const PEAK_H = GH - WALL * 2 - 30   // how high bubbles bounce (near the ceiling)
const JUMP_VY = -Math.sqrt(2 * GRAVITY * PEAK_H)

// ── Types ─────────────────────────────────────────────────────────────────────
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

let nextId = 1

function makeBubble(x: number, y: number, vx: number, size: BubbleSize): Bubble {
  return { id: nextId++, x, y, vx, vy: 0, size, r: BUBBLE_CONFIG[size].r }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GameScreen({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef<Set<string>>(new Set())
  const playerX = useRef(GW / 2 - PLAYER_W / 2)
  const wire = useRef<Wire>({ x: 0, y: 0, active: false })
  const bubbles = useRef<Bubble[]>([
    makeBubble(GW * 0.3, GH - WALL - BUBBLE_CONFIG.large.r - 1, BUBBLE_CONFIG.large.speed, 'large'),
    makeBubble(GW * 0.7, GH - WALL - BUBBLE_CONFIG.large.r - 1, -BUBBLE_CONFIG.large.speed, 'large'),
  ])
  const rafId = useRef(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault()
      keys.current.add(e.key)
      if (e.key === ' ' && !wire.current.active) {
        wire.current = { x: playerX.current + PLAYER_W / 2, y: GH - WALL - PLAYER_H, active: true }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const PLAYER_Y = GH - WALL - PLAYER_H

    const loop = () => {
      // ── Player ──────────────────────────────────────────────────────────────
      if (keys.current.has('ArrowLeft'))
        playerX.current = Math.max(WALL, playerX.current - PLAYER_SPEED)
      if (keys.current.has('ArrowRight'))
        playerX.current = Math.min(GW - WALL - PLAYER_W, playerX.current + PLAYER_SPEED)

      // ── Wire ────────────────────────────────────────────────────────────────
      const w = wire.current
      if (w.active) {
        w.y -= WIRE_SPEED
        if (w.y <= WALL) w.active = false
      }

      // ── Bubbles ─────────────────────────────────────────────────────────────
      const next: Bubble[] = []
      for (const b of bubbles.current) {
        b.vy += GRAVITY
        b.x += b.vx
        b.y += b.vy

        // Wall bounce (left / right)
        if (b.x - b.r < WALL) { b.x = WALL + b.r; b.vx = Math.abs(b.vx) }
        if (b.x + b.r > GW - WALL) { b.x = GW - WALL - b.r; b.vx = -Math.abs(b.vx) }

        // Ceiling
        if (b.y - b.r < WALL) { b.y = WALL + b.r; b.vy = Math.abs(b.vy) }

        // Floor bounce — snap to floor and apply uniform jump velocity
        if (b.y + b.r >= GH - WALL) {
          b.y = GH - WALL - b.r
          b.vy = JUMP_VY
        }

        // ── Wire hit ──────────────────────────────────────────────────────────
        if (w.active) {
          const hit = b.x - b.r < w.x && w.x < b.x + b.r && w.y < b.y + b.r && w.y > b.y - b.r
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
            // small → destroyed (don't push)
            continue
          }
        }

        next.push(b)
      }
      bubbles.current = next

      // ── Draw ────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, GW, GH)

      // Walls
      ctx.fillStyle = '#3a3a5c'
      ctx.fillRect(0, 0, WALL, GH)
      ctx.fillRect(GW - WALL, 0, WALL, GH)
      ctx.fillRect(0, 0, GW, WALL)
      ctx.fillRect(0, GH - WALL, GW, WALL)

      // Wire
      if (w.active) {
        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(w.x, PLAYER_Y)
        ctx.lineTo(w.x, w.y)
        ctx.stroke()
      }

      // Bubbles
      const BUBBLE_COLORS: Record<BubbleSize, string> = {
        large:  '#ef4444',
        medium: '#f97316',
        small:  '#a78bfa',
      }
      for (const b of bubbles.current) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = BUBBLE_COLORS[b.size]
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 2
        ctx.stroke()
        // shine
        ctx.beginPath()
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fill()
      }

      // Player
      const px = playerX.current
      ctx.fillStyle = '#facc15'
      ctx.fillRect(px + 8, PLAYER_Y, PLAYER_W - 16, PLAYER_H - 10)
      ctx.beginPath()
      ctx.arc(px + PLAYER_W / 2, PLAYER_Y + 4, 12, 0, Math.PI * 2)
      ctx.fill()

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
      <canvas ref={canvasRef} width={GW} height={GH} className="border-2 border-gray-700 rounded-sm" />
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        ← 메인으로
      </button>
    </div>
  )
}
