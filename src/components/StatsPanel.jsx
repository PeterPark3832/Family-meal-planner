import React, { useMemo } from 'react';
import { CUISINE_INFO, NUTRITION_INFO, MEAL_TYPES } from '../data/config.js';
import { MEAL_NUTRITION } from '../data/nutrition.js';
import { getCalories, getRecommendedKcal } from '../utils/helpers.js';

export default function StatsPanel({ mealPlan, period, hasChildren, members = [] }) {
  const { cuisineCounts, nutritionCounts, totalKcal, mealCount } = useMemo(() => {
    const c = { korean:0, western:0, chinese:0, japanese:0, custom:0 };
    const n = { protein:0, veggie:0, carb:0, balanced:0, unknown:0 };
    let totalKcal = 0, mealCount = 0;
    const addMeal = (name, cuisine) => {
      if (!name) return;
      if (c[cuisine] !== undefined) c[cuisine]++;
      const tag = MEAL_NUTRITION[name];
      if (tag) n[tag]++; else n.unknown++;
      totalKcal += getCalories(name);
      mealCount++;
    };
    for (let d = 0; d < period; d++) {
      for (const mt of ['breakfast','lunch','dinner']) {
        const slot = mealPlan[d]?.[mt];
        if (!slot) continue;
        if (hasChildren) {
          addMeal(slot.adult?.name, slot.adult?.cuisine);
          addMeal(slot.child?.name, slot.child?.cuisine);
        } else {
          addMeal(slot.name, slot.cuisine);
        }
      }
    }
    return { cuisineCounts: c, nutritionCounts: n, totalKcal, mealCount };
  }, [mealPlan, period, hasChildren]);

  const cTotal = Object.values(cuisineCounts).reduce((a,b) => a+b, 0) || 1;
  const nTotal = (Object.values(nutritionCounts).reduce((a,b) => a+b, 0) - nutritionCounts.unknown) || 1;
  const avgDailyKcal = mealCount > 0 ? Math.round(totalKcal / period) : 0;

  const targetKcal = members.length > 0
    ? members.reduce((sum, m) => sum + getRecommendedKcal(m), 0)
    : 2000;
  const kcalPct = avgDailyKcal > 0 ? Math.min(Math.round(avgDailyKcal / targetKcal * 100), 150) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 no-print space-y-4">
      {avgDailyKcal > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">🔥 칼로리</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-2xl font-black text-orange-500">{avgDailyKcal.toLocaleString()}</span>
            <span className="text-xs text-gray-400 mb-1">kcal / 일 평균</span>
            <span className="ml-auto text-xs text-gray-400 mb-1">가족 권장 {targetKcal.toLocaleString()}kcal 대비 <span className={`font-bold ${kcalPct > 120 ? 'text-red-500' : kcalPct < 80 ? 'text-blue-500' : 'text-green-600'}`}>{kcalPct}%</span></span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${kcalPct > 120 ? 'bg-red-400' : kcalPct < 80 ? 'bg-blue-400' : 'bg-orange-400'}`} style={{width:`${Math.min(kcalPct, 100)}%`}} />
          </div>
          {members.length > 1 && (
            <div className="mt-3 space-y-1.5">
              {members.map((m, i) => {
                const rec = getRecommendedKcal(m);
                const icon = m.type === 'child' ? '🧒' : m.gender === 'male' ? '👨' : '👩';
                return (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="flex-shrink-0">{icon}</span>
                    <span className="text-gray-500 flex-shrink-0">{m.type==='adult'?'성인':'자녀'} {m.age}세</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-300 rounded-full" style={{width:`${Math.min(Math.round(rec/3000*100), 100)}%`}} />
                    </div>
                    <span className="text-gray-400 flex-shrink-0 w-16 text-right">{rec.toLocaleString()} kcal</span>
                  </div>
                );
              })}
            </div>
          )}
          {kcalPct > 120 && <p className="text-[10px] text-red-500 mt-1.5 bg-red-50 rounded-lg px-2 py-1">💡 칼로리가 높아요. 저칼로리 메뉴를 일부 추가해보세요.</p>}
          {kcalPct < 80 && <p className="text-[10px] text-blue-500 mt-1.5 bg-blue-50 rounded-lg px-2 py-1">💡 칼로리가 부족할 수 있어요. 단백질 메뉴를 추가해보세요.</p>}
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">📊 요리 분포</h3>
        <div className="space-y-2">
          {Object.entries(cuisineCounts).filter(([,v]) => v > 0).map(([cuisine, cnt]) => {
            const info = CUISINE_INFO[cuisine];
            const pct = Math.round(cnt / cTotal * 100);
            return (
              <div key={cuisine} className="flex items-center gap-2">
                <span className="text-xs w-12 text-gray-600 flex-shrink-0">{info.emoji} {info.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${info.bar} transition-all`} style={{width:`${pct}%`}} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{pct}%</span>
                <span className="text-xs text-gray-400 w-8 flex-shrink-0">{cnt}식</span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">🥗 영양 분포</h3>
        <div className="space-y-2">
          {Object.entries(NUTRITION_INFO).map(([key, info]) => {
            const cnt = nutritionCounts[key] || 0;
            const pct = Math.round(cnt / nTotal * 100);
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-16 text-gray-600 flex-shrink-0">{info.emoji} {info.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${info.bar} transition-all`} style={{width:`${pct}%`}} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{pct}%</span>
                <span className="text-xs text-gray-400 w-8 flex-shrink-0">{cnt}식</span>
              </div>
            );
          })}
        </div>
        {nutritionCounts.protein > nutritionCounts.veggie * 2 && (
          <p className="text-[10px] text-amber-600 mt-2 bg-amber-50 rounded-lg px-2 py-1">💡 채소 위주 메뉴를 조금 더 넣어보세요</p>
        )}
        {nutritionCounts.carb > (nutritionCounts.protein + nutritionCounts.veggie) && (
          <p className="text-[10px] text-blue-600 mt-2 bg-blue-50 rounded-lg px-2 py-1">💡 단백질·채소 메뉴의 비중을 늘려보세요</p>
        )}
      </div>
    </div>
  );
}
