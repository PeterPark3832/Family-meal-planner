import React, { useState, useEffect } from 'react';
import { MEAL_TYPES, WEEK_DAYS, CUISINE_INFO, NUTRITION_INFO } from '../data/config.js';
import { getCalories, getDayNutrition } from '../utils/helpers.js';

const DOW_SHORT = ['일','월','화','수','목','금','토'];

function MobilePersonRow({ icon, meal, ratings = {}, onEdit, onRate, onRecipe }) {
  const info = CUISINE_INFO[meal?.cuisine || 'custom'];
  const score = meal?.name ? ((ratings[meal.name]?.likes||0) - (ratings[meal.name]?.dislikes||0)) : 0;
  return (
    <div className="border-b border-stone-50 last:border-0">
      <div onClick={onEdit} className="px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-stone-50">
        <span className="text-base flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          {meal?.name
            ? <span className={`font-semibold text-stone-800 text-sm ${score >= 2 ? 'text-green-700' : score <= -1 ? 'text-red-400' : ''}`}>{meal.name}</span>
            : <span className="text-stone-300 text-sm">+ 추가</span>}
        </div>
        {meal?.name && <span className="text-lg flex-shrink-0">{info.emoji}</span>}
      </div>
      {meal?.name && (
        <div className="flex gap-2 px-4 pb-3">
          <button onClick={e => { e.stopPropagation(); onRecipe?.(meal.name, meal.cuisine); }}
            className="flex-1 py-2 bg-stone-50 rounded-xl text-sm flex items-center justify-center border border-stone-100 active:bg-red-50 transition-colors">📺</button>
          <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'like'); }}
            className={`flex-1 py-2 rounded-xl text-sm flex items-center justify-center border transition-colors active:bg-green-50 ${score > 0 ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-100'}`}>👍</button>
          <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'dislike'); }}
            className={`flex-1 py-2 rounded-xl text-sm flex items-center justify-center border transition-colors active:bg-red-50 ${score < 0 ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-100'}`}>👎</button>
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
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden card-shadow">
      {/* 카드 헤더 */}
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-stone-50">
        <div className="w-8 h-8 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-lg flex-shrink-0">
          {mealType.emoji}
        </div>
        <span className="font-bold text-stone-700 text-sm">{mealType.label}</span>
        {unified && meal?.name && (
          <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${info.badge}`}>{info.label}</span>
        )}
      </div>

      {unified ? (
        meal?.name ? (
          <>
            <div onClick={onEditUnified} className="px-4 pt-3 pb-2 flex items-start gap-3 cursor-pointer active:bg-stone-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-bold text-stone-900 text-base leading-tight ${score >= 2 ? 'text-green-700' : ''}`}>{meal.name}</span>
                </div>
                <span className="text-xs text-stone-400">{getCalories(meal.name)}kcal</span>
              </div>
              <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{info.emoji}</span>
            </div>
            {/* 액션 버튼 행 */}
            <div className="flex border-t border-stone-100">
              <button onClick={() => onRecipe?.(meal.name, meal.cuisine)}
                className="flex-1 py-2.5 flex items-center justify-center gap-1 text-xs text-stone-500 border-r border-stone-100 active:bg-red-50 hover:bg-stone-50 transition-colors">
                <span>📺</span><span className="hidden xs:inline">레시피</span>
              </button>
              <button onClick={() => onRegen('unified')}
                className="flex-1 py-2.5 flex items-center justify-center gap-1 text-xs text-stone-500 border-r border-stone-100 active:bg-orange-50 hover:bg-stone-50 transition-colors">
                <span>🎲</span><span className="hidden xs:inline">교체</span>
              </button>
              <button onClick={() => onRate?.(meal.name, 'like')}
                className={`flex-1 py-2.5 flex items-center justify-center text-base border-r border-stone-100 active:bg-green-50 transition-colors ${score > 0 ? 'bg-green-50' : 'hover:bg-stone-50'}`}>👍</button>
              <button onClick={() => onRate?.(meal.name, 'dislike')}
                className={`flex-1 py-2.5 flex items-center justify-center text-base active:bg-red-50 transition-colors ${score < 0 ? 'bg-red-50' : 'hover:bg-stone-50'}`}>👎</button>
            </div>
          </>
        ) : (
          <button onClick={onEditUnified}
            className="w-full px-4 py-5 text-stone-300 text-sm flex items-center justify-center gap-2 active:bg-stone-50 hover:bg-stone-50 transition-colors">
            <span className="text-lg">＋</span>메뉴 추가
          </button>
        )
      ) : (
        <>
          <MobilePersonRow icon="👨" meal={meal?.adult} ratings={ratings}
            onEdit={onEditAdult} onRate={onRate} onRecipe={onRecipe} />
          <MobilePersonRow icon="🧒" meal={meal?.child} ratings={ratings}
            onEdit={onEditChild} onRate={onRate} onRecipe={onRecipe} />
          <button onClick={() => onRegen('both')}
            className="w-full py-3 text-xs text-stone-400 flex items-center justify-center gap-1.5 border-t border-stone-100 active:bg-orange-50 hover:bg-stone-50 transition-colors">
            <span>🎲</span> 둘 다 재생성
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

  const handleWeekChange = (w) => {
    setSelectedWeek(w);
    setSelectedDay(w * 7);
  };

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
      {/* 주차 탭 */}
      {totalWeeks > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
          {Array.from({ length: totalWeeks }, (_, w) => (
            <button key={w} onClick={() => handleWeekChange(w)}
              className={`flex-shrink-0 h-8 px-4 rounded-xl text-xs font-bold transition-all ${
                selectedWeek === w
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-200'
                  : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300'
              }`}>
              {w + 1}주차
            </button>
          ))}
        </div>
      )}

      {/* 요일 선택 */}
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
              className={`flex-shrink-0 flex flex-col items-center w-12 py-2.5 rounded-2xl transition-all ${
                sel
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                  : isToday
                  ? 'bg-orange-50 border-2 border-orange-300 text-orange-700'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
              }`}>
              <span className={`text-[10px] font-semibold leading-none mb-0.5 ${sel ? 'opacity-70' : !sel && (isSat ? 'text-blue-500' : isSun ? 'text-red-500' : 'opacity-60')}`}>
                {DOW_SHORT[dow]}
              </span>
              <span className={`text-sm font-black leading-none ${!sel && (isSat ? 'text-blue-500' : isSun ? 'text-red-500' : '')}`}>
                {di + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* 식사 카드 */}
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
