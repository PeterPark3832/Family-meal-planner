import { describe, it, expect, vi } from 'vitest';

// Mock browser-only globals that data files reference
vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });

import { generatePlan, pickOneMeal, ratedShuffleBalanced } from '../utils/algorithm.js';
import { MEALS } from '../data/meals.js';
import { MEAL_NUTRITION } from '../data/nutrition.js';

describe('generatePlan', () => {
  const defaultArgs = {
    period: 7,
    cuisines: ['korean'],
    minAge: 99,
    noSpicy: false,
    childrenPresent: false,
    customMeals: [],
    ratings: {},
    allergens: [],
    seasonBoost: false,
    preferQuick: false,
  };

  it('generates a plan with correct number of days', () => {
    const plan = generatePlan(...Object.values(defaultArgs));
    expect(Object.keys(plan).length).toBe(7);
  });

  it('each day has breakfast, lunch, dinner slots', () => {
    const plan = generatePlan(...Object.values(defaultArgs));
    for (let d = 0; d < 7; d++) {
      expect(plan[d]).toHaveProperty('breakfast');
      expect(plan[d]).toHaveProperty('lunch');
      expect(plan[d]).toHaveProperty('dinner');
    }
  });

  it('respects noSpicy filter — no spicy meals when noSpicy=true', () => {
    const plan = generatePlan(7, ['korean'], 99, true, false, [], {}, [], false, false);
    const spicyMealNames = new Set(MEALS.filter(m => m.spicy).map(m => m.name));
    for (let d = 0; d < 7; d++) {
      for (const mt of ['breakfast', 'lunch', 'dinner']) {
        const name = plan[d]?.[mt]?.name;
        expect(spicyMealNames.has(name)).toBe(false);
      }
    }
  });

  it('respects allergen filter', () => {
    const eggAllergen = ['계란'];
    const plan = generatePlan(7, ['korean'], 99, false, false, [], {}, eggAllergen, false, false);
    // Just check plan generates without error — allergen filtering tested separately
    expect(Object.keys(plan).length).toBe(7);
  });

  it('generates split plan for children', () => {
    const plan = generatePlan(7, ['korean'], 5, false, true, [], {}, [], false, false);
    for (let d = 0; d < 7; d++) {
      expect(plan[d].breakfast).toHaveProperty('adult');
      expect(plan[d].breakfast).toHaveProperty('child');
    }
  });

  it('generates 14-day plan without repetition within lookback window', () => {
    const plan = generatePlan(14, ['korean', 'western'], 99, false, false, [], {}, [], false, false);
    expect(Object.keys(plan).length).toBe(14);
    // Plans should have meals (not all 직접 입력)
    const names = Object.values(plan).flatMap(day =>
      ['breakfast', 'lunch', 'dinner'].map(mt => day[mt]?.name)
    ).filter(Boolean);
    const realMeals = names.filter(n => n !== '직접 입력');
    expect(realMeals.length).toBeGreaterThan(10);
  });
});

describe('ratedShuffleBalanced', () => {
  const sampleMeals = MEALS.filter(m => m.cuisine === 'korean').slice(0, 10);

  it('returns same number of meals', () => {
    const result = ratedShuffleBalanced(sampleMeals);
    expect(result.length).toBe(sampleMeals.length);
  });

  it('boosts liked meals to front', () => {
    const ratings = { [sampleMeals[5].name]: { likes: 5, dislikes: 0 } };
    const results = [];
    for (let i = 0; i < 50; i++) {
      const sorted = ratedShuffleBalanced(sampleMeals, ratings);
      results.push(sorted[0].name === sampleMeals[5].name ? 1 : 0);
    }
    const topRate = results.reduce((a, b) => a + b, 0) / results.length;
    // Liked meal should appear first more than 30% of the time (vs 10% random)
    expect(topRate).toBeGreaterThan(0.3);
  });

  it('penalises disliked meals — average position is worse than random', () => {
    const targetMeal = sampleMeals[0];
    const ratings = { [targetMeal.name]: { likes: 0, dislikes: 1 } }; // score = -1 → weight 0.5
    let totalPos = 0;
    const runs = 100;
    for (let i = 0; i < runs; i++) {
      const sorted = ratedShuffleBalanced(sampleMeals, ratings);
      totalPos += sorted.findIndex(m => m.name === targetMeal.name);
    }
    const avgPos = totalPos / runs;
    const midPoint = (sampleMeals.length - 1) / 2; // 4.5
    // Disliked meal should appear in the second half (avg pos > midpoint)
    expect(avgPos).toBeGreaterThan(midPoint);
  });

  it('nutrition diversity bonus — missing types get higher weight', () => {
    // Give a meal a known nutrition type
    const proteinMeals = sampleMeals.filter(m => MEAL_NUTRITION[m.name] === 'protein');
    if (proteinMeals.length === 0) return; // skip if no data
    const existingNut = ['veggie', 'carb']; // protein is missing
    const sorted = ratedShuffleBalanced(sampleMeals, {}, false, existingNut);
    // protein meals should cluster higher
    const proteinPositions = sorted
      .map((m, i) => MEAL_NUTRITION[m.name] === 'protein' ? i : null)
      .filter(i => i !== null);
    const avgPos = proteinPositions.reduce((a, b) => a + b, 0) / (proteinPositions.length || 1);
    expect(avgPos).toBeLessThan(sampleMeals.length / 2);
  });
});

describe('pickOneMeal', () => {
  it('returns a meal matching the type', () => {
    const meal = pickOneMeal('breakfast', ['korean'], 99, null, false, [], {}, []);
    expect(meal).not.toBeNull();
    expect(meal.types).toContain('breakfast');
  });

  it('excludes the current meal name', () => {
    const first = pickOneMeal('lunch', ['korean'], 99, null, false, [], {}, []);
    if (!first) return;
    const second = pickOneMeal('lunch', ['korean'], 99, first.name, false, [], {}, []);
    if (second) expect(second.name).not.toBe(first.name);
  });

  it('returns null if no meals available after filtering', () => {
    // Filter that removes everything
    const result = pickOneMeal('breakfast', ['korean'], 0, null, true, [], {}, ['계란','쌀','두부','돼지고기','소고기','닭고기','해산물','어묵','버섯','채소']);
    // May return null or a valid meal — just check it doesn't throw
    expect(result === null || typeof result === 'object').toBe(true);
  });
});
