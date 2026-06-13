import React, { useState, useEffect } from 'react';
import { MEAL_TYPES, WEEK_DAYS, CUISINE_INFO, NUTRITION_INFO } from '../data/config.js';
import { getCalories, getDayNutrition } from '../utils/helpers.js';

function MobilePersonRow({ icon, meal, ratings = {}, onEdit, onRate, onRecipe }) {
  const info = CUISINE_INFO[meal?.cuisine || 'custom'];
  const score = meal?.name ? ((ratings[meal.name]?.likes||0) - (ratings[meal.name]?.dislikes||0)) : 0;
  return (
    <div className="border-b border-gray-50 last:border-0">
      <div onClick={onEdit} className="px-4 py-3 flex items-center gap-2 cursor-pointer active:bg-gray-50">
        <span className="text-base flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          {meal?.name
            ? <span className={`font-semibold text-gray-800 text-sm${score >= 2 ? ' text-green-700' : score <= -1 ? ' text-red-400' : ''}`}>{meal.name}</span>
            : <span className="text-gray-300 text-sm">+ 추가</span>}
        </div>
        {meal?.name && <span className="text-base flex-shrink-0">{info.emoji}</span>}
      </div>
      {meal?.name && (
        <div className="flex gap-1.5 px-4 pb-2.5">
          <button onClick={e => { e.stopPropagation(); onRecipe?.(meal.name, meal.cuisine); }}
            className="flex-1 py-1.5 bg-gray-50 rounded-xl text-sm flex items-center justify-center border border-gray-100 active:bg-red-50">📺</button>
          <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'like'); }}
            className={`flex-1 py-1.5 rounded-xl text-sm flex items-center justify-center border active:bg-green-50 ${score > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>👍</button>
          <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'dislike'); }}
            className={`flex-1 py-1.5 rounded-xl text-sm flex items-center justify-center border active:bg-red-50 ${score < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>👎</button>
        </div>
      )}
    </div>
  );
}

function MobileMealCard({ mealType, meal, hasChildren, ratings, onEditAdult, onEditChild, onEditUnified, onRate, onRecipe, onRegen }) {
  const unified = !hasChildren;
  const info = unified ? CUISINE_INFO[meal?.cuisine || 'custom'] : null;
  const score = unified && meal?.name ? ((ratings[meal.name]?.likes||0) - (ratings[meal.name]?.dislikes||0)) : 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <span className="text-lg">{mealType.emoji}</span>
        <span className="font-bold text-gray-700 text-sm">{mealType.label}</span>
      </div>

      {unified ? (
        meal?.name ? (
          <>
            <div onClick={onEditUnified} className="px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${info.badge}`}>{info.label}</span>
                  <span className="text-[11px] text-gray-400">{getCalories(meal.name)}kcal</span>
                </div>
                <span className={`font-semibold text-gray-800 text-sm${score >= 2 ? ' text-green-700' : ''}`}>{meal.name}</span>
              </div>
              <span className="text-xl flex-shrink-0">{info.emoji}</span>
            </div>
            <div className="flex border-t border-gray-100">
              <button onClick={() => onRecipe?.(meal.name, meal.cuisine)} className="flex-1 py-2.5 text-base flex items-center justify-center border-r border-gray-100 active:bg-red-50">📺</button>
              <button onClick={() => onRegen('unified')} className="flex-1 py-2.5 text-base flex items-center justify-center border-r border-gray-100 active:bg-orange-50">🎲</button>
              <button onClick={() => onRate?.(meal.name, 'like')} className={`flex-1 py-2.5 text-base flex items-center justify-center border-r border-gray-100 active:bg-green-50 ${score > 0 ? 'bg-green-50' : ''}`}>👍</button>
              <button onClick={() => onRate?.(meal.name, 'dislike')} className={`flex-1 py-2.5 text-base flex items-center justify-center active:bg-red-50 ${score < 0 ? 'bg-red-50' : ''}`}>👎</button>
            </div>
          </>
        ) : (
          <button onClick={onEditUnified} className="w-full px-4 py-5 text-gray-300 text-sm flex items-center justify-center active:bg-gray-50">+ 메뉴 추가</button>
        )
      ) : (
        <>
          <MobilePersonRow icon="👨" meal={meal?.adult} ratings={ratings}
            onEdit={onEditAdult} onRate={onRate} onRecipe={onRecipe} />
          <MobilePersonRow icon="🧒" meal={meal?.child} ratings={ratings}
            onEdit={onEditChild} onRate={onRate} onRecipe={onRecipe} />
          <button onClick={() => onRegen('both')}
            className="w-full py-2.5 text-xs text-gray-400 flex items-center justify-center gap-1 border-t border-gray-100 active:bg-orange-50">
            🎲 <span>둘 다 재생성</span>
          </button>
        </>
      )}
    </div>
  );
}

