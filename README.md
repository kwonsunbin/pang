# PANG

> 튀어 다니는 방울을 와이어로 쏴서 모두 터뜨리는 아케이드 게임

---

## 실행 방법

### 필요한 것

- [Node.js](https://nodejs.org) 18 버전 이상
- npm (Node.js 설치 시 같이 설치됩니다)

버전 확인:
```bash
node -v   # v18 이상이면 OK
npm -v
```

### 설치 & 실행

```bash
# 1. 저장소 클론
git clone https://github.com/kwonsunbin/pang.git
cd pang

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

터미널에 아래와 같은 메시지가 뜨면 성공입니다:

```
  VITE v6.x.x  ready in ...ms

  ➜  Local:   http://localhost:5173/
```

브라우저에서 **http://localhost:5173** 을 열면 게임이 실행됩니다.

---

## 조작법

| 키 | 동작 |
|---|---|
| `←` `→` | 플레이어 좌우 이동 |
| `Space` | 와이어 발사 |

---

## 게임 방법

1. 메인 화면에서 미션을 선택합니다.
   - **MISSION 1 (Easy):** Large 방울 2개, 속도 70% — 입문용
   - **MISSION 2 (Normal):** Large 방울 3개, 속도 100% — 도전용
2. 방향키로 플레이어를 움직이고, Space로 와이어를 발사합니다.
3. 와이어로 방울을 맞히면 작은 방울로 분열됩니다.
4. 가장 작은 방울은 터뜨리면 사라집니다.
5. **모든 방울을 제거하면 클리어!**
6. 방울에 3번 맞으면 Game Over입니다.

---

## 기타 명령어

```bash
npm run build    # 프로덕션 빌드 (dist/ 폴더에 생성)
npm run preview  # 빌드 결과물 미리보기
npm run lint     # 코드 검사
```

---

## 기술 스택

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- HTML5 Canvas API

## 문서

- [PRD](docs/PRD.md) — 게임 요구사항
- [PLAN](docs/PLAN.md) — Phase별 개발 계획
- [ARCHITECTURE](docs/ARCHITECTURE.md) — 아키텍처 설명
