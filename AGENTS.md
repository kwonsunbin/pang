# AGENTS.md — PANG 프로젝트 AI 작업 가이드

이 파일은 AI 에이전트(Claude 등)가 본 프로젝트를 작업할 때 참고해야 할 문서 구조와 규칙을 정의합니다.

---

## 프로젝트 개요
- **게임명:** PANG
- **장르:** 아케이드 (방울 격파)
- **기술 스택:** React + TypeScript + Vite + Tailwind CSS
- **핵심 참고 문서:** `docs/PRD.md`

---

## 주요 문서 목록

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
