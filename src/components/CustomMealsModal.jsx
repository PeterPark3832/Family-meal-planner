import React, { useState, useEffect } from 'react';
import { MEAL_TYPES } from '../data/config.js';

export default function CustomMealsModal({ customMeals, onAdd, onDelete, onClose }) {
  const [name, setName]     = useState('');
  const [types, setTypes]   = useState(['lunch','dinner']);
  const [minAge, setMinAge] = useState(0);
  const [spicy, setSpicy]   = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleType = (t) => setTypes(prev =>
    prev.includes(t) ? (prev.length > 1 ? prev.filter(x => x !== t) : prev) : [...prev, t]
  );

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      name: name.trim(),
      cuisine: 'custom',
      types,
      minAge,
      spicy,
      isUserCustom: true,
    });
    setName('');
    setTypes(['lunch','dinner']);
    setMinAge(0);
    setSpicy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">⭐ 내 메뉴 DB</h3>
              <p className="text-xs text-gray-500 mt-0.5">자주 만드는 메뉴를 저장하면 추천 목록에 항상 표시됩니다</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight:'65vh'}}>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">메뉴 이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter' && name.trim()) handleAdd(); }}
              placeholder="예) 엄마표 불고기, 특제 된장찌개..."
              autoFocus={false}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 mb-3" />
            <div className="flex gap-2 mb-3">
              {MEAL_TYPES.map(mt => (
                <button key={mt.id} onClick={() => toggleType(mt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${types.includes(mt.id) ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  {mt.emoji} {mt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">최소 나이</span>
                <input type="number" value={minAge} onChange={e => setMinAge(parseInt(e.target.value)||0)} min="0" max="18"
                  className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center" />
                <span className="text-xs text-gray-400">세 이상</span>
              </div>
              <button onClick={() => setSpicy(v => !v)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${spicy ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                🌶️ {spicy ? '매운 음식' : '안 매운 음식'}
              </button>
            </div>
            <button onClick={handleAdd} disabled={!name.trim()}
              className="mt-3 w-full py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-yellow-600 transition-all shadow-sm">
              + 추가하기
            </button>
          </div>

          <div className="p-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">저장된 메뉴 ({customMeals.length}개)</p>
            {customMeals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">아직 저장된 메뉴가 없어요</p>
                <p className="text-xs mt-1">위에서 메뉴를 추가해 보세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customMeals.map(m => (
                  <div key={m.id} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <span className="text-sm flex-1 font-medium text-gray-800">{m.name}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {m.types.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">
                          {MEAL_TYPES.find(x => x.id===t)?.label}
                        </span>
                      ))}
                    </div>
                    {m.spicy && <span className="text-xs flex-shrink-0">🌶️</span>}
                    <button onClick={() => onDelete(m.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-base flex-shrink-0 ml-1">🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
