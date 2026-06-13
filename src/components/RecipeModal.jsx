import React, { useEffect, useState } from 'react';
import { CUISINE_INFO } from '../data/config.js';
import { RECIPES } from '../data/recipes.js';

export default function RecipeModal({ mealName, cuisine, onClose }) {
  const [tab, setTab] = useState('recipe');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const recipe = RECIPES[mealName];
  // 내장 레시피가 없으면 검색 탭으로 기본 전환
  useEffect(() => { if (!recipe) setTab('search'); }, [recipe]);

  const q = encodeURIComponent(mealName);
  const links = [
    {
      name: 'YouTube',
      emoji: '▶️',
      desc: '영상 레시피',
      color: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
      badge: 'bg-red-100 text-red-600',
      url: `https://www.youtube.com/results?search_query=${q}+만들기+레시피`,
    },
    {
      name: '만개의레시피',
      emoji: '📖',
      desc: '단계별 레시피',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
      badge: 'bg-orange-100 text-orange-600',
      url: `https://www.10000recipe.com/recipe/list.html?q=${q}`,
    },
    {
      name: '네이버 레시피',
      emoji: '🟢',
      desc: '블로그·카페',
      color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
      badge: 'bg-green-100 text-green-600',
      url: `https://search.naver.com/search.naver?query=${q}+레시피`,
    },
    {
      name: '구글 검색',
      emoji: '🔍',
      desc: '전체 웹 검색',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
      badge: 'bg-blue-100 text-blue-600',
      url: `https://www.google.com/search?q=${q}+레시피+만들기`,
    },
  ];
  const info = CUISINE_INFO[cuisine || 'custom'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.45)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{info?.emoji || '🍽️'}</span>
              <div>
                <h2 className="font-black text-gray-800 text-lg leading-tight">{mealName}</h2>
                <p className="text-xs text-gray-400">{info?.label || ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg">✕</button>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mt-3">
            {recipe && (
              <button onClick={() => setTab('recipe')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'recipe' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                📋 레시피
              </button>
            )}
            <button onClick={() => setTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'search' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              🔍 검색
            </button>
          </div>
        </div>

        {/* 내장 레시피 탭 */}
        {tab === 'recipe' && recipe && (
          <div className="overflow-y-auto" style={{maxHeight:'65vh'}}>
            {/* 기본 정보 */}
            <div className="flex gap-3 px-5 pt-4 pb-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-orange-50 px-2.5 py-1 rounded-full">
                <span>⏱</span><span>{recipe.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-blue-50 px-2.5 py-1 rounded-full">
                <span>👥</span><span>{recipe.serves}</span>
              </div>
            </div>

            {/* 재료 */}
            <div className="px-5 pt-2 pb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">재료</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full text-gray-700">{ing}</span>
                ))}
              </div>
            </div>

            {/* 조리 순서 */}
            <div className="px-5 pb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">조리 순서</p>
              <ol className="space-y-2.5">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* 영상 레시피 보기 링크 */}
            <div className="px-5 pb-4 border-t border-gray-100 pt-3">
              <a href={`https://www.youtube.com/results?search_query=${q}+만들기`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold hover:bg-red-100 transition-all">
                ▶️ 영상으로 보기
              </a>
            </div>
          </div>
        )}

        {/* 검색 탭 */}
        {tab === 'search' && (
          <div className="p-4 space-y-2.5">
            {links.map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${l.color}`}>
                <span className="text-2xl">{l.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{l.name}</div>
                  <div className="text-xs opacity-70">{l.desc}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${l.badge}`}>열기 →</span>
              </a>
            ))}
            <p className="text-center text-[10px] text-gray-300 pt-1">새 탭에서 열립니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
