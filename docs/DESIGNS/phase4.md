# Phase 4 설계 문서 — 방울 물리 & 분할

## 목표
중력과 반사를 적용한 방울 물리를 구현하고, 와이어 적중 시 분할/소멸 규칙을 처리한다.

---

## 방울 크기 설정

```ts
const BUBBLE_CONFIG = {
  large:  { r: 36, speed: 2.2 },
  medium: { r: 22, speed: 2.8 },
  small:  { r: 13, speed: 3.4 },
}
type BubbleSize = 'large' | 'medium' | 'small'
```

작을수록 반지름이 작고 수평 속도가 빠름.

---

## 방울 상태

```ts
interface Bubble {
  id: number      // 고유 식별자 (분할 시 새 ID 부여)
  x: number
  y: number
  vx: number      // 수평 속도 (부호로 방향 결정)
  vy: number      // 수직 속도 (중력 누적)
  size: BubbleSize
  r: number       // 반지름
}
```

---

## 물리 상수

| 상수 | 값 | 설명 |
|---|---|---|
| `GRAVITY` | 0.35 | 매 프레임 vy에 더해지는 가속도 |
| `PEAK_H` | `GH - WALL*2 - 30` | 방울이 도달하는 최고 높이 |
| `JUMP_VY` | `-sqrt(2 * GRAVITY * PEAK_H)` | 바닥 반사 시 적용되는 수직 속도 |

**균일 높이 보장 원리:**  
바닥 충돌 시 `vy`를 현재 속도와 무관하게 항상 `JUMP_VY`로 덮어씀  
→ 크기나 충돌 타이밍에 관계없이 모든 방울이 동일한 최고 높이에 도달

---

## 매 프레임 물리 업데이트

```
vy += GRAVITY          (중력 적용)
x  += vx
y  += vy

좌벽 충돌: x - r < WALL    → x = WALL + r,      vx = |vx|
우벽 충돌: x + r > GW-WALL → x = GW-WALL-r,    vx = -|vx|
천장 충돌: y - r < WALL    → y = WALL + r,      vy = |vy|
바닥 충돌: y + r >= GH-WALL → y = GH-WALL-r,   vy = JUMP_VY  ← 균일 높이
```

---

## 와이어 적중 판정

와이어는 수직선(x 고정, y 범위)이므로:

```ts
const hit =
  b.x - b.r < w.x && w.x < b.x + b.r   // 와이어 X가 방울 내부
  && w.y < b.y + b.r && w.y > b.y - b.r // 와이어 끝점 Y가 방울 내부
```

AABB가 아닌 원 중심 대신 X축 범위 + Y축 끝점으로 단순화.

---

## 분할 규칙

```
large  적중 → medium 2개 (vx = ±medium.speed, 현재 위치에서 생성)
medium 적중 → small  2개 (vx = ±small.speed)
small  적중 → 소멸 (새 방울 생성 없음)
```

적중한 방울은 루프 내 `continue`로 `next[]` 배열에 추가하지 않아 소멸.

---

## 방울 배열 관리 패턴

불변성 대신 매 프레임 새 배열을 만들어 교체:

```ts
const next: Bubble[] = []
for (const b of bubbles.current) {
  // 물리 업데이트...
  if (히트) { /* 분할 생성 후 continue */ }
  next.push(b)
}
bubbles.current = next
```

---

## 색상 구분

| 크기 | 색상 |
|---|---|
| large | `#ef4444` (red-500) |
| medium | `#f97316` (orange-500) |
| small | `#a78bfa` (violet-400) |

각 방울에 shine(반사광) 원 추가 → 입체감 표현
