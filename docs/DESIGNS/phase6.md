# Phase 6 설계 문서 — Mission 1 완성 & 전체 마무리

## 목표
Mission 1 공식 설정을 정확히 반영하고, 게임 시작 연출·결과 화면·전체 UX 흐름을 다듬어 완성된 1스테이지 게임을 만든다.

---

## Mission 1 공식 설정 적용

`docs/FEATURES/mission1.md` 기준:

| 항목 | 값 |
|---|---|
| 초기 방울 | Large 2개 |
| 이동 속도 | 기본 속도의 70% |
| 장애물 | 없음 |
| 목숨 | 3개 |
| 제한 시간 | 없음 |
| 와이어 동시 발사 | 1개 |

속도 조정 (실제 구현):

```ts
const MISSION1_SPEED = 0.7

const BUBBLE_CONFIG = {
  large:  { r: 36, speed: 2.2 * MISSION1_SPEED },
  medium: { r: 22, speed: 2.8 * MISSION1_SPEED },
  small:  { r: 13, speed: 3.4 * MISSION1_SPEED },
}
```

---

## 게임 시작 카운트다운

게임 필드가 렌더된 직후 "3 → 2 → 1 → GO!" 카운트다운을 Canvas 위에 표시.
카운트다운 중에는 플레이어 입력 및 와이어 발사 차단.

### 구현 상수

```ts
const COUNTDOWN_FRAMES = 70   // "3" / "2" / "1" 각각 70프레임 (~1.17초)
const GO_FRAMES        = 50   // "GO!" 50프레임 (~0.83초)
```

### 카운트다운 ref

```ts
const countdownStep  = useRef(3)              // 3 → 2 → 1 → 0(GO!) → -1(playing)
const countdownTimer = useRef(COUNTDOWN_FRAMES)
```

### 매 프레임 처리

```ts
const inCountdown = countdownStep.current >= 0

if (inCountdown) {
  countdownTimer.current--
  if (countdownTimer.current <= 0) {
    countdownStep.current--
    countdownTimer.current = countdownStep.current === 0 ? GO_FRAMES : COUNTDOWN_FRAMES
  }
}
```

### 렌더 (스케일 애니메이션 포함)

```ts
const step = countdownStep.current
const text = step > 0 ? String(step) : 'GO!'
// 숫자: 시간이 흐를수록 작아짐 / GO!: 나타날 때 약간 크게
const scale = step > 0
  ? 1 + (1 - progress) * 0.3
  : 1 + progress * 0.15

ctx.save()
ctx.translate(GW / 2, GH / 2)
ctx.scale(scale, scale)
ctx.font = 'bold 110px monospace'
ctx.fillStyle = step > 0 ? '#facc15' : '#4ade80'  // 숫자=노랑, GO!=초록
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText(text, 0, 0)
ctx.restore()
```

---

## HUD 최종 구성

플레이필드(WALL 안쪽) 상단에 Canvas로 직접 렌더.

```
┌─────────────────────────────────────────────────────┐  ← WALL(20px)
│  ♥ ♥ ♥        MISSION 1              방울 N         │  y = WALL + 22
├─────────────────────────────────────────────────────┤
│                                                     │
│                  게임 필드                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

| HUD 요소 | 위치 | 내용 | 색상 |
|---|---|---|---|
| 목숨 ♥ | 좌상단 | ♥ × livesRef.current | `#ef4444` |
| 미션명 | 중앙 상단 | "MISSION 1" | `#94a3b8` |
| 남은 방울 | 우상단 | `방울 N` (현재 개수) | `#94a3b8` |

---

## 결과 화면

### Mission Clear
```
┌──────────────────────┐
│   MISSION CLEAR!     │  ← text-yellow-400
│                      │
│  [ 다시 시작 ]        │  ← bg-yellow-400
│  [ 메인으로  ]        │  ← border-gray-500
└──────────────────────┘
```

### Game Over
```
┌──────────────────────┐
│     GAME OVER        │  ← text-red-500
│                      │
│  [ 다시 시작 ]        │
│  [ 메인으로  ]        │
└──────────────────────┘
```

---

## 전체 UX 흐름

```
메인 화면
  └─[게임 시작]─► 카운트다운 (3→2→1→GO!, 약 3.7초)
                    └─► 게임 플레이
                          ├─ 방울 전멸 ─► Mission Clear ─► [다시시작] → 카운트다운
                          │                              └► [메인으로] → 메인 화면
                          └─ 목숨 소진 ─► Game Over    ─► [다시시작] → 카운트다운
                                                         └► [메인으로] → 메인 화면
```

`resetGame()` 호출 시 `countdownStep`·`countdownTimer`도 초기화되어 다시 시작해도 카운트다운부터 시작.

---

## 체크리스트 (완성 기준)

- [x] Mission 1 속도(70%) 적용
- [x] 카운트다운 3→2→1→GO! 연출 (스케일 애니메이션 포함)
- [x] HUD — 목숨 / 미션명 / 남은 방울 수 표시
- [x] Mission Clear 화면 → 다시 시작 / 메인 이동
- [x] Game Over 화면 → 다시 시작 / 메인 이동
- [x] 메인 → 게임 → 결과 → 메인 전체 루프 완성
- [x] 다시 시작 시 카운트다운부터 재개
