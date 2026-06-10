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

// ── Mission 1 ──────────────────────────────────────────────────────────────────
export const MISSION1_SPEED = 0.7

export const BUBBLE_CONFIG = {
  large:  { r: 36, speed: 2.2 * MISSION1_SPEED },
  medium: { r: 22, speed: 2.8 * MISSION1_SPEED },
  small:  { r: 13, speed: 3.4 * MISSION1_SPEED },
} as const

export const BUBBLE_COLORS = {
  large:  '#ef4444',
  medium: '#f97316',
  small:  '#a78bfa',
} as const
