# Phase 2 설계 문서 — 게임 필드 & 플레이어 이동

## 목표
Canvas 기반 게임 루프를 구축하고, 키보드로 조작 가능한 플레이어를 화면 하단에 배치한다.

---

## 렌더링 방식: Canvas API

React의 DOM 렌더링 대신 `<canvas>` + `requestAnimationFrame` 루프를 채택한다.

**이유:**
- 이후 Phase에서 물리 연산(중력, 충돌)을 매 프레임 처리해야 함
- React 상태로 방울 수십 개의 위치를 관리하면 불필요한 리렌더 발생
- Canvas는 프레임당 직접 픽셀을 그리므로 게임 루프에 최적

---

## 게임 좌표계

```
(0,0) ───────────────► x  (GW = 800)
  │
  │   WALL=20px (상/하/좌/우 공통)
  │
  ▼ y  (GH = 560)
```

| 상수 | 값 | 설명 |
|---|---|---|
| `GW` | 800 | 캔버스 너비 |
| `GH` | 560 | 캔버스 높이 |
| `WALL` | 20 | 벽 두께 (px) |
| `PLAYER_W` | 40 | 플레이어 너비 |
| `PLAYER_H` | 50 | 플레이어 높이 |
| `PLAYER_SPEED` | 5 | 프레임당 이동 거리 (px) |

플레이어 Y 좌표는 고정: `PLAYER_Y = GH - WALL - PLAYER_H`

---

## 게임 루프 구조 (useEffect 내부)

```
useEffect → requestAnimationFrame(loop)
  loop():
    1. 키 입력 읽기 → playerX 갱신
    2. ctx.clearRect → 배경/벽 그리기
    3. 플레이어 그리기
    4. requestAnimationFrame(loop) 재귀 호출
  cleanup: cancelAnimationFrame + removeEventListener
```

---

## 키 입력 처리

```ts
const keys = useRef<Set<string>>(new Set())
window.addEventListener('keydown', e => keys.current.add(e.key))
window.addEventListener('keyup',   e => keys.current.delete(e.key))
```

- `useState` 대신 `useRef`로 관리 → 상태 변경 없이 매 프레임 직접 읽음
- `ArrowLeft` / `ArrowRight` / `Space` 에 `e.preventDefault()` — 브라우저 스크롤 방지

---

## 플레이어 이동 경계

```ts
playerX.current = Math.max(WALL, Math.min(GW - WALL - PLAYER_W, playerX.current ± PLAYER_SPEED))
```

좌측 한계: `x ≥ WALL`  
우측 한계: `x ≤ GW - WALL - PLAYER_W`

---

## 플레이어 외형

머리(원) + 몸통(사각형)으로 단순 표현:

```ts
ctx.fillRect(px + 8, PLAYER_Y, PLAYER_W - 16, PLAYER_H - 10)  // 몸통
ctx.arc(px + PLAYER_W/2, PLAYER_Y + 4, 12, 0, Math.PI*2)      // 머리
```

색상: `#facc15` (yellow-400)
