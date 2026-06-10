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

속도 조정:

```ts
// Phase 4의 BUBBLE_CONFIG를 미션별로 배율 적용
const MISSION1_SPEED_SCALE = 0.7

const BUBBLE_CONFIG = {
  large:  { r: 36, speed: 2.2 * MISSION1_SPEED_SCALE },
  medium: { r: 22, speed: 2.8 * MISSION1_SPEED_SCALE },
  small:  { r: 13, speed: 3.4 * MISSION1_SPEED_SCALE },
}
```

---

## 게임 시작 카운트다운

게임 필드가 렌더된 직후 "3 → 2 → 1 → GO!" 카운트다운을 Canvas 위에 표시.  
카운트다운 중에는 플레이어 입력 차단 (`status === 'countdown'`).

```ts
type GameStatus = 'countdown' | 'playing' | 'dead' | 'clear' | 'gameover'

// 카운트다운: 1초 간격 (60프레임)
countdownTimer.current -= 1
if (countdownTimer.current <= 0) {
  countdownStep.current--   // 3 → 2 → 1 → GO → playing
}
```

렌더:
```ts
ctx.font = 'bold 96px monospace'
ctx.fillStyle = '#facc15'
ctx.fillText(countdownText, GW/2, GH/2)   // 화면 중앙
```

---

## HUD 최종 구성

```
┌─────────────────────────────────────────────────────┐
│  ♥ ♥ ♥          MISSION 1           [남은 방울 수]  │  ← Canvas 상단 벽 위
├─────────────────────────────────────────────────────┤
│                                                     │
│                  게임 필드                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

| HUD 요소 | 위치 | 내용 |
|---|---|---|
| 목숨 | 좌상단 (WALL 내) | ♥ 아이콘 × 남은 목숨 수 |
| 미션명 | 상단 중앙 | "MISSION 1" |
| 남은 방울 | 우상단 | 현재 방울 수 / 초기 방울 수 |

---

## 결과 화면 상세 (Phase 5에서 골격 완성 후 다듬기)

### Mission Clear
```
┌──────────────────────┐
│   MISSION CLEAR! 🎉  │
│                      │
│  [ 다시 시작 ]        │
│  [ 메인으로  ]        │
└──────────────────────┘
```

### Game Over
```
┌──────────────────────┐
│     GAME OVER        │
│                      │
│  [ 다시 시작 ]        │
│  [ 메인으로  ]        │
└──────────────────────┘
```

---

## 전체 UX 흐름 점검

```
메인 화면
  └─[게임 시작]─► 카운트다운(3초)
                    └─► 게임 플레이
                          ├─ 방울 전멸 ─► Mission Clear ─► [다시시작/메인]
                          └─ 목숨 소진 ─► Game Over    ─► [다시시작/메인]
```

모든 화면 전환에서:
- 이전 게임 루프 `cancelAnimationFrame` 완전 정리
- 키 이벤트 리스너 제거
- 게임 상태 완전 초기화 (playerX, wire, bubbles, lives, invincible, status)

---

## 체크리스트 (완성 기준)

- [ ] Mission 1 속도(70%) 적용 확인
- [ ] 카운트다운 3초 연출
- [ ] HUD — 목숨/미션명/남은 방울 표시
- [ ] Mission Clear 화면 → 다시 시작 / 메인 이동
- [ ] Game Over 화면 → 다시 시작 / 메인 이동
- [ ] 메인 → 게임 → 결과 → 메인 전체 루프 2회 이상 반복 플레이 확인
- [ ] 브라우저 탭 전환 시 루프 정지 (Page Visibility API 또는 requestAnimationFrame 자연 동작 확인)
