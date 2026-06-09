import React, { useEffect } from 'react';
import { CUISINE_INFO } from '../data/config.js';

export default function RecipeModal({ mealName, cuisine, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{info?.emoji || '🍽️'}</span>
              <div>
                <h2 className="font-black text-gray-800 text-lg leading-tight">{mealName}</h2>
                <p className="text-xs text-gray-400">{info?.label || ''} · 레시피 검색</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg">✕</button>
          </div>
        </div>
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
        </div>
        <div className="px-4 pb-4">
          <p className="text-center text-[10px] text-gray-300">새 탭에서 열립니다</p>
        </div>
      </div>
    </div>
  );
}
