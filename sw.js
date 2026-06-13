// 우리 가족 식단 플래너 — Service Worker
const CACHE = 'fmp-v4';
const SHELL = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './og-image.svg',
];

// 설치: 앱 셸 캐싱
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 패치: 동일 출처는 stale-while-revalidate, CDN은 브라우저 캐시에 위임
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // CDN·외부 요청 통과
  if (url.origin !== self.location.origin) return;

  // 네비게이션(페이지) 요청 — 캐시 우선, 없으면 네트워크, 둘 다 실패 시 index.html 반환
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(e.request))
    );
    return;
  }

  // 에셋 요청 — stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached); // 오프라인: 캐시 반환
        return cached || network;
      })
    )
  );
});
