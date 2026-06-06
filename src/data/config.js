// ── 저장 키 ─────────────────────────────────────────
export const SAVE_KEY     = 'fmp_v2';
export const CUSTOM_KEY   = 'fmp_custom_meals';
export const RATING_KEY   = 'fmp_ratings';
export const TEMPLATE_KEY = 'fmp_templates';

// ── 쿠팡 파트너스 상수 ────────────────────────────────
export const COUPANG_BASE = 'https://link.coupang.com/a/';
export const COUPANG_CAT = {
  '채소류':        'evvkSH',
  '육류':          'evvlDY',
  '해산물':        'evvms3',
  '유제품/계란':   'evvmQt',
  '양념/소스':     'evvnhs',
  '가공식품':      'evvnHG',
  '면/밥류':       'evvn7C',
  '두부/콩류':     'evvoO6',
  '버섯류':        'evvppV',
  '견과류/건과일': 'evvpD2',
  '기타':          'evvqfy',
};
export const COUPANG_ING_OVERRIDE = {
  '계란':'evvqCc', '달걀':'evvqCc',
  '쌀':'evvosX', '현미':'evvosX', '잡곡':'evvosX', '밥':'evvosX',
  '콩':'evvo6m', '두유':'evvo6m', '낫토':'evvo6m', '검은콩':'evvo6m',
  '케첩':'evvqYV', '마요네즈':'evvqYV', '굴소스':'evvqYV',
  '스리라차소스':'evvqYV', '칠리소스':'evvqYV', '우스터소스':'evvqYV',
  '피시소스':'evvqYV', '데리야끼소스':'evvqYV', '고추기름':'evvqYV',
};

// ── 요리 종류 정보 ───────────────────────────────────
export const CUISINE_INFO = {
  korean:   { label:'한식',     emoji:'🍚', bg:'bg-orange-50',  border:'border-orange-300', badge:'bg-orange-100 text-orange-700',  bar:'bg-orange-400' },
  western:  { label:'양식',     emoji:'🍝', bg:'bg-blue-50',    border:'border-blue-300',   badge:'bg-blue-100 text-blue-700',      bar:'bg-blue-400'   },
  chinese:  { label:'중식',     emoji:'🥢', bg:'bg-red-50',     border:'border-red-300',    badge:'bg-red-100 text-red-700',        bar:'bg-red-400'    },
  japanese: { label:'일식',     emoji:'🍱', bg:'bg-purple-50',  border:'border-purple-300', badge:'bg-purple-100 text-purple-700',  bar:'bg-purple-400' },
  custom:   { label:'직접입력', emoji:'✏️', bg:'bg-gray-50',   border:'border-gray-300',   badge:'bg-gray-100 text-gray-600',      bar:'bg-gray-400'   },
};

// ── 식사 유형 ─────────────────────────────────────────
export const MEAL_TYPES = [
  { id:'breakfast', label:'아침', emoji:'🌅' },
  { id:'lunch',     label:'점심', emoji:'☀️' },
  { id:'dinner',    label:'저녁', emoji:'🌙' },
];

// ── 요일 ─────────────────────────────────────────────
export const WEEK_DAYS = ['월','화','수','목','금','토','일'];

// ── 카테고리 순서 및 이모지 ──────────────────────────
export const CAT_ORDER = ['육류/달걀','해산물','채소/과일','두부/유제품','곡류/면/빵','가공/소스','기타'];
export const CAT_EMOJI = {
  '육류/달걀':'🥩',
  '해산물':'🐟',
  '채소/과일':'🥦',
  '두부/유제품':'🧀',
  '곡류/면/빵':'🌾',
  '가공/소스':'🫙',
  '기타':'📦',
};

// ── 현재 계절 ─────────────────────────────────────────
export const CURRENT_SEASON = (() => {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return '봄';
  if (m >= 6 && m <= 8) return '여름';
  if (m >= 9 && m <= 11) return '가을';
  return '겨울';
})();

// ── 터치 기기 감지 ───────────────────────────────────
export const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches;

// ── 영양 정보 ─────────────────────────────────────────
export const NUTRITION_INFO = {
  protein:  { label:'단백질',   emoji:'🥩', bar:'bg-rose-400'   },
  veggie:   { label:'채소',     emoji:'🥦', bar:'bg-green-400'  },
  carb:     { label:'탄수화물', emoji:'🌾', bar:'bg-amber-400'  },
  balanced: { label:'균형',     emoji:'⚖️', bar:'bg-blue-400'   },
};
