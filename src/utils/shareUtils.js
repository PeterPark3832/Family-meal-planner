// URL-safe base64 encode/decode (브라우저 내장 btoa/atob 사용)
const toB64 = (str) =>
  btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const fromB64 = (b64) => {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  try { return decodeURIComponent(escape(atob(padded))); } catch { return null; }
};

export const encodePlan = (config, mealPlan) => {
  try {
    const payload = JSON.stringify({ v: 1, config, mealPlan });
    return toB64(payload);
  } catch { return null; }
};

export const decodePlan = (token) => {
  try {
    const json = fromB64(token);
    if (!json) return null;
    const data = JSON.parse(json);
    if (data?.v === 1 && data?.config && data?.mealPlan) return data;
    return null;
  } catch { return null; }
};

// URL에서 공유 토큰 추출
export const getShareToken = () => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('plan') || null;
};

// 공유 URL 생성
export const buildShareUrl = (config, mealPlan) => {
  const token = encodePlan(config, mealPlan);
  if (!token) return null;
  const base = window.location.href.split('?')[0];
  return `${base}?plan=${token}`;
};

// URL에서 plan param 제거 (방문 후 URL 정리)
export const clearShareParam = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.has('plan')) {
    url.searchParams.delete('plan');
    window.history.replaceState({}, '', url.toString());
  }
};
