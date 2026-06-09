import { MEALS } from '../data/meals.js';
import { MEAL_ALLERGENS } from '../data/ingredients.js';
import { MEAL_NUTRITION, MEAL_SEASONS, MEAL_PREP_TIME } from '../data/nutrition.js';
import { CURRENT_SEASON } from '../data/config.js';
import { getPrep } from './helpers.js';

export const getPool = (mealType, cuisines, minAge, noSpicy = false, customMeals = [], ratings = {}, allergens = []) => {
  const all = [...MEALS, ...customMeals];
  return all.filter(m =>
    (m.isUserCustom || cuisines.includes(m.cuisine)) &&
    m.types.includes(mealType) &&
    m.minAge <= minAge &&
    (!noSpicy || !m.spicy) &&
    ((ratings[m.name]?.likes || 0) - (ratings[m.name]?.dislikes || 0)) > -2 &&
    (allergens.length === 0 || !(MEAL_ALLERGENS[m.name] || []).some(a => allergens.includes(a)))
  );
};

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ratedShuffle = (arr, ratings = {}, seasonBoost = false) =>
  arr
    .map(m => {
      const r = ratings[m.name] || { likes:0, dislikes:0 };
      const score = r.likes - r.dislikes;
      let weight = score >= 2 ? 3 : score === 1 ? 2 : score <= -1 ? 0.5 : 1;
      if (seasonBoost && MEAL_SEASONS[m.name]?.includes(CURRENT_SEASON)) weight *= 1.8;
      return { m, priority: Math.random() * weight };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(x => x.m);

export const ratedShuffleBalanced = (arr, ratings = {}, seasonBoost = false, dayNutrition = [], recentCuisines = [], quickMode = false) =>
  arr
    .map(m => {
      const r = ratings[m.name] || { likes:0, dislikes:0 };
      const score = r.likes - r.dislikes;
      let weight = score >= 2 ? 3 : score === 1 ? 2 : score <= -1 ? 0.5 : 1;
      if (seasonBoost && MEAL_SEASONS[m.name]?.includes(CURRENT_SEASON)) weight *= 1.8;
      // 하루 내 영양 다양성: 아직 없는 영양 유형에 보너스
      const nutType = MEAL_NUTRITION[m.name];
      if (nutType && dayNutrition.length > 0 && !dayNutrition.includes(nutType)) weight *= 1.6;
      // 연속 같은 요리 방지: 최근 3일 내 2회 이상이면 패널티
      const streakCount = recentCuisines.filter(c => c === m.cuisine).length;
      if (streakCount >= 3) weight *= 0.25;
      else if (streakCount >= 2) weight *= 0.55;
      // 주중 빠른 조리 우선 모드: 빠른 메뉴 1.8×
      if (quickMode) {
        const prep = getPrep(m.name);
        if (prep === 'quick') weight *= 1.8;
        else if (prep === 'long') weight *= 0.5;
      }
      return { m, priority: Math.random() * weight };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(x => x.m);

export const getRecentCuisines = (plan, d, mt, lookback, isChildren, role) => {
  const cuis = [];
  for (let i = Math.max(0, d - 3); i < d; i++) {
    if (i < lookback) continue;
    const slot = plan[i]?.[mt];
    if (!slot) continue;
    const c = isChildren ? (role === 'adult' ? slot.adult?.cuisine : slot.child?.cuisine) : slot.cuisine;
    if (c && c !== 'custom') cuis.push(c);
  }
  return cuis;
};

export function generatePlan(period, cuisines, minAge, noSpicy = false, childrenPresent = false, customMeals = [], ratings = {}, allergens = [], seasonBoost = false, preferQuick = false) {
  const plan = {};
  const lookbackWindow = period <= 7 ? 7 : period <= 14 ? 11 : period <= 21 ? 13 : 14;

  for (let d = 0; d < period; d++) {
    plan[d] = {};
    const lookback = Math.max(0, d - lookbackWindow);
    const dayNutritionAdult = [];
    const dayNutritionChild = [];
    const isWeekday = (d % 7) < 5;
    const quickMode = preferQuick && isWeekday;

    for (const mt of ['breakfast','lunch','dinner']) {
      if (childrenPresent) {
        const adultPool = getPool(mt, cuisines, 99, noSpicy, customMeals, ratings, allergens);
        const childNoSpicy = minAge <= 6 || noSpicy;
        const childPool = getPool(mt, cuisines, minAge, childNoSpicy, customMeals, ratings, allergens);

        const usedAdult = new Set(), usedChild = new Set();
        for (let wd = lookback; wd < d; wd++) {
          if (plan[wd]?.[mt]?.adult?.name) usedAdult.add(plan[wd][mt].adult.name);
          if (plan[wd]?.[mt]?.child?.name) usedChild.add(plan[wd][mt].child.name);
        }

        const recentCuisA = getRecentCuisines(plan, d, mt, 0, true, 'adult');
        const freshAdult = adultPool.filter(m => !usedAdult.has(m.name));
        const chosenAdult = ratedShuffleBalanced(freshAdult.length ? freshAdult : adultPool, ratings, seasonBoost, dayNutritionAdult, recentCuisA, quickMode)[0]
          || { name:'직접 입력', cuisine:'custom' };
        if (MEAL_NUTRITION[chosenAdult.name]) dayNutritionAdult.push(MEAL_NUTRITION[chosenAdult.name]);

        const recentCuisC = getRecentCuisines(plan, d, mt, 0, true, 'child');
        const childExcludes = new Set([...usedChild, chosenAdult.name]);
        const freshChildDiff = childPool.filter(m => !childExcludes.has(m.name));
        const freshChild     = childPool.filter(m => !usedChild.has(m.name));
        const chosenChild = ratedShuffleBalanced(
          freshChildDiff.length ? freshChildDiff : (freshChild.length ? freshChild : childPool), ratings, seasonBoost, dayNutritionChild, recentCuisC, quickMode
        )[0] || { name:'직접 입력', cuisine:'custom' };
        if (MEAL_NUTRITION[chosenChild.name]) dayNutritionChild.push(MEAL_NUTRITION[chosenChild.name]);

        plan[d][mt] = {
          adult: { name: chosenAdult.name, cuisine: chosenAdult.cuisine },
          child: { name: chosenChild.name, cuisine: chosenChild.cuisine },
        };
      } else {
        const pool = getPool(mt, cuisines, minAge, noSpicy, customMeals, ratings, allergens);
        if (!pool.length) { plan[d][mt] = { name:'직접 입력', cuisine:'custom' }; continue; }
        const used = new Set();
        for (let wd = lookback; wd < d; wd++) {
          if (plan[wd]?.[mt]?.name) used.add(plan[wd][mt].name);
        }
        const recentCuis = getRecentCuisines(plan, d, mt, 0, false, null);
        const fresh = pool.filter(m => !used.has(m.name));
        const chosen = ratedShuffleBalanced(fresh.length ? fresh : pool, ratings, seasonBoost, dayNutritionAdult, recentCuis, quickMode)[0];
        plan[d][mt] = { name: chosen.name, cuisine: chosen.cuisine };
        if (MEAL_NUTRITION[chosen.name]) dayNutritionAdult.push(MEAL_NUTRITION[chosen.name]);
      }
    }
  }
  return plan;
}

export function pickOneMeal(mealType, cuisines, minAge, excludeName, noSpicy = false, customMeals = [], ratings = {}, allergens = [], seasonBoost = false) {
  const pool = getPool(mealType, cuisines, minAge, noSpicy, customMeals, ratings, allergens).filter(m => m.name !== excludeName);
  if (!pool.length) return null;
  return ratedShuffle(pool, ratings, seasonBoost)[0];
}
