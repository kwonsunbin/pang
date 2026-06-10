import type { Bubble } from '../game/types'

export interface MissionConfig {
  id: number
  name: string
  lives: number
  initialBubbles: () => Bubble[]
}
