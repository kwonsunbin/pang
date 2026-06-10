import { useEffect, useRef } from 'react'

const GW = 800
const GH = 560
const WALL = 20
const PLAYER_W = 40
const PLAYER_H = 50
const PLAYER_SPEED = 5

// Wire state
interface Wire {
  x: number
  y: number
  active: boolean
}

export default function GameScreen({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef<Set<string>>(new Set())
  const playerX = useRef(GW / 2 - PLAYER_W / 2)
  const wire = useRef<Wire>({ x: 0, y: 0, active: false })
  const rafId = useRef(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault()
      keys.current.add(e.key)

      // Fire wire on Space (only if no active wire)
      if (e.key === ' ' && !wire.current.active) {
        wire.current = {
          x: playerX.current + PLAYER_W / 2,
          y: GH - WALL - PLAYER_H,
          active: true,
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const WIRE_SPEED = 10
    const PLAYER_Y = GH - WALL - PLAYER_H

    const loop = () => {
      // --- Update ---
      if (keys.current.has('ArrowLeft')) {
        playerX.current = Math.max(WALL, playerX.current - PLAYER_SPEED)
      }
      if (keys.current.has('ArrowRight')) {
        playerX.current = Math.min(GW - WALL - PLAYER_W, playerX.current + PLAYER_SPEED)
      }

      const w = wire.current
      if (w.active) {
        w.y -= WIRE_SPEED
        if (w.y <= WALL) wire.current.active = false
      }

      // --- Draw ---
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, GW, GH)

      // Walls
      ctx.fillStyle = '#3a3a5c'
      ctx.fillRect(0, 0, WALL, GH)             // left
      ctx.fillRect(GW - WALL, 0, WALL, GH)     // right
      ctx.fillRect(0, 0, GW, WALL)             // top
      ctx.fillRect(0, GH - WALL, GW, WALL)     // bottom

      // Wire
      if (w.active) {
        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(w.x, PLAYER_Y)
        ctx.lineTo(w.x, w.y)
        ctx.stroke()
      }

      // Player
      const px = playerX.current
      ctx.fillStyle = '#facc15'
      ctx.fillRect(px + 8, PLAYER_Y, PLAYER_W - 16, PLAYER_H - 10)  // body
      ctx.beginPath()
      ctx.arc(px + PLAYER_W / 2, PLAYER_Y + 4, 12, 0, Math.PI * 2)  // head
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
      <canvas
        ref={canvasRef}
        width={GW}
        height={GH}
        className="border-2 border-gray-700 rounded-sm"
      />
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        ← 메인으로
      </button>
    </div>
  )
}
