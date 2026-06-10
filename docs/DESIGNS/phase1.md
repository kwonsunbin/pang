# Phase 1 설계 문서 — 메인 화면 & 화면 전환

## 목표
게임 진입점이 되는 메인 화면을 구성하고, 화면 간 전환 구조를 잡는다.

---

## 파일 구조

```
src/
  App.tsx               ← 화면 상태(screen) 관리, 라우팅 역할
  screens/
    MainScreen.tsx      ← 메인 화면 UI + 오버레이
    GameScreen.tsx      ← 게임 화면 (Phase 1에서는 플레이스홀더)
```

---

## 화면 상태 관리 (App.tsx)

```ts
type Screen = 'main' | 'game'
const [screen, setScreen] = useState<Screen>('main')
```

- `screen === 'main'` → `<MainScreen onStart={...} />` 렌더
- `screen === 'game'` → `<GameScreen onBack={...} />` 렌더
- 화면 전환은 상태 변경만으로 처리 (라우터 미사용)

---

## MainScreen 구성 요소

| 요소 | 설명 |
|---|---|
| 타이틀 | `"PANG"` — `text-8xl font-extrabold text-yellow-400` |
| 슬로건 | `"모든 방울을 터뜨려라!"` |
| 게임 시작 버튼 | `onStart()` 호출 → screen을 `'game'`으로 전환 |
| 조작 방법 버튼 | `showOverlay` 상태를 `true`로 전환 |

---

## 조작 방법 오버레이

- `showOverlay: boolean` 로컬 상태로 관리
- 닫기 방법 3가지:
  1. 닫기 버튼 클릭
  2. 오버레이 바깥 영역 클릭 (`onClick` on backdrop)
  3. ESC 키 — `EscListener` 헬퍼 컴포넌트가 `window.addEventListener('keydown')` 등록/해제

```tsx
function EscListener({ onEsc }) {
  useState(() => {
    const handler = (e) => { if (e.key === 'Escape') onEsc() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
  return null
}
```

> `useState`의 초기화 함수(lazy initializer)를 이용해 마운트/언마운트 시 리스너를 등록·해제한다. cleanup이 필요 없는 단순 케이스라 `useEffect` 대신 사용.

---

## 스타일 방침

- 전체 배경: `bg-gray-900` (다크 테마)
- 강조색: `text-yellow-400` / `bg-yellow-400`
- Tailwind CSS만 사용, 별도 CSS 파일 없음
