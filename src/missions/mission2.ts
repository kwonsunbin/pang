import { GW, GH, WALL, BUBBLE_RADII, BUBBLE_BASE_SPEEDS } from '../game/constants'
import { makeBubble } from '../game/bubbles'
import type { MissionConfig } from './types'

// Mission 2: Large 3개, 기본 속도(1.0x) — Mission 1보다 방울이 많고 빠름
// 화면 중단(GH * 0.3)에서 시작 → 플레이어 시작 위치와 겹치지 않음
const START_Y = GH * 0.3

export const mission2: MissionConfig = {
  id: 2,
  name: 'MISSION 2',
  lives: 3,
  initialBubbles: () => [
    makeBubble(GW * 0.2, START_Y,  BUBBLE_BASE_SPEEDS.large, 'large'),
    makeBubble(GW * 0.5, START_Y, -BUBBLE_BASE_SPEEDS.large, 'large'),
    makeBubble(GW * 0.8, START_Y,  BUBBLE_BASE_SPEEDS.large, 'large'),
  ],
}
