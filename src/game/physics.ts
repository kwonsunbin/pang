import { GRAVITY, JUMP_VY, WALL, GW, GH, BUBBLE_CONFIG, PLAYER_HIT_R } from './constants'
import { makeBubble } from './bubbles'
import type { Bubble, Wire } from './types'

export function stepBubble(b: Bubble): Bubble {
  const n = { ...b }
  n.vy += GRAVITY
  n.x  += n.vx
  n.y  += n.vy

  if (n.x - n.r < WALL)       { n.x = WALL + n.r;      n.vx =  Math.abs(n.vx) }
  if (n.x + n.r > GW - WALL)  { n.x = GW - WALL - n.r; n.vx = -Math.abs(n.vx) }
  if (n.y - n.r < WALL)       { n.y = WALL + n.r;       n.vy =  Math.abs(n.vy) }
  if (n.y + n.r >= GH - WALL) { n.y = GH - WALL - n.r; n.vy = JUMP_VY }
  return n
}

export function wireHitsBubble(w: Wire, b: Bubble): boolean {
  return w.active
    && b.x - b.r < w.x && w.x < b.x + b.r
    && w.y > b.y - b.r && w.y < b.y + b.r
}

export function splitBubble(b: Bubble): Bubble[] {
  if (b.size === 'large') {
    const s = BUBBLE_CONFIG.medium.speed
    return [makeBubble(b.x, b.y, -s, 'medium'), makeBubble(b.x, b.y, s, 'medium')]
  }
  if (b.size === 'medium') {
    const s = BUBBLE_CONFIG.small.speed
    return [makeBubble(b.x, b.y, -s, 'small'), makeBubble(b.x, b.y, s, 'small')]
  }
  return []
}

export function playerHitsBubble(pcx: number, pcy: number, b: Bubble): boolean {
  const dx = pcx - b.x
  const dy = pcy - b.y
  return Math.sqrt(dx * dx + dy * dy) < PLAYER_HIT_R + b.r
}
