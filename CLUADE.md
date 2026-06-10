# PANG KATA 프로젝트 가이드

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