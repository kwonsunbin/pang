import { GW, GH, WALL, BUBBLE_CONFIG } from '../game/constants'
import { makeBubble } from '../game/bubbles'
import type { MissionConfig } from './types'

export const mission1: MissionConfig = {
  id: 1,
  name: 'MISSION 1',
  lives: 3,
  initialBubbles: () => [
    makeBubble(GW * 0.3, GH - WALL - BUBBLE_CONFIG.large.r - 1,  BUBBLE_CONFIG.large.speed, 'large'),
    makeBubble(GW * 0.7, GH - WALL - BUBBLE_CONFIG.large.r - 1, -BUBBLE_CONFIG.large.speed, 'large'),
  ],
}
