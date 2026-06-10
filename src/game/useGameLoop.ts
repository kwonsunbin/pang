import { useEffect, useRef, useState } from 'react'
import {
  GW, GH, WALL,
  PLAYER_W, PLAYER_H, PLAYER_SPEED, INVINCIBLE_FRAMES,
  WIRE_SPEED,
  COUNTDOWN_FRAMES, GO_FRAMES,
} from './constants'
import type { Bubble, Wire, Overlay } from './types'
import { resetBubbleIds } from './bubbles'
import { stepBubble, wireHitsBubble, splitBubble, playerHitsBubble } from './physics'
import { drawBackground, drawWire, drawBubbles, drawPlayer, drawHUD, drawCountdown } from './renderer'
import type { MissionConfig } from '../missions/types'

export interface UseGameLoopResult {
  canvasRef: React.RefObject<HTMLCanvasElement>
  overlay: Overlay
  resetGame: () => void
}

export function useGameLoop(mission: MissionConfig): UseGameLoopResult {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const keys           = useRef<Set<string>>(new Set())
  const playerX        = useRef(GW / 2 - PLAYER_W / 2)
  const wire           = useRef<Wire>({ x: 0, y: 0, active: false })
  const bubblesRef     = useRef<Bubble[]>(mission.initialBubbles())
  const livesRef       = useRef(mission.lives)
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
    playerX.current        = GW / 2 - PLAYER_W / 2
    wire.current           = { x: 0, y: 0, active: false }
    bubblesRef.current     = mission.initialBubbles()
    livesRef.current       = mission.lives
    invincible.current     = 0
    overlayRef.current     = 'none'
    countdownStep.current  = 3
    countdownTimer.current = COUNTDOWN_FRAMES
    setOverlay('none')
  }

  useEffect(() => {
    const PLAYER_Y = GH - WALL - PLAYER_H
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault()
      keys.current.add(e.key)
      if (e.key === ' ' && !wire.current.active
          && overlayRef.current === 'none'
          && countdownStep.current < 0) {
        wire.current = { x: playerX.current + PLAYER_W / 2, y: PLAYER_Y, active: true }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const loop = () => {
      const inCountdown = countdownStep.current >= 0
      const playing     = !inCountdown && overlayRef.current === 'none'

      if (inCountdown) {
        countdownTimer.current--
        if (countdownTimer.current <= 0) {
          countdownStep.current--
          countdownTimer.current = countdownStep.current === 0 ? GO_FRAMES : COUNTDOWN_FRAMES
        }
      }

      if (playing) {
        if (keys.current.has('ArrowLeft'))
          playerX.current = Math.max(WALL, playerX.current - PLAYER_SPEED)
        if (keys.current.has('ArrowRight'))
          playerX.current = Math.min(GW - WALL - PLAYER_W, playerX.current + PLAYER_SPEED)

        const w = wire.current
        if (w.active) {
          w.y -= WIRE_SPEED
          if (w.y <= WALL) w.active = false
        }

        const next: Bubble[] = []
        for (const b of bubblesRef.current) {
          const moved = stepBubble(b)
          if (wireHitsBubble(w, moved)) {
            w.active = false
            next.push(...splitBubble(moved))
            continue
          }
          next.push(moved)
        }
        bubblesRef.current = next

        if (invincible.current > 0) invincible.current--

        if (invincible.current === 0) {
          const pcx = playerX.current + PLAYER_W / 2
          const pcy = PLAYER_Y + PLAYER_H / 2
          for (const b of bubblesRef.current) {
            if (playerHitsBubble(pcx, pcy, b)) {
              livesRef.current -= 1
              invincible.current = INVINCIBLE_FRAMES
              if (livesRef.current <= 0) showOverlay('gameover')
              break
            }
          }
        }

        if (bubblesRef.current.length === 0) showOverlay('clear')
      }

      const blink = invincible.current > 0 && Math.floor(invincible.current / 6) % 2 === 1
      drawBackground(ctx)
      drawWire(ctx, wire.current)
      drawBubbles(ctx, bubblesRef.current)
      drawPlayer(ctx, playerX.current, blink)
      drawHUD(ctx, livesRef.current, bubblesRef.current.length, mission.name)
      if (inCountdown) drawCountdown(ctx, countdownStep.current, countdownTimer.current)

      rafId.current = requestAnimationFrame(loop)
    }

    rafId.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return { canvasRef, overlay, resetGame }
}
