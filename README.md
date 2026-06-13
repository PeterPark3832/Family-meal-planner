# 🍽️ 우리 가족 식단 플래너

가족 구성원·취향·알레르기에 맞는 **주간~월간 식단을 자동 생성**해주는 PWA 앱입니다.  
설치 없이 브라우저에서 즉시 사용 가능하며, 홈 화면에 추가해 앱처럼 실행할 수 있습니다.

👉 **[바로 사용하기](https://peterpark3832.github.io/Family-meal-planner/)**

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 👨‍👩‍👧‍👦 가족 구성원 설정 | 1~5명, 성인/자녀 구분, 성별·나이 입력 |
| 📅 기간 선택 | 1주 / 2주 / 3주 / 한 달 / 직접 입력 (최대 90일) |
| 🍚 요리 종류 | 한식 / 양식 / 중식 / 일식 (중복 선택 가능) |
| 🌸 제철 재료 부스트 | 계절에 맞는 메뉴 우선 추천 |
| ⚡ 빠른 조리 모드 | 30분 이내 완성 메뉴만 필터 |
| 🚫 알레르기 필터 | 견과류·갑각류·유제품 등 8가지 알레르기 제외 |
| 🎲 개별 재생성 | 마음에 안 드는 메뉴만 주사위 클릭으로 교체 |
| ✏️ 직접 입력 | 원하는 메뉴 자유 입력 + 메모 추가 |
| 📋 레시피 내장 | 50종 레시피 탭 내 제공 (나머지는 외부 검색 연결) |
| 📊 요리 분포 | 한식/양식/중식/일식 비율 시각화 |
| 🛒 장보기 목록 | 메뉴 기반 재료 자동 추출, 쿠팡 바로가기 연동 |
| 📤 가족 공유 | URL 링크 한 번으로 식단 공유 (Web Share API / 클립보드 복사) |
| 💾 자동 저장 | LocalStorage 자동 저장·복원, 식단 템플릿 저장 |
| ⭐ 식단 평가 | 좋아요/싫어요 누적 → 다음 추천에 반영 |
| 📱 PWA | 홈 화면 추가·오프라인 지원, iOS Safari·Android Chrome 지원 |

---

## 🧠 스마트 추천 알고리즘

- **평가 가중치**: 좋아요/싫어요 누적 기록이 다음 생성에 반영 (`ratedShuffleBalanced`)
- **영양 다양성**: 단백질·채소·탄수화물·균형식을 일주일 내 고르게 배분
- **계절 부스트**: 봄/여름/가을/겨울 제철 메뉴에 가중치 부여
- **요리 연속 방지**: 같은 요리 유형이 3일 이상 연속되지 않도록 제어
- **자녀 나이 필터**: 맵거나 자극적인 음식은 어린 자녀가 있으면 자동 제외
- **주간 중복 최소화**: 동일 주 안에서 같은 메뉴 반복 억제

---

## 🍽️ 메뉴 데이터베이스

총 **207가지** 집에서 해먹기 좋은 메뉴 수록

| 분류 | 수량 | 대표 메뉴 |
|------|------|-----------|
| 🇰🇷 한식 | 80종 | 김치찌개, 된장찌개, 불고기, 갈비탕, 삼계탕, 잡채, 김밥, 닭강정 외 |
| 🍝 양식 | 44종 | 크림파스타, 토마토파스타, 아보카도토스트, 치킨카레, 버거, 브런치플레이트 외 |
| 🥢 중식 | 24종 | 짜장면, 탕수육, 마파두부, 계란볶음밥, 깐쇼새우, 두반장두부 외 |
| 🍱 일식 | 30종 | 우동, 돈카츠, 오야코동, 라멘, 오니기리, 낫토덮밥, 아부라소바 외 |

---

## 📱 PWA 설치 방법

**Android (Chrome)**  
브라우저 하단에 표시되는 _"홈 화면에 추가"_ 배너를 탭하거나,  
메뉴 → _"앱 설치"_ 를 선택합니다.

**iOS (Safari)**  
Safari 하단 공유 버튼(⬆️) → _"홈 화면에 추가"_ → 추가를 탭합니다.

---

## 📤 가족 공유

식단 화면에서 **공유** 버튼을 누르면 현재 설정·식단 전체가 URL로 인코딩됩니다.  
링크를 받은 가족이 해당 URL을 열면 식단이 자동으로 불러와집니다.

카카오 공유는 Kakao JS SDK 연동 후 활성화됩니다. → [설정 가이드](docs/KAKAO_SETUP.md)

---

## 🚀 로컬 개발

```bash
git clone https://github.com/PeterPark3832/Family-meal-planner.git
cd Family-meal-planner
npm install
npm run dev        # 개발 서버 시작 (http://localhost:5173)
npm run build      # 프로덕션 빌드 → dist/
npm test           # Vitest 단위 테스트
npm run lint       # ESLint 검사
```

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| UI 프레임워크 | React 18 |
| 스타일링 | Tailwind CSS v3 + PostCSS |
| 번들러 | Vite |
| 테스트 | Vitest |
| 데이터 영속성 | LocalStorage |
| 배포 | GitHub Actions → GitHub Pages |
| PWA | Web App Manifest + Service Worker |
| 분석 | Google Analytics 4 |

---

## 🗂️ 프로젝트 구조

```
Family-meal-planner/
├── vite-entry.html         # HTML 엔트리 (PWA 메타태그 포함)
├── manifest.json           # PWA 앱 매니페스트
├── sw.js                   # Service Worker (오프라인 지원)
├── src/
│   ├── main.jsx            # React 진입점
│   ├── App.jsx             # 최상위 상태 관리, PWA 설치 배너
│   ├── components/         # 화면 컴포넌트
│   │   ├── SetupScreen.jsx
│   │   ├── PlanScreen.jsx
│   │   ├── MobilePlanView.jsx
│   │   ├── RecipeModal.jsx
│   │   ├── ShoppingListModal.jsx
│   │   └── ...
│   ├── data/               # 정적 데이터 (메뉴·영양·레시피)
│   │   ├── meals.js        # 207종 메뉴 DB
│   │   ├── nutrition.js    # 영양 유형·계절·조리 시간 메타
│   │   └── recipes.js      # 50종 내장 레시피
│   ├── utils/
│   │   ├── algorithm.js    # 식단 생성 알고리즘
│   │   └── shareUtils.js   # URL 공유 인코딩/디코딩
│   └── i18n/               # 다국어 (현재 한국어 단일)
├── docs/
│   ├── ARCHITECTURE.md     # 시스템 아키텍처
│   └── KAKAO_SETUP.md      # 카카오 공유 설정 가이드
├── CHANGELOG.md
├── CONTRIBUTING.md
└── PRIVACY.md
```

---

## 🔒 개인정보 보호

입력된 가족 구성원 정보와 식단 데이터는 **브라우저 LocalStorage에만 저장**됩니다.  
외부 서버로 전송되거나 수집되지 않으며, 브라우저 캐시 삭제 시 함께 삭제됩니다.

자세한 내용은 [개인정보처리방침](PRIVACY.md)을 참조하세요.

---

## 🤝 기여하기

메뉴 추가, 버그 수정, 기능 제안 등 모든 기여를 환영합니다.  
[CONTRIBUTING.md](CONTRIBUTING.md)에서 기여 방법을 확인하세요.

---

## 📝 라이선스

MIT License © 2025 PeterPark3832
