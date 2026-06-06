import React from 'react';
import { CUISINE_INFO, IS_TOUCH } from '../data/config.js';

export default function HalfCell({ meal, icon, onClick, onRate, onRecipe, ratings = {} }) {
  const info = CUISINE_INFO[meal?.cuisine || 'custom'];
  const score = meal?.name ? ((ratings[meal.name]?.likes||0) - (ratings[meal.name]?.dislikes||0)) : 0;

  if (IS_TOUCH) {
    return (
      <div>
        <div onClick={onClick}
          className={`meal-card cursor-pointer border rounded-lg px-1.5 py-1 transition-all ${
            meal?.name
              ? `${info.border} ${info.bg}${score >= 2 ? ' ring-1 ring-green-300' : score <= -1 ? ' ring-1 ring-red-200' : ''}`
              : 'border-dashed border-gray-200'
          }`}>
          <div className="flex items-center gap-1">
            <span className="text-[10px] flex-shrink-0">{icon}</span>
            <span className="text-[11px] font-semibold text-gray-800 leading-tight truncate flex-1">
              {meal?.name || <span className="text-gray-300">+ 추가</span>}
            </span>
            {meal?.name && <span className="text-[10px] flex-shrink-0">{info.emoji}</span>}
          </div>
        </div>
        {meal?.name && (
          <div className="flex gap-0.5 mt-0.5">
            <button onClick={e => { e.stopPropagation(); onRecipe?.(meal.name, meal.cuisine); }}
              className="flex-1 h-5 bg-white border border-gray-200 rounded text-[9px] flex items-center justify-center hover:bg-red-50 active:bg-red-100">📺</button>
            <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'like'); }}
              className={`flex-1 h-5 bg-white border rounded text-[9px] flex items-center justify-center active:bg-green-100 ${score > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>👍</button>
            <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'dislike'); }}
              className={`flex-1 h-5 bg-white border rounded text-[9px] flex items-center justify-center active:bg-red-100 ${score < 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>👎</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div onClick={onClick}
        className={`meal-card cursor-pointer border rounded-lg p-1.5 transition-all hover:shadow-sm ${
          meal?.name
            ? `${info.border} ${info.bg}${score >= 2 ? ' ring-1 ring-green-300' : score <= -1 ? ' ring-1 ring-red-200' : ''}`
            : 'border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50'
        }`}>
        <div className="flex items-center gap-1">
          <span className="text-[10px] flex-shrink-0">{icon}</span>
          <span className="text-[11px] font-semibold text-gray-800 leading-tight truncate flex-1">
            {meal?.name || <span className="text-gray-300">+ 추가</span>}
          </span>
          {meal?.name && <span className="text-xs flex-shrink-0">{info.emoji}</span>}
        </div>
        {meal?.note && <p className="text-[9px] text-gray-400 mt-0.5 truncate pl-4">{meal.note}</p>}
      </div>
      {meal?.name && (
        <>
          <button onClick={e => { e.stopPropagation(); onRecipe?.(meal.name, meal.cuisine); }}
            className="dice-btn absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] shadow-sm hover:bg-red-50 hover:border-red-300"
            title="레시피 검색">📺</button>
          <div className="dice-btn absolute bottom-0.5 right-0.5 flex gap-0.5">
            <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'like'); }}
              className={`w-5 h-5 bg-white border rounded flex items-center justify-center text-[10px] shadow-sm hover:bg-green-50 hover:border-green-300 ${score > 0 ? 'border-green-300' : 'border-gray-200'}`}>👍</button>
            <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'dislike'); }}
              className={`w-5 h-5 bg-white border rounded flex items-center justify-center text-[10px] shadow-sm hover:bg-red-50 hover:border-red-300 ${score < 0 ? 'border-red-300' : 'border-gray-200'}`}>👎</button>
          </div>
        </>
      )}
    </div>
  );
}
