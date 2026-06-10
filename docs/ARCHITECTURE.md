# ARCHITECTURE.md — PANG 아키텍처 개요

## 기술 스택

| 역할 | 기술 |
|---|---|
| UI 프레임워크 | React 19 (함수형 컴포넌트 + Hooks) |
| 언어 | TypeScript 5.6 |
| 빌드 도구 | Vite 6 |
| 스타일링 | Tailwind CSS 3 |
| 게임 렌더링 | HTML5 Canvas API |

---

## 디렉토리 구조

```
pang/
├── src/
│   ├── main.tsx              # React 진입점 — App을 #root에 마운트
│   ├── App.tsx               # 화면 라우터 (screen 상태 관리)
│   ├── index.css             # Tailwind 지시어
│   └── screens/
│       ├── MainScreen.tsx    # 메인 화면 UI (타이틀, 버튼, 오버레이)
│       └── GameScreen.tsx    # 게임 루프 전체 (Canvas 렌더링)
├── docs/
│   ├── PRD.md                # 제품 요구사항 정의서
│   ├── PLAN.md               # Phase별 개발 계획
│   ├── ARCHITECTURE.md       # 이 문서 — 전체 아키텍처 개요
│   ├── FEATURES/             # 화면별 기능 명세
│   └── DESIGNS/              # Phase별 설계 문서 (phase1~6.md)
├── CLUADE.md                 # AI 작업 가이드 및 문서 인덱스
└── README.md                 # 로컬 실행 가이드
```

---

## 화면 전환 구조

React의 `useState`로 현재 화면을 관리한다. 라우터 라이브러리를 사용하지 않는다.

```
App.tsx
  screen === 'main' → <MainScreen onStart />
  screen === 'game' → <GameScreen onBack />
```

화면 전환은 `onStart` / `onBack` 콜백으로 `screen` 상태를 바꾸는 것이 전부다.  
페이지 이동이 아니라 컴포넌트 교체 방식이므로 URL이 바뀌지 않는다.

---

## 게임 루프 아키텍처

게임 로직은 전적으로 `GameScreen.tsx` 안에서 처리된다.

```
useEffect()
  ├── addEventListener (keydown / keyup)
  └── requestAnimationFrame(loop)
        loop():
          1. 상태 분기
             ├── inCountdown (countdownStep >= 0) → 카운트다운 진행, 입력 차단
             ├── playing     (overlay === 'none')  → 물리/충돌/승패 업데이트
             └── overlay     (gameover | clear)    → 업데이트 중단, Canvas만 렌더
          2. Canvas 렌더 — 배경 → 벽 → 와이어 → 방울 → 플레이어 → HUD → 카운트다운
          └── requestAnimationFrame(loop)  [재귀]
cleanup: cancelAnimationFrame + removeEventListener
```

### 왜 Canvas인가?

방울·플레이어·와이어가 매 프레임(60fps) 위치를 바꾸기 때문에 React 상태로 관리하면  
불필요한 DOM diff가 반복된다. Canvas는 직접 픽셀을 그리므로 게임 루프에 적합하다.

### 왜 useRef인가?

게임 상태(playerX, bubbles, wire 등)는 React 리렌더를 트리거할 필요가 없다.  
`useRef`로 보관하면 값이 바뀌어도 컴포넌트가 리렌더되지 않고,  
매 프레임 루프에서 직접 읽고 쓸 수 있어 클로저 문제도 없다.

```
useRef 관리 값   →  게임 루프 내에서만 읽고 씀  (Canvas 출력)
useState 관리 값 →  결과 오버레이 표시 등 React DOM이 반응해야 할 때만 사용
```

`overlay` 상태처럼 루프와 React DOM 양쪽에서 필요한 값은 **ref + state를 동시에 관리**한다.
루프 내 클로저에서 stale closure 없이 읽기 위해 `overlayRef`(ref)를 사용하고,
오버레이 컴포넌트 렌더를 트리거하기 위해 `setOverlay`(state setter)를 함께 호출한다.

```ts
function showOverlay(o: Overlay) {
  overlayRef.current = o   // 루프에서 읽는 값
  setOverlay(o)            // React 리렌더 트리거
}
```

---

## 오브젝트 데이터 모델

### Bubble

```ts
interface Bubble {
  id: number        // 분할 시 새 ID 부여
  x: number         // 중심 X
  y: number         // 중심 Y
  vx: number        // 수평 속도 (부호 = 방향)
  vy: number        // 수직 속도 (중력 누적)
  size: 'large' | 'medium' | 'small'
  r: number         // 반지름
}
```

### Wire

```ts
interface Wire {
  x: number         // 발사 X (플레이어 중앙, 고정)
  y: number         // 끝점 Y (매 프레임 위로 이동)
  active: boolean
}
```

---

## 물리 모델

### 중력

```
매 프레임: vy += GRAVITY (0.35)
```

### 균일 바닥 반사 높이

모든 크기의 방울이 동일한 최고 높이까지 튀어 오르도록,  
바닥 충돌 시 현재 vy와 무관하게 고정 속도를 덮어쓴다.

```
JUMP_VY = -sqrt(2 × GRAVITY × PEAK_H)
바닥 충돌 → vy = JUMP_VY  (항상 동일)
```

### 와이어 적중 판정

와이어는 수직선이므로 X축 범위 + Y 끝점으로 단순 판정:

```
hit = (b.x - b.r < w.x < b.x + b.r) AND (b.y - b.r < w.y < b.y + b.r)
```

---

## 키 입력 처리

```
keydown → keys.add(e.key)
keyup   → keys.delete(e.key)
```

`Set<string>`에 현재 눌린 키를 보관하고, 매 프레임 루프에서 읽는다.  
이벤트 기반이 아니라 **프레임 기반 폴링**이므로 키를 누르고 있으면 연속 이동한다.

---

## 문서 체계

```
README.md        "어떻게 실행하는가" — 로컬 실행 가이드
PRD.md           "무엇을 만드는가"  — 요구사항 기준
PLAN.md          "언제 무엇을"      — Phase별 목표 및 완료 현황
FEATURES/*.md    "어떻게 동작하는가" — 화면/기능 명세
DESIGNS/*.md     "어떻게 구현하는가" — 설계 결정 및 데이터 구조
ARCHITECTURE.md  "전체 구조"        — 이 문서
```
