import React from 'react';
import { CUISINE_INFO, IS_TOUCH } from '../data/config.js';
import { getCalories, getPrep } from '../utils/helpers.js';
import HalfCell from './HalfCell.jsx';

export default function MealCell({ meal, hasChildren, onClick, onClickAdult, onClickChild, onRegen, onRate, onRecipe, ratings = {} }) {
  if (hasChildren) {
    return (
      <div className="cell-wrap relative space-y-1">
        <HalfCell meal={meal?.adult} icon="👨" onClick={onClickAdult} onRate={onRate} onRecipe={onRecipe} ratings={ratings} />
        <HalfCell meal={meal?.child} icon="🧒" onClick={onClickChild} onRate={onRate} onRecipe={onRecipe} ratings={ratings} />
        {IS_TOUCH ? (
          <button onClick={e => { e.stopPropagation(); onRegen('both'); }}
            className="w-full mt-0.5 py-1 bg-white border border-gray-200 rounded text-[9px] text-gray-500 flex items-center justify-center gap-1 active:bg-orange-50">
            🎲 <span>둘 다 재생성</span>
          </button>
        ) : (
          <button onClick={e => { e.stopPropagation(); onRegen('both'); }}
            className="dice-btn absolute top-0.5 right-0.5 w-5 h-5 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] shadow-sm hover:bg-orange-50 hover:border-orange-300"
            title="둘 다 재생성">🎲</button>
        )}
      </div>
    );
  }

  const info = CUISINE_INFO[meal?.cuisine || 'custom'];
  const score = meal?.name ? ((ratings[meal.name]?.likes||0) - (ratings[meal.name]?.dislikes||0)) : 0;
  if (!meal?.name) {
    return (
      <div onClick={onClick}
        className="meal-card border-2 border-dashed border-gray-200 rounded-xl p-2 min-h-[60px] flex items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 active:bg-orange-50">
        <span className="text-gray-300 text-xs">+ 추가</span>
      </div>
    );
  }

  if (IS_TOUCH) {
    return (
      <div className={`border-2 ${info.border} ${info.bg} rounded-xl overflow-hidden${score >= 2 ? ' ring-2 ring-green-300' : score <= -1 ? ' ring-2 ring-red-200' : ''}`}>
        <div onClick={onClick} className="meal-card p-2 cursor-pointer active:opacity-80">
          <div className="flex items-start justify-between gap-1">
            <span className="text-xs font-semibold text-gray-800 leading-tight">{meal.name}</span>
            <span className="text-sm flex-shrink-0">{info.emoji}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${info.badge}`}>{info.label}</span>
            <span className="text-[10px] text-gray-400">{getCalories(meal.name)}kcal</span>
            {score >= 2 && <span className="text-[9px] text-green-600">👍</span>}
          </div>
        </div>
        <div className="flex border-t border-gray-100 bg-white/60">
          <button onClick={e => { e.stopPropagation(); onRecipe?.(meal.name, meal.cuisine); }}
            className="flex-1 py-1.5 text-xs flex items-center justify-center border-r border-gray-100 active:bg-red-50">📺</button>
          <button onClick={e => { e.stopPropagation(); onRegen('unified'); }}
            className="flex-1 py-1.5 text-xs flex items-center justify-center border-r border-gray-100 active:bg-orange-50">🎲</button>
          <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'like'); }}
            className={`flex-1 py-1.5 text-xs flex items-center justify-center border-r border-gray-100 active:bg-green-50 ${score > 0 ? 'bg-green-50' : ''}`}>👍</button>
          <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'dislike'); }}
            className={`flex-1 py-1.5 text-xs flex items-center justify-center active:bg-red-50 ${score < 0 ? 'bg-red-50' : ''}`}>👎</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cell-wrap relative">
      <div onClick={onClick}
        className={`meal-card border-2 ${info.border} ${info.bg} rounded-xl p-2.5 min-h-[72px] cursor-pointer${score >= 2 ? ' ring-2 ring-green-300' : score <= -1 ? ' ring-2 ring-red-200' : ''}`}>
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs font-medium text-gray-800 leading-tight">{meal.name}</span>
          <span className="text-sm flex-shrink-0">{info.emoji}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${info.badge}`}>{info.label}</span>
          <span className="text-[10px] text-gray-400">{getCalories(meal.name)}kcal</span>
          {getPrep(meal.name) === 'quick' && <span className="text-[10px] text-sky-500 font-semibold" title="빠른 조리 (20분 이내)">⚡</span>}
          {getPrep(meal.name) === 'long'  && <span className="text-[10px] text-amber-400" title="긴 조리 (40분 이상)">🕐</span>}
          {meal.note && <span title={meal.note} className="text-[10px] text-gray-400 cursor-help">📝</span>}
          {score >= 2 && <span className="text-[10px] text-green-600 font-medium">👍 자주 먹어요</span>}
        </div>
        {meal.note && (
          <p className="text-[10px] text-gray-400 mt-1 leading-tight truncate" title={meal.note}>{meal.note}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRegen('unified'); }}
        className="dice-btn absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs shadow-sm hover:bg-orange-50 hover:border-orange-300"
        title="다른 메뉴로 변경">🎲</button>
      <button
        onClick={(e) => { e.stopPropagation(); onRecipe?.(meal.name, meal.cuisine); }}
        className="dice-btn absolute top-1.5 left-1.5 w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs shadow-sm hover:bg-red-50 hover:border-red-300"
        title="레시피 검색">📺</button>
      <div className="dice-btn absolute bottom-1.5 right-1.5 flex gap-0.5">
        <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'like'); }}
          className={`w-5 h-5 bg-white border rounded-md flex items-center justify-center text-[10px] shadow-sm hover:bg-green-50 hover:border-green-300 ${score > 0 ? 'border-green-300' : 'border-gray-200'}`}>👍</button>
        <button onClick={e => { e.stopPropagation(); onRate?.(meal.name, 'dislike'); }}
          className={`w-5 h-5 bg-white border rounded-md flex items-center justify-center text-[10px] shadow-sm hover:bg-red-50 hover:border-red-300 ${score < 0 ? 'border-red-300' : 'border-gray-200'}`}>👎</button>
      </div>
    </div>
  );
}
