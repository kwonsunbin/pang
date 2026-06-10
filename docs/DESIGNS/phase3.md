# Phase 3 설계 문서 — 와이어 발사

## 목표
Space 키로 와이어를 발사하고, 천장에 닿으면 소멸시킨다. 동시에 1개만 존재한다.

---

## 와이어 상태

```ts
interface Wire {
  x: number      // 발사 X 좌표 (플레이어 중앙)
  y: number      // 와이어 선 끝점 Y (위로 이동)
  active: boolean
}

const wire = useRef<Wire>({ x: 0, y: 0, active: false })
```

`useRef`로 관리 → 리렌더 없이 매 프레임 직접 읽고 씀

---

## 발사 조건

```ts
if (e.key === ' ' && !wire.current.active) {
  wire.current = {
    x: playerX.current + PLAYER_W / 2,  // 플레이어 정중앙
    y: GH - WALL - PLAYER_H,            // 플레이어 머리 위
    active: true,
  }
}
```

- `active === true`인 동안 Space 입력 무시 → **동시 1개 제한**

---

## 와이어 이동 & 소멸

```ts
const WIRE_SPEED = 10   // px/frame (60fps 기준 약 600px/s)

if (w.active) {
  w.y -= WIRE_SPEED
  if (w.y <= WALL) w.active = false   // 천장 도달 시 소멸
}
```

---

## 와이어 렌더링

플레이어 상단부터 현재 끝점까지 선으로 표현:

```ts
ctx.strokeStyle = '#facc15'
ctx.lineWidth = 3
ctx.moveTo(w.x, PLAYER_Y)   // 발사 기준점 (플레이어 위치 고정)
ctx.lineTo(w.x, w.y)         // 현재 끝점 (위로 이동 중)
```

와이어 폭: 3px / 색상: yellow-400

---

## 와이어 생명주기

```
[inactive] ──Space키──► [active: 위로 이동 중]
                              │
                    천장 도달 or 방울 적중
                              │
                         [inactive]
```

방울 적중에 의한 소멸은 Phase 4에서 처리.
