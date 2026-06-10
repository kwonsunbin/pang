// ── Canvas / Map ───────────────────────────────────────────────────────────────
export const GW   = 800
export const GH   = 560
export const WALL = 20

// ── Player ─────────────────────────────────────────────────────────────────────
export const PLAYER_W        = 40
export const PLAYER_H        = 50
export const PLAYER_SPEED    = 5
export const PLAYER_HIT_R    = 18
export const INVINCIBLE_FRAMES = 120

// ── Wire ───────────────────────────────────────────────────────────────────────
export const WIRE_SPEED = 10

// ── Physics ────────────────────────────────────────────────────────────────────
export const GRAVITY  = 0.35
export const PEAK_H   = GH - WALL * 2 - 30
export const JUMP_VY  = -Math.sqrt(2 * GRAVITY * PEAK_H)

// ── Countdown ──────────────────────────────────────────────────────────────────
export const COUNTDOWN_FRAMES = 70
export const GO_FRAMES        = 50

// ── Bubble base values (미션 속도 배율 미적용) ──────────────────────────────────
export const BUBBLE_RADII = { large: 36, medium: 22, small: 13 } as const
export const BUBBLE_BASE_SPEEDS = { large: 2.2, medium: 2.8, small: 3.4 } as const

// BUBBLE_CONFIG: split 물리에서 사용. Mission 1 기준(0.7x) 속도로 고정
export const MISSION1_SPEED = 0.7

export const BUBBLE_CONFIG = {
  large:  { r: BUBBLE_RADII.large,  speed: BUBBLE_BASE_SPEEDS.large  * MISSION1_SPEED },
  medium: { r: BUBBLE_RADII.medium, speed: BUBBLE_BASE_SPEEDS.medium * MISSION1_SPEED },
  small:  { r: BUBBLE_RADII.small,  speed: BUBBLE_BASE_SPEEDS.small  * MISSION1_SPEED },
} as const

export const BUBBLE_COLORS = {
  large:  '#ef4444',
  medium: '#f97316',
  small:  '#a78bfa',
} as const