export default function MobilePlanView({ mealPlan, config, hasChildren, ratings, onEdit, onRate, onRecipe, onRegen }) {
  const period      = config.period;
  const totalWeeks  = Math.ceil(period / 7);
  const todayDow    = new Date().getDay();
  const todayDayIdx = todayDow === 0 ? 6 : todayDow - 1;

  // 오늘이 속한 주차를 초기 주차로 설정 (week 0 = 1주차)
  const initWeek = (() => {
    for (let i = 0; i < period; i++) {
      if (i % 7 === todayDayIdx) return Math.floor(i / 7);
    }
    return 0;
  })();
  const initDay = initWeek * 7 + todayDayIdx;

  const [selectedWeek, setSelectedWeek] = useState(initWeek);
  const [selectedDay,  setSelectedDay]  = useState(Math.min(initDay, period - 1));
  const dayRef = React.useRef(null);

  // 주차 변경 시 해당 주의 첫 날로 이동
  const handleWeekChange = (w) => {
    setSelectedWeek(w);
    setSelectedDay(w * 7);
  };

  // 날 변경 시 주차도 동기화
  const handleDayChange = (i) => {
    setSelectedDay(i);
    setSelectedWeek(Math.floor(i / 7));
  };

  useEffect(() => {
    if (dayRef.current) {
      const btn = dayRef.current.querySelector(`[data-day="${selectedDay}"]`);
      btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedDay]);

  const weekStart = selectedWeek * 7;
  const weekEnd   = Math.min(weekStart + 7, period);
  const meal      = mealPlan[selectedDay] || {};

  return (
    <div>
      {/* 주차 탭 — 14일 이상일 때만 표시 */}
      {totalWeeks > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
          {Array.from({ length: totalWeeks }, (_, w) => (
            <button key={w} onClick={() => handleWeekChange(w)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWeek === w
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-500'
              }`}>
              {w + 1}주차
            </button>
          ))}
        </div>
      )}

      {/* 요일 선택 — 현재 주차의 7일만 표시 */}
      <div ref={dayRef} className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {Array.from({ length: weekEnd - weekStart }, (_, i) => {
          const di  = weekStart + i;
          const dow = di % 7;
          const isSat   = dow === 5;
          const isSun   = dow === 6;
          const isToday = dow === todayDayIdx && selectedWeek === initWeek;
          const sel     = selectedDay === di;
          return (
            <button key={di} data-day={di} onClick={() => handleDayChange(di)}
              className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-2xl transition-all ${
                sel     ? 'bg-orange-500 text-white shadow-md' :
                isToday ? 'bg-orange-50 border-2 border-orange-300 text-orange-600' :
                          'bg-white border border-gray-200 text-gray-600'
              }`}>
              <span className="text-[10px] font-medium opacity-70">{di + 1}일</span>
              <span className={`text-sm font-black ${!sel && (isSat ? 'text-blue-500' : isSun ? 'text-red-500' : '')}`}>
                {WEEK_DAYS[dow]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {MEAL_TYPES.map(mt => (
          <MobileMealCard key={mt.id}
            mealType={mt}
            meal={meal[mt.id]}
            hasChildren={hasChildren}
            ratings={ratings}
            onEditUnified={() => onEdit(selectedDay, mt.id, null)}
            onEditAdult={() => onEdit(selectedDay, mt.id, 'adult')}
            onEditChild={() => onEdit(selectedDay, mt.id, 'child')}
            onRate={onRate}
            onRecipe={onRecipe}
            onRegen={(mode) => onRegen(selectedDay, mt.id, mode)}
          />
        ))}
      </div>
    </div>
  );
}
