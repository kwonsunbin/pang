# PANG KATA 프로젝트 가이드

## 프로젝트 개요
- **게임명:** PANG
- **장르:** 아케이드 (방울 격파)
- **기술 스택:** React + TypeScript + Vite + Tailwind CSS
---

## 주요 문서 목록

### 개발 계획 (PLAN)
| 파일 | 설명 |
|---|---|
| `docs/PLAN.md` | Phase별 개발 목표를 정의한 계획 문서 |

### PRD
| 파일 | 설명 |
|---|---|
| `docs/PRD.md` | 전체 제품 요구사항 정의서 (게임 오브젝트, 승패 조건, 제약사항) |

### 기능 명세 (FEATURES)
| 파일 | 설명 |
|---|---|
| `docs/FEATURES/main.md` | 메인 화면 UI 구성 및 전환 조건 |
| `docs/FEATURES/game_rule.md` | 전체 게임 룰 상세 (오브젝트, 분할 규칙, 조작키, 승패 조건) |
| `docs/FEATURES/mission1.md` | 미션 1 — 난이도(Easy), 맵 구성, 방울 배치, 클리어 조건 |

---

## 작업 원칙
1. 새로운 기능 문서를 추가할 경우 `docs/FEATURES/` 하위에 작성하고 이 파일의 목록에 등록한다.
2. 게임 로직 구현 시 반드시 `docs/PRD.md`와 해당 미션 문서를 먼저 확인한다.
3. 컴포넌트 파일은 `src/` 하위에 위치시키며, TypeScript(`.tsx`) 함수형 컴포넌트로 작성한다.
4. 구현 후 `npm run dev` 로 로컬 동작을 확인한다.

## 기술 스택 (Tech Stack)
- **Framework/Library:** React.js (Vite 기반)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (또는 기본 CSS / CSS Modules)

## 개발 및 빌드 명령어 (Commands)
- **의존성 설치:** `npm install`
- **로컬 서버 실행:** `npm run dev`
- **프로젝트 빌드:** `npm run build`
- **틴팅 및 검사 (선택):** `npm run lint`

## 코드 작성 지침 (Code Style & Guidelines)
- **언어 및 컴포넌트:** 모든 컴포넌트는 TypeScript(`.tsx`)로 작성하며, 함수형 컴포넌트와 Hooks를 사용합니다.
- **상태 관리:** 게임 루프 및 오브젝트 상태(Player, Bubble, Wire)는 React `useState`, `useEffect`, `useRef` 또는 필요 시 Canvas API를 활용하여 관리합니다.
- **간결성:** 불필요한 중복 코드를 지양하고, 파일 구조는 직관적이고 가볍게 유지합니다.
- **반복 검증:** 기능을 구현할 때마다 로컬 서버(`npm run dev`)에서 정상 동작하는지 인간 감독관(User)이 검증할 수 있도록 단계를 나누어 개발합니다.