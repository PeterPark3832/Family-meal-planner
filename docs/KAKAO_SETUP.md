# 카카오 공유 기능 활성화 가이드

현재 앱에는 카카오 공유 스캐폴드가 이미 구현되어 있습니다.  
아래 3단계를 완료하면 카카오톡 공유 버튼이 활성화됩니다.

---

## 준비물

- 카카오 개발자 계정 ([https://developers.kakao.com](https://developers.kakao.com))
- GitHub Pages URL: `https://peterpark3832.github.io/Family-meal-planner/`

---

## Step 1. 카카오 앱 등록

1. [카카오 개발자 콘솔](https://developers.kakao.com/console/app) 접속
2. **"애플리케이션 추가하기"** 클릭
3. 앱 정보 입력:
   - **앱 이름**: 우리 가족 식단 플래너
   - **사업자명**: (개인 이름 또는 팀명)
4. 생성 완료 후 앱 페이지로 이동

---

## Step 2. 플랫폼 등록 및 JavaScript 키 확인

1. 앱 페이지 왼쪽 메뉴 → **"앱 설정" → "플랫폼"**
2. **"Web 플랫폼 등록"** 클릭
3. **사이트 도메인** 입력:
   ```
   https://peterpark3832.github.io
   ```
4. 저장 후 **"앱 키"** 메뉴로 이동
5. **"JavaScript 키"** 값을 복사 (예: `abc1234567890abcdef1234567890ab`)

---

## Step 3. vite-entry.html 수정

`vite-entry.html` 파일에서 아래 주석 처리된 스크립트를 찾아 주석을 해제하고  
`YOUR_KAKAO_JS_KEY`를 복사한 JavaScript 키로 교체합니다.

**변경 전:**
```html
<!-- 카카오 SDK: https://developers.kakao.com 에서 JavaScript 키를 발급받아 아래 YOUR_KAKAO_JS_KEY를 교체하세요 -->
<!-- <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
<script>Kakao.init('YOUR_KAKAO_JS_KEY');</script> -->
```

**변경 후:**
```html
<script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
<script>Kakao.init('abc1234567890abcdef1234567890ab');</script>
```

---

## Step 4. 배포 및 확인

```bash
git add vite-entry.html
git commit -m "feat: 카카오 공유 SDK 활성화"
git push
```

GitHub Actions가 자동으로 빌드·배포합니다.  
배포 완료 후 앱 식단 화면에서 **"카카오"** 버튼을 눌러 동작을 확인합니다.

---

## 동작 방식

이미 구현된 `shareKakao()` 함수 (`src/components/PlanScreen.jsx`)는:

1. `window.Kakao?.isInitialized()` 확인
2. 초기화되어 있으면 → 카카오톡 피드 공유 (썸네일 + 설명 + 버튼)
3. 초기화되지 않았으면 → URL 공유 (Web Share API / 클립보드 복사) 로 자동 fallback

SDK 미적용 상태에서도 일반 URL 공유는 정상 동작합니다.

---

## 카카오 공유 메시지 커스터마이징

`PlanScreen.jsx`의 `shareKakao()` 함수에서 공유 내용을 수정할 수 있습니다:

```js
Kakao.Share.sendDefault({
  objectType: 'feed',
  content: {
    title: '우리 가족 이번 주 식단',           // ← 제목 수정
    description: `${period}일 식단을 공유합니다 🍽️`,  // ← 설명 수정
    imageUrl: 'https://peterpark3832.github.io/Family-meal-planner/og-image.svg',
    link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
  },
  buttons: [{
    title: '식단 보기',
    link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
  }],
});
```

---

## 주의사항

- JavaScript 키는 공개 저장소에 커밋해도 괜찮습니다 (클라이언트 사이드 키이며, 허용 도메인으로만 제한됨).
- 단, 서버 키 / Admin 키는 절대 공개 저장소에 커밋하지 마세요.
- 카카오 개발자 콘솔에서 허용 도메인을 `https://peterpark3832.github.io`로 반드시 등록해야 합니다.
- 로컬 개발 테스트를 위해 `http://localhost:5173`도 플랫폼 도메인에 추가해 두면 편리합니다.
