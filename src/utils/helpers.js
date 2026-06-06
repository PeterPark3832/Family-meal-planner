import { MEAL_CALORIES } from '../data/nutrition.js';
import { MEAL_PREP_TIME } from '../data/nutrition.js';
import { MEAL_NUTRITION } from '../data/nutrition.js';
import { MEAL_TYPES } from '../data/config.js';
import {
  INGREDIENT_CATEGORY,
  INGREDIENT_QUANTITY,
} from '../data/ingredients.js';
import {
  COUPANG_BASE,
  COUPANG_CAT,
  COUPANG_ING_OVERRIDE,
} from '../data/config.js';

export const getCalories = (name) => MEAL_CALORIES[name] || 400;

export const getPrep = (name) => MEAL_PREP_TIME[name] || 'medium';

export const getMinAge = (members) => {
  const kids = members.filter(m => m.type === 'child');
  return kids.length ? Math.min(...kids.map(m => parseInt(m.age) || 0)) : 99;
};

export const hasKids = (members) => members.some(m => m.type === 'child');

export const getRecommendedKcal = (member) => {
  const age = parseInt(member.age) || 30;
  if (member.type === 'child') {
    if (age <= 2)  return 900;
    if (age <= 5)  return 1200;
    if (age <= 8)  return 1400;
    if (age <= 11) return 1600;
    if (age <= 14) return member.gender === 'male' ? 2000 : 1700;
    return member.gender === 'male' ? 2200 : 1800;
  }
  // 성인
  if (age < 30) return member.gender === 'male' ? 2300 : 1900;
  if (age < 50) return member.gender === 'male' ? 2000 : 1700;
  if (age < 65) return member.gender === 'male' ? 1900 : 1600;
  return member.gender === 'male' ? 1700 : 1500;
};

export function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export const trackEvent = (name, params = {}) => {
  try {
    if (typeof gtag === 'function') gtag('event', name, params);
  } catch(e) {}
};

export const getDayNutrition = (dayPlan, hasChildren) => {
  const types = { protein:0, veggie:0, carb:0, balanced:0 };
  for (const mt of ['breakfast','lunch','dinner']) {
    const slot = dayPlan?.[mt];
    if (!slot) continue;
    const name = hasChildren ? slot.adult?.name : slot.name;
    const t = MEAL_NUTRITION[name];
    if (t && types[t] !== undefined) types[t]++;
  }
  return types;
};

export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w,y, x+w,y+h, r);
  ctx.arcTo(x+w,y+h, x,y+h, r);
  ctx.arcTo(x,y+h, x,y, r);
  ctx.arcTo(x,y, x+w,y, r);
  ctx.closePath();
}

export const coupangUrl = (ingredient) => {
  const code = COUPANG_ING_OVERRIDE[ingredient]
    || COUPANG_CAT[INGREDIENT_CATEGORY[ingredient]]
    || 'evvqfy';
  return COUPANG_BASE + code;
};

export const coupangMealUrl = () => COUPANG_BASE + 'evvqfy';
