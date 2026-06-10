import { GW, GH, WALL, BUBBLE_CONFIG } from './constants'
import type { Bubble, BubbleSize } from './types'

let _nextId = 0

export function resetBubbleIds() {
  _nextId = 0
}

export function makeBubble(x: number, y: number, vx: number, size: BubbleSize): Bubble {
  return { id: _nextId++, x, y, vx, vy: 0, size, r: BUBBLE_CONFIG[size].r }
}

export function initialBubbles(): Bubble[] {
  return [
    makeBubble(GW * 0.3, GH - WALL - BUBBLE_CONFIG.large.r - 1,  BUBBLE_CONFIG.large.speed, 'large'),
    makeBubble(GW * 0.7, GH - WALL - BUBBLE_CONFIG.large.r - 1, -BUBBLE_CONFIG.large.speed, 'large'),
  ]
}
