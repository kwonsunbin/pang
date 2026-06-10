import type { BUBBLE_CONFIG } from './constants'

export type BubbleSize = keyof typeof BUBBLE_CONFIG

export interface Bubble {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: BubbleSize
  r: number
}

export interface Wire {
  x: number
  y: number
  active: boolean
}

export type Overlay = 'none' | 'gameover' | 'clear'
