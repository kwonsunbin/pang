# Refactoring Phase 6 — 미션 시스템 일반화 ✅ 완료

## 현재 문제

미션 설정이 코드 여러 곳에 흩어져 있다.

```ts
// constants.ts (또는 GameScreen.tsx)
const MISSION1_SPEED = 0.7
const BUBBLE_CONFIG = { large: { speed: 2.2 * 0.7 }, ... }

// bubbles.ts
export function initialBubbles() {
  return [
    makeBubble(GW * 0.3, ..., 'large'),   // ← 미션 1 하드코딩
    makeBubble(GW * 0.7, ..., 'large'),
  ]
}
```

### 문제점
- 미션 2를 추가하려면 `constants.ts`, `bubbles.ts`, `GameScreen.tsx`를 모두 수정해야 함
- 어떤 코드가 "미션 1 전용"인지 구분이 안 됨
- 난이도(Easy / Normal / Hard)를 독립적으로 정의할 방법이 없음

---

## 목표

미션 설정을 `src/missions/` 디렉토리로 분리하여 새 미션을 **파일 1개 추가**로 만들 수 있는 구조를 만든다.

---

## 대상 파일

### `src/missions/types.ts` (신규)

```ts
import type { Bubble } from '../game/types'

export interface MissionConfig {
  id: number
  name: string                         // HUD 표시 이름 (예: "MISSION 1")
  speedScale: number                   // 방울 속도 배율
  lives: number
  initialBubbles: () => Bubble[]       // 초기 방울 배치 함수
}
```

### `src/missions/mission1.ts` (신규)

```ts
import { makeBubble } from '../game/bubbles'
import { GW, GH, WALL, BUBBLE_CONFIG } from '../game/constants'
import type { MissionConfig } from './types'

export const mission1: MissionConfig = {
  id: 1,
  name: 'MISSION 1',
  speedScale: 0.7,
  lives: 3,
  initialBubbles: () => [
    makeBubble(GW * 0.3, GH - WALL - BUBBLE_CONFIG.large.r - 1,  BUBBLE_CONFIG.large.speed, 'large'),
    makeBubble(GW * 0.7, GH - WALL - BUBBLE_CONFIG.large.r - 1, -BUBBLE_CONFIG.large.speed, 'large'),
  ],
}
```

### `src/missions/index.ts` (신규)

```ts
export { mission1 } from './mission1'
```

### `useGameLoop.ts` 변경

```ts
// before: 하드코딩
livesRef.current = 3
bubblesRef.current = initialBubbles()

// after: 미션 설정 주입
export function useGameLoop(mission: MissionConfig, onBack: () => void) {
  livesRef.current   = mission.lives
  bubblesRef.current = mission.initialBubbles()
  // HUD의 미션명도 mission.name으로 대체
}
```

### `App.tsx` 변경

```ts
import { mission1 } from './missions'

// GameScreen에 mission prop 전달
<GameScreen mission={mission1} onBack={() => setScreen('main')} />
```

---

## 미션 2 추가 예시 (리팩토링 완료 후)

```ts
// src/missions/mission2.ts 파일 1개만 추가
export const mission2: MissionConfig = {
  id: 2,
  name: 'MISSION 2',
  speedScale: 1.0,
  lives: 3,
  initialBubbles: () => [
    makeBubble(GW * 0.2, ..., 'large'),
    makeBubble(GW * 0.5, ..., 'large'),
    makeBubble(GW * 0.8, ..., 'medium'),
  ],
}
```

`useGameLoop`, `GameScreen`, `constants`는 수정 불필요.

---

## 변경 범위

| 파일 | 작업 |
|---|---|
| `src/missions/types.ts` | 신규 생성 |
| `src/missions/mission1.ts` | 신규 생성 |
| `src/missions/index.ts` | 신규 생성 |
| `src/game/useGameLoop.ts` | `mission` 파라미터 수용 |
| `src/game/constants.ts` | `MISSION1_SPEED` 상수 제거 (mission1.ts로 이동) |
| `src/App.tsx` | mission1 import 및 GameScreen에 전달 |

---

## 전체 리팩토링 완료 후 최종 구조

```
src/
  App.tsx
  screens/
    MainScreen.tsx
    GameScreen.tsx           (~30줄)
  game/
    constants.ts
    types.ts
    bubbles.ts
    physics.ts
    renderer.ts
    useGameLoop.ts
  missions/
    types.ts
    index.ts
    mission1.ts
    mission2.ts              ← 파일 1개 추가로 미션 확장
```
