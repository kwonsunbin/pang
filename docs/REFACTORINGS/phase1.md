# Refactoring Phase 1 — 타입 & 상수 분리 ✅ 완료

## 현재 문제

`GameScreen.tsx` 최상단에 상수와 타입이 혼재되어 있다.
파일이 길어질수록 "로직인지 설정인지" 구분이 어렵고,
미션 설정(MISSION1_SPEED 등)이 렌더링 코드와 같은 파일에 묶여 있다.

---

## 목표

상수·타입을 별도 파일로 분리하여 `GameScreen.tsx`가 **로직과 렌더링만** 담당하도록 한다.

---

## 대상 파일 및 이동 계획

### `src/game/constants.ts` (신규)

```ts
// 캔버스 / 맵
export const GW = 800
export const GH = 560
export const WALL = 20

// 플레이어
export const PLAYER_W = 40
export const PLAYER_H = 50
export const PLAYER_SPEED = 5
export const PLAYER_HIT_R = 18
export const INVINCIBLE_FRAMES = 120

// 와이어
export const WIRE_SPEED = 10

// 물리
export const GRAVITY = 0.35
export const PEAK_H = GH - WALL * 2 - 30
export const JUMP_VY = -Math.sqrt(2 * GRAVITY * PEAK_H)

// 카운트다운
export const COUNTDOWN_FRAMES = 70
export const GO_FRAMES = 50

// 미션 1
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
```

### `src/game/types.ts` (신규)

```ts
export type BubbleSize = 'large' | 'medium' | 'small'
export type Overlay = 'none' | 'gameover' | 'clear'

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
```

---

## 변경 범위

| 파일 | 작업 |
|---|---|
| `src/game/constants.ts` | 신규 생성 |
| `src/game/types.ts` | 신규 생성 |
| `src/screens/GameScreen.tsx` | 상수·타입 선언 제거, import로 대체 |

---

## 기대 효과

- `GameScreen.tsx` 상단 약 30줄 제거
- 미션 설정 변경 시 `constants.ts`만 수정하면 됨
- 타입을 다른 파일에서도 재사용 가능 (Phase 4 렌더러 분리 시 필요)
