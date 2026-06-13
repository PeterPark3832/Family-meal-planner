# 기여 가이드 (Contributing Guide)

우리 가족 식단 플래너에 관심 가져주셔서 감사합니다!  
버그 수정, 메뉴 추가, 기능 제안 등 모든 기여를 환영합니다.

---

## 목차

1. [개발 환경 준비](#1-개발-환경-준비)
2. [메뉴 추가하기](#2-메뉴-추가하기)
3. [레시피 추가하기](#3-레시피-추가하기)
4. [버그 수정 / 기능 개선](#4-버그-수정--기능-개선)
5. [Pull Request 규칙](#5-pull-request-규칙)
6. [커밋 메시지 규칙](#6-커밋-메시지-규칙)

---

## 1. 개발 환경 준비

**요구사항**: Node.js 18+

```bash
git clone https://github.com/PeterPark3832/Family-meal-planner.git
cd Family-meal-planner
npm install
npm run dev        # http://localhost:5173
```

브랜치 전략: `main` 브랜치에서 새 브랜치를 만들고 PR을 보내주세요.

```bash
git checkout -b feat/새기능이름
```

---

## 2. 메뉴 추가하기

메뉴는 `src/data/meals.js`에 요리별로 분리된 배열에 추가합니다.

### 2-1. meals.js에 메뉴 추가

```js
// src/data/meals.js
// 각 배열 끝에 추가 (예: 한식 → KOREAN_MEALS)
{
  id: 'k81',         // 한식 k__, 양식 w__, 중식 c__, 일식 j__  (기존 최대값+1)
  name: '메뉴이름',
  cuisine: 'korean', // korean | western | chinese | japanese
  spicy: false,      // true: 어린이 있는 가정에서 기본 제외됨
  kid: true,         // true: 아이도 좋아하는 메뉴
}
```

### 2-2. nutrition.js에 메타 추가

```js
// src/data/nutrition.js

// 영양 유형: protein | veggie | carb | balanced
export const MEAL_NUTRITION = {
  // ...
  '메뉴이름': 'protein',
};

// 제철 계절 (없으면 생략 가능 — 모든 계절로 취급)
export const MEAL_SEASONS = {
  // ...
  '메뉴이름': ['봄', '여름'],  // 봄 | 여름 | 가을 | 겨울
};

// 조리 시간
export const MEAL_PREP_TIME = {
  // ...
  '메뉴이름': 'quick',  // quick(30분↓) | medium(30~60분) | long(60분↑)
};
```

### 2-3. 검증

```bash
npm test   # 테스트 통과 확인
```

---

## 3. 레시피 추가하기

레시피는 `src/data/recipes.js`에 추가합니다.  
내장 레시피가 있는 메뉴는 RecipeModal에서 "레시피" 탭이 자동으로 활성화됩니다.

```js
// src/data/recipes.js
export const RECIPES = {
  // ...
  '메뉴이름': {
    time: '20분',           // 예상 조리 시간
    serves: '2인분',        // 기준 인분
    ingredients: [
      '재료1 분량',
      '재료2 분량',
    ],
    steps: [
      '첫 번째 조리 단계를 간결하게 작성합니다.',
      '두 번째 조리 단계.',
      '세 번째 조리 단계.',
    ],
  },
};
```

**작성 팁**
- `ingredients`: "재료명 분량" 형식, 예: `'김치 200g'`
- `steps`: 단계당 1~2문장, 핵심 동작만 작성
- 조리 시간은 `meals.js`의 `MEAL_PREP_TIME`과 일치시켜 주세요

---

## 4. 버그 수정 / 기능 개선

1. [이슈](https://github.com/PeterPark3832/Family-meal-planner/issues)에서 관련 항목 확인 또는 신규 등록
2. 이슈 번호를 브랜치 이름에 포함: `fix/123-버그설명`
3. 변경 후 `npm test` 통과 확인
4. PR 본문에 변경 내용과 테스트 방법 작성

### 테스트 실행

```bash
npm test                           # 전체 테스트
npx vitest run tests/algorithm.test.js  # 특정 파일만
```

### 주요 파일 위치

| 기능 | 파일 |
|------|------|
| 식단 생성 알고리즘 | `src/utils/algorithm.js` |
| 공유 URL 인코딩 | `src/utils/shareUtils.js` |
| 화면 전환·PWA | `src/App.jsx` |
| 식단 화면 | `src/components/PlanScreen.jsx` |
| 모바일 식단 뷰 | `src/components/MobilePlanView.jsx` |
| 레시피 모달 | `src/components/RecipeModal.jsx` |
| 장보기 모달 | `src/components/ShoppingListModal.jsx` |

---

## 5. Pull Request 규칙

- `main` 브랜치를 base로 PR 생성
- PR 제목 형식: `[feat] 제목` / `[fix] 제목` / `[docs] 제목`
- PR 본문에 다음을 포함해 주세요:
  - **변경 사항 요약** (1~3줄)
  - **테스트 방법** (어떤 화면에서 무엇을 확인했는지)
  - **스크린샷** (UI 변경이 있는 경우)
- `npm test` 통과 필수

---

## 6. 커밋 메시지 규칙

```
타입: 한 줄 요약 (50자 이내)

[선택] 상세 설명
```

| 타입 | 용도 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `data` | 메뉴·레시피 데이터 추가/수정 |
| `style` | UI/CSS 수정 (동작 변경 없음) |
| `refactor` | 리팩터링 (동작 변경 없음) |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 수정 |
| `chore` | 빌드·설정 변경 |

**예시**
```
data: 한식 메뉴 5종 추가 (열무비빔국수, 닭강정 등)
feat: 레시피 모달에 탭 UI 추가
fix: 30일 플랜 주간 탭 오늘 날짜 감지 오류 수정
```

---

기여해주신 모든 분께 감사드립니다! 🙏
