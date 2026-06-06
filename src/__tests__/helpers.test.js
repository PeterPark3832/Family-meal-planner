import { describe, it, expect } from 'vitest';
import { getCalories, getMinAge, hasKids, getRecommendedKcal, formatTime, getDayNutrition } from '../utils/helpers.js';

describe('getCalories', () => {
  it('returns known calorie for a meal', () => {
    expect(getCalories('김치찌개')).toBe(380);
  });
  it('returns fallback 400 for unknown meals', () => {
    expect(getCalories('알수없는메뉴')).toBe(400);
  });
});

describe('getMinAge', () => {
  it('returns 99 when no children', () => {
    const members = [
      { type: 'adult', age: 35, gender: 'male' },
      { type: 'adult', age: 32, gender: 'female' },
    ];
    expect(getMinAge(members)).toBe(99);
  });
  it('returns youngest child age', () => {
    const members = [
      { type: 'adult', age: 35, gender: 'male' },
      { type: 'child', age: 8, gender: 'female' },
      { type: 'child', age: 5, gender: 'male' },
    ];
    expect(getMinAge(members)).toBe(5);
  });
});

describe('hasKids', () => {
  it('returns true when children present', () => {
    expect(hasKids([{ type: 'adult' }, { type: 'child' }])).toBe(true);
  });
  it('returns false with only adults', () => {
    expect(hasKids([{ type: 'adult' }, { type: 'adult' }])).toBe(false);
  });
});

describe('getRecommendedKcal', () => {
  it('returns correct kcal for adult male under 30', () => {
    expect(getRecommendedKcal({ type: 'adult', age: 25, gender: 'male' })).toBe(2300);
  });
  it('returns correct kcal for adult female 30-50', () => {
    expect(getRecommendedKcal({ type: 'adult', age: 35, gender: 'female' })).toBe(1700);
  });
  it('returns correct kcal for child aged 5', () => {
    expect(getRecommendedKcal({ type: 'child', age: 5, gender: 'male' })).toBe(1200);
  });
  it('returns correct kcal for child aged 8', () => {
    expect(getRecommendedKcal({ type: 'child', age: 8, gender: 'male' })).toBe(1400);
  });
  it('returns lower kcal for elderly 65+', () => {
    const elderly = getRecommendedKcal({ type: 'adult', age: 70, gender: 'male' });
    const adult50 = getRecommendedKcal({ type: 'adult', age: 40, gender: 'male' });
    expect(elderly).toBeLessThan(adult50);
  });
});

describe('formatTime', () => {
  it('returns empty string for falsy input', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime(0)).toBe('');
  });
  it('formats timestamp as MM/DD HH:MM', () => {
    const ts = new Date(2025, 0, 15, 9, 5).getTime(); // Jan 15, 09:05
    const result = formatTime(ts);
    expect(result).toMatch(/1\/15 09:05/);
  });
});

describe('getDayNutrition', () => {
  it('counts nutrition types in a day plan', () => {
    const dayPlan = {
      breakfast: { name: '계란프라이+밥' },
      lunch: { name: '된장찌개' },
      dinner: { name: '비빔밥' },
    };
    const result = getDayNutrition(dayPlan, false);
    expect(typeof result.protein).toBe('number');
    expect(typeof result.veggie).toBe('number');
    expect(typeof result.carb).toBe('number');
    expect(typeof result.balanced).toBe('number');
    // Total should be ≤ 3 (one per meal)
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    expect(total).toBeLessThanOrEqual(3);
  });

  it('handles children mode', () => {
    const dayPlan = {
      breakfast: { adult: { name: '미역국+밥' }, child: { name: '흰죽' } },
      lunch: { adult: { name: '김치찌개' }, child: { name: '된장찌개' } },
      dinner: { adult: { name: '불고기' }, child: { name: '계란찜' } },
    };
    const result = getDayNutrition(dayPlan, true);
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(0);
  });
});
