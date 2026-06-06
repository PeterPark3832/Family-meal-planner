import React from 'react';
import { MEAL_TYPES, CUISINE_INFO, NUTRITION_INFO } from '../data/config.js';
import { MEAL_NUTRITION } from '../data/nutrition.js';
import { getCalories, getDayNutrition } from '../utils/helpers.js';

export default function TodayCard({ mealPlan, config, hasChildren, onEdit, onRecipe }) {
  const todayDow = new Date().getDay();
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1;

  let planDayIdx = -1;
  for (let i = 0; i < config.period; i++) {
    if (i % 7 === todayIdx) { planDayIdx = i; break; }
  }
  if (planDayIdx < 0) return null;

  const todayMeals = mealPlan[planDayIdx];
  if (!todayMeals) return null;

  const todayKcal = MEAL_TYPES.reduce((sum, mt) => {
    const slot = todayMeals[mt.id];
    const name = hasChildren ? slot?.adult?.name : slot?.name;
    return sum + (name ? getCalories(name) : 0);
  }, 0);

  const dayNut = getDayNutrition(todayMeals, hasChildren);
  const nutTotal = Object.values(dayNut).reduce((a,b)=>a+b,0) || 1;

  const WEEK_LABELS = ['일','월','화','수','목','금','토'];
  const dayLabel = WEEK_LABELS[todayDow] + '요일';

  return (
    <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-rose-500 rounded-2xl p-4 mb-5 shadow-lg text-white no-print fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-semibold opacity-80 tracking-wide">📅 오늘의 식단</div>
          <div className="text-xl font-black leading-tight">{dayLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] opacity-75">오늘 예상 칼로리</div>
          <div className="text-2xl font-black">{todayKcal > 0 ? todayKcal.toLocaleString() : '—'}<span className="text-xs ml-1 opacity-80">kcal</span></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {MEAL_TYPES.map(mt => {
          const slot = todayMeals[mt.id];
          const name = hasChildren ? slot?.adult?.name : slot?.name;
          const cuisine = hasChildren ? slot?.adult?.cuisine : slot?.cuisine;
          const info = CUISINE_INFO[cuisine || 'custom'];
          return (
            <div key={mt.id}
              onClick={() => onEdit(planDayIdx, mt.id, null)}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 cursor-pointer hover:bg-white/30 active:bg-white/35 transition-all">
              <div className="text-[10px] font-semibold opacity-80 mb-1">{mt.emoji} {mt.label}</div>
              <div className="text-xs font-bold leading-tight truncate">{name || <span className="opacity-50">미설정</span>}</div>
              {name && (
                <div className="text-[10px] opacity-70 mt-0.5">{getCalories(name)}kcal · {info.label}</div>
              )}
            </div>
          );
        })}
      </div>

      {todayKcal > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] opacity-70 flex-shrink-0">영양</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden flex gap-px bg-white/20">
            {Object.entries(NUTRITION_INFO).map(([key, info]) => {
              const pct = Math.round(dayNut[key] / nutTotal * 100);
              if (!pct) return null;
              return <div key={key} className={`h-full ${info.bar} opacity-90`} style={{width:`${pct}%`}} title={`${info.label} ${pct}%`} />;
            })}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {Object.entries(NUTRITION_INFO).map(([key, info]) => dayNut[key] > 0 && (
              <span key={key} className="text-[9px] opacity-80">{info.emoji}{dayNut[key]}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
