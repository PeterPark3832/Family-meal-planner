# 시스템 아키텍처 (Architecture)

우리 가족 식단 플래너의 기술 구조를 설명합니다.

---

## 전체 구조

```
브라우저
├── vite-entry.html          HTML 진입점, PWA 메타태그, GA4, SW 등록
├── Service Worker (sw.js)   오프라인 캐시, stale-while-revalidate
└── React 앱 (src/)
    ├── App.jsx              최상위 상태 관리, 화면 전환, PWA 설치 배너
    ├── SetupScreen          설정 화면 (1단계: 구성원 → 2단계: 옵션)
    └── PlanScreen           식단 화면 (PC 테이블 / 모바일 뷰 분기)
```

---

## 상태 관리

별도 상태 라이브러리 없이 **React useState + useCallback** 패턴 사용.  
모든 핵심 상태는 `App.jsx`에서 소유하고 props로 전달합니다.

| 상태 | 타입 | 설명 |
|------|------|------|
| `screen` | `'setup' \| 'plan'` | 현재 화면 |
| `config` | `object` | 설정 (members, period, cuisines, 옵션들) |
| `mealPlan` | `object` | `{ '월_점심': '김치찌개', ... }` |
| `customMeals` | `array` | 사용자 직접 추가 메뉴 |
| `ratings` | `object` | `{ '메뉴명': { likes, dislikes } }` |
| `templates` | `array` | 저장된 식단 템플릿 |

### LocalStorage 키

| 키 | 내용 |
|----|------|
| `fmp_v2` | 마지막 설정 + 식단 (자동 저장) |
| `fmp_custom_meals` | 커스텀 메뉴 배열 |
| `fmp_ratings` | 메뉴 평가 기록 |
| `fmp_templates` | 저장된 템플릿 배열 |
| `fmp_help_seen` | 가이드 모달 표시 여부 |
| `fmp_install_dismissed` | PWA 설치 배너 닫음 여부 |

---

## 식단 생성 알고리즘 (`src/utils/algorithm.js`)

```
generatePlan(period, cuisines, minAge, noSpicy, hasKids, customMeals, ratings, allergens, seasonBoost, preferQuick)
  └─ 각 날짜 × 끼니(아침/점심/저녁)에 대해:
       ratedShuffleBalanced(pool)
         ├─ 평가 가중치 계산 (likes/dislikes 반영)
         ├─ 계절 부스트 (seasonBoost 옵션 시)
         ├─ 영양 다양성 추적 (protein/veggie/carb/balanced)
         ├─ 요리 연속 방지 (streak 카운터)
         └─ 주간 중복 억제 (weeklyUsed Set)
```

메뉴 풀 필터링 순서:
1. `allergens` → 알레르기 재료 포함 메뉴 제외
2. `noSpicy` or `minAge < 8` → `spicy: true` 메뉴 제외
3. `preferQuick` → `MEAL_PREP_TIME !== 'quick'` 메뉴 제외
4. 선택한 `cuisines`에 해당하는 메뉴만 사용
5. `customMeals`가 있으면 기본 풀과 합산

---

## 화면 컴포넌트

### SetupScreen
두 단계 위저드:
- **Step 1**: 가족 구성원 추가 (이름, 나이, 성별)
- **Step 2**: 기간, 요리 종류, 옵션 (제철 부스트, 빠른 조리, 알레르기 제외)

이전 저장 식단이 있으면 "이어서 보기" 버튼 제공.

### PlanScreen
- PC (≥ 1024px): 주차별 세로 테이블 뷰
- 모바일 (< 1024px): `MobilePlanView` — 주간 탭 + 요일 탭 + 카드 뷰

### MobilePlanView
14일 이상 플랜에서는 **주간 탭** 자동 표시.  
각 주는 7일 단위로 그룹화, 탭 전환 시 해당 주 첫째 날로 이동.

```
selectedWeek (0-based)  ─→  days = mealPlan keys for week W
selectedDay              ─→  shows 3 meals for that day
```

---

## 공유 URL 구조 (`src/utils/shareUtils.js`)

```
https://…/Family-meal-planner/?plan=<token>

token = URL-safe base64 of JSON:
{
  "v": 1,
  "config": { members, period, cuisines, … },
  "mealPlan": { "월_점심": "김치찌개", … }
}
```

App.jsx 초기화 시 `getShareToken()` → `decodePlan()` → `v===1` 검증 → 식단 복원.  
복원 후 `clearShareParam()`으로 URL에서 `?plan=` 제거.

---

## PWA 구조

### manifest.json
- `display_override`: `["window-controls-overlay", "standalone", "minimal-ui"]`
- `shortcuts`: 식단 생성, 장보기 목록 딥링크
- `orientation`: `portrait-primary`

### Service Worker (`sw.js`, 버전 `fmp-v4`)
전략:
- **설치 시** 핵심 에셋 사전 캐시 (`/`, `index.html`, `manifest.json`, `icon.svg`)
- **네비게이션 요청**: Cache-First → 오프라인이면 캐시된 `index.html` 반환
- **에셋 요청**: Stale-While-Revalidate (즉시 캐시 반환, 백그라운드 갱신)
- **activate 시** 구버전 캐시 자동 삭제

### iOS 지원
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
CSS: `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)`

---

## 데이터 파일 구조 (`src/data/`)

```
meals.js        KOREAN_MEALS, WESTERN_MEALS, CHINESE_MEALS, JAPANESE_MEALS 배열
                → 최종 export MEALS = [...모두 합산]
nutrition.js    MEAL_NUTRITION, MEAL_SEASONS, MEAL_PREP_TIME 객체
                (meals.js의 name 문자열을 key로 사용)
recipes.js      RECIPES 객체 (50종 내장 레시피)
config.js       CUISINE_INFO, LocalStorage 키 상수, 알레르기 목록
```

---

## 빌드 및 배포

```
로컬: npm run dev  →  Vite dev server (HMR)
빌드: npm run build  →  dist/
      (vite-entry.html → dist/index.html 자동 rename)

GitHub Actions (.github/workflows/deploy.yml):
  push to main
    → npm ci
    → npm run build
    → dist/ 를 gh-pages 브랜치로 배포
```

정적 에셋 (`icon.svg`, `manifest.json`, `sw.js`, `og-image.svg`)은  
`public/` 대신 루트에 위치하며 Vite가 `dist/`로 복사합니다.

---

## 확장 포인트

| 항목 | 방법 |
|------|------|
| 메뉴 추가 | `src/data/meals.js` 배열에 항목 추가 + `nutrition.js` 메타 추가 |
| 레시피 추가 | `src/data/recipes.js`에 메뉴이름 키로 추가 |
| 요리 종류 추가 | `config.js` `CUISINE_INFO`, `meals.js` 새 배열, 알고리즘 풀 확장 |
| 다국어 추가 | `src/i18n/` 에 새 언어 파일 추가, `i18n.js`에 등록 |
| 카카오 공유 | [KAKAO_SETUP.md](KAKAO_SETUP.md) 참조 |
