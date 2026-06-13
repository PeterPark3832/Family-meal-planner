# Changelog

All notable changes to this project are documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2025-06

### Added
- **메뉴 DB 2.5배 확대** — 80종 → 207종 (한식 80, 양식 44, 중식 24, 일식 30)
- **내장 레시피** — `src/data/recipes.js` 신규, 50종 레시피를 앱 내 제공 (재료 + 조리 순서)
- **RecipeModal 탭 UI** — 내장 레시피 탭 / 외부 검색 탭 분리, 내장 레시피 없으면 검색 탭으로 자동 전환
- **가족 URL 공유** — `src/utils/shareUtils.js` 신규, 설정+식단을 URL-safe base64로 인코딩해 `?plan=` 파라미터로 공유
- **공유 토큰 파싱** — App.jsx 시작 시 `?plan=` 파라미터 감지 → 식단 즉시 복원
- **카카오 공유 스캐폴드** — PlanScreen에 `shareKakao()` 구현 (Kakao SDK 초기화 감지, 미연동 시 URL 공유로 fallback)
- **PWA 설치 배너 (Android)** — `beforeinstallprompt` 캡처 → App.jsx 하단 고정 배너, 영구 닫기(LocalStorage) 지원
- **iOS PWA 메타태그** — `apple-mobile-web-app-capable`, `status-bar-style`, `viewport-fit=cover`, `env(safe-area-inset-*)` 적용
- **30일 플랜 주간 탭 UI** — MobilePlanView에 주 선택 탭 추가, 14일 이상 플랜에서 7일씩 그룹화해 표시
- **제철 재료 부스트** — `seasonBoost` 옵션, 계절별 메뉴 가중치 적용
- **빠른 조리 필터** — `preferQuick` 옵션, 30분 이내 메뉴만 추천
- **알레르기 필터** — 견과류·갑각류·유제품 등 8가지 알레르기 제외 설정
- **nutrition.js** — 207종 메뉴 전체에 영양 유형(protein/veggie/carb/balanced), 계절, 조리 시간 메타 추가
- **쿠팡 광고 배지** — ShoppingListModal 재료/메뉴 쿠팡 링크에 `AD` / `광고` 배지 추가 (광고 고지 의무 준수)
- **manifest.json 개선** — `display_override`, `shortcuts`, `screenshots`, `categories`, `orientation` 추가
- **Service Worker 개선** — `fmp-v4`, navigate 요청 시 오프라인 fallback (캐시된 index.html 반환), stale-while-revalidate 패턴

### Changed
- **로컬 실행 방법** — `index.html` 직접 열기 → `npm run dev` (Vite dev server)
- **PlanScreen 툴바** — 백업/캘린더/인쇄 버튼 `hidden sm:flex` → `hidden lg:flex` (태블릿 오버플로 해소)
- **SetupScreen 반응형** — 패딩·폰트·스텝 인디케이터 모바일 최적화 (`py-10` → `py-6 sm:py-10` 등)
- **Toast** — `toast-bottom` 클래스로 변경, safe-area-inset 반영
- **Service Worker** 캐시 버전 `fmp-v3` → `fmp-v4`

### Fixed
- 30일 플랜에서 날짜 버튼이 한 줄에 30개 나열되던 UX 문제 (주간 탭으로 해결)
- 태블릿에서 PlanScreen 툴바 버튼이 화면 밖으로 밀리던 문제

---

## [1.2.0] — 2025 (초기 Vite 전환)

### Changed
- React 18 CDN + Babel Standalone → Vite + React 18 빌드 파이프라인 전환
- Tailwind CSS CDN → PostCSS + Tailwind v3 (JIT)
- GitHub Actions CI/CD 도입 (Vite 빌드 → dist/ → GitHub Pages 자동 배포)
- 단일 HTML 파일 구조 → `src/` 컴포넌트 분리 구조

### Added
- 식단 평가 (좋아요/싫어요) 기능
- 식단 템플릿 저장/불러오기
- 커스텀 메뉴 추가/삭제
- 장보기 목록 생성 (쿠팡 바로가기 포함)
- Google Analytics 4 연동
- Open Graph / Twitter Card 메타태그
- Schema.org WebApplication 구조화 데이터

---

## [1.0.0] — 2024 (초기 출시)

### Added
- 가족 구성원 설정 (1~5명, 성인/자녀 구분)
- 기간 선택 (1주~한 달)
- 요리 종류 선택 (한식/양식/중식/일식)
- 메뉴 DB 80종
- 개별 메뉴 재생성 (주사위)
- 직접 메뉴 입력 + 메모
- 요리 분포 시각화
- 텍스트 복사 / 인쇄
- LocalStorage 자동 저장
