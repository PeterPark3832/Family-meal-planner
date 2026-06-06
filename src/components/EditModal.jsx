import React, { useState, useMemo } from 'react';
import { MEALS } from '../data/meals.js';
import { CUISINE_INFO, MEAL_TYPES } from '../data/config.js';
import { MEAL_ALLERGENS } from '../data/ingredients.js';
import { getMinAge, hasKids, coupangUrl } from '../utils/helpers.js';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getPool = (mealType, cuisines, minAge, noSpicy = false, customMeals = [], ratings = {}, allergens = []) => {
  const all = [...MEALS, ...customMeals];
  return all.filter(m =>
    (m.isUserCustom || cuisines.includes(m.cuisine)) &&
    m.types.includes(mealType) &&
    m.minAge <= minAge &&
    (!noSpicy || !m.spicy) &&
    ((ratings[m.name]?.likes || 0) - (ratings[m.name]?.dislikes || 0)) > -2 &&
    (allergens.length === 0 || !(MEAL_ALLERGENS[m.name] || []).some(a => allergens.includes(a)))
  );
};

export default function EditModal({ dayIdx, mealType, meal, config, minAge, who, onSave, onClose, customMeals = [], onAddCustomMeal }) {
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('suggest');
  const [customText, setCustomText] = useState(meal?.cuisine === 'custom' && !meal.isUserCustom ? meal.name : '');
  const [note, setNote]         = useState(meal?.note || '');
  const [pendingMeal, setPending] = useState(null);
  const [saveToDb, setSaveToDb] = useState(false);
  const [dbTypes, setDbTypes]   = useState([mealType]);
  const [dbMinAge, setDbMinAge] = useState(0);
  const [dbSpicy, setDbSpicy]   = useState(false);

  const whoLabel  = who === 'adult' ? ' · 성인' : who === 'child' ? ' · 아이' : '';
  const mealLabel = (MEAL_TYPES.find(m => m.id === mealType)?.label || '') + whoLabel;
  const effectiveMinAge   = who === 'adult' ? 99 : minAge;
  const effectiveNoSpicy  = who === 'child' ? (minAge <= 6 || config.noSpicy) : config.noSpicy;

  const toggleDbType = (t) => setDbTypes(prev =>
    prev.includes(t) ? (prev.length > 1 ? prev.filter(x => x !== t) : prev) : [...prev, t]
  );

  const suggestions = useMemo(() => {
    const regularPool = getPool(mealType, config.cuisines, effectiveMinAge, effectiveNoSpicy, []);
    const userPool = customMeals.filter(m =>
      m.types.includes(mealType) &&
      m.minAge <= effectiveMinAge &&
      (!effectiveNoSpicy || !m.spicy)
    );
    if (search.trim()) {
      const q = search.trim();
      return [
        ...userPool.filter(m => m.name.includes(q)),
        ...regularPool.filter(m => m.name.includes(q)),
      ];
    }
    return [...userPool, ...shuffle(regularPool).slice(0, Math.max(4, 16 - userPool.length))];
  }, [mealType, config.cuisines, effectiveMinAge, effectiveNoSpicy, search, customMeals]);

  const confirmSave = (base) => {
    if (saveToDb && base.name && onAddCustomMeal) {
      onAddCustomMeal({
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2),
        name: base.name,
        cuisine: 'custom',
        types: dbTypes,
        minAge: dbMinAge,
        spicy: dbSpicy,
        isUserCustom: true,
      });
    }
    onSave({ ...base, note: note.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-orange-500 font-semibold">{dayIdx+1}일차</p>
              <h3 className="text-lg font-bold text-gray-800">{mealLabel} 메뉴 선택</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl mt-0.5">✕</button>
          </div>
          <div className="flex gap-2 mt-3">
            {['suggest','custom'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===t ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}>
                {t==='suggest' ? '🍽️ 추천 메뉴' : '✏️ 직접 입력'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight:'45svh'}}>
          {tab === 'suggest' ? (
            <div className="p-4">
              <div className="relative mb-3">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="메뉴 검색..." autoFocus={window.innerWidth > 640}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pl-9 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              {suggestions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-3xl mb-2">🥲</div>
                  <p className="text-sm">검색 결과가 없어요</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((m, idx) => {
                    const info = CUISINE_INFO[m.isUserCustom ? 'custom' : m.cuisine] || CUISINE_INFO['custom'];
                    return (
                      <button key={m.id || idx}
                        onClick={() => { setPending({name:m.name, cuisine:m.isUserCustom?'custom':m.cuisine}); setTab('note'); }}
                        className={`p-3 rounded-xl border text-left transition-all hover:shadow-md active:scale-95 ${m.isUserCustom ? 'bg-yellow-50 border-yellow-300' : info.bg + ' ' + info.border} ${pendingMeal?.name===m.name ? 'ring-2 ring-orange-400' : ''}`}>
                        <div className="flex items-center gap-1">
                          {m.isUserCustom && <span className="text-[10px] text-yellow-500">⭐</span>}
                          <span className="text-sm font-medium text-gray-800 leading-tight">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-xs">{m.isUserCustom ? '⭐' : info.emoji}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${m.isUserCustom ? 'bg-yellow-100 text-yellow-700' : info.badge}`}>{m.isUserCustom ? '내 메뉴' : info.label}</span>
                          {m.spicy && <span className="text-[10px]">🌶️</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : tab === 'custom' ? (
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">메뉴 이름</label>
                <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter' && customText.trim()) confirmSave({name:customText.trim(), cuisine:'custom'}); }}
                  placeholder="예) 엄마표 불고기, 오늘의 도시락..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  autoFocus={window.innerWidth > 640} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">메모 <span className="font-normal text-gray-400">(선택)</span></label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="재료, 주의사항 등..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <button onClick={() => setSaveToDb(v => !v)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${saveToDb ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${saveToDb ? 'text-yellow-700' : 'text-gray-600'}`}>내 메뉴 DB에 저장</div>
                    <div className="text-[10px] text-gray-400">추천 목록에 항상 표시됩니다</div>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all flex-shrink-0 ${saveToDb ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm mt-0.5 transition-all ${saveToDb ? 'ml-4' : 'ml-0.5'}`} />
                </div>
              </button>
              {saveToDb && (
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 space-y-2">
                  <div className="flex gap-1.5">
                    {MEAL_TYPES.map(mt => (
                      <button key={mt.id} onClick={() => toggleDbType(mt.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${dbTypes.includes(mt.id) ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                        {mt.emoji} {mt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">최소 나이</span>
                      <input type="number" value={dbMinAge} onChange={e => setDbMinAge(parseInt(e.target.value)||0)} min="0" max="18"
                        className="w-12 border border-gray-200 rounded-lg px-1.5 py-1 text-xs text-center" />
                      <span className="text-xs text-gray-400">세+</span>
                    </div>
                    <button onClick={() => setDbSpicy(v => !v)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all ${dbSpicy ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white border-gray-200 text-gray-500'}`}>
                      🌶️ {dbSpicy ? '매운 음식' : '안 매운 음식'}
                    </button>
                  </div>
                </div>
              )}
              <button onClick={() => customText.trim() && confirmSave({name:customText.trim(), cuisine:'custom'})}
                disabled={!customText.trim()}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-orange-600 transition-all shadow-sm">
                저장하기 ✓
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              <div className={`p-3 rounded-xl border-2 ${CUISINE_INFO[pendingMeal?.cuisine||'custom'].border} ${CUISINE_INFO[pendingMeal?.cuisine||'custom'].bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CUISINE_INFO[pendingMeal?.cuisine||'custom'].emoji}</span>
                  <span className="font-bold text-gray-800">{pendingMeal?.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">메모 <span className="font-normal text-gray-400">(선택)</span></label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter') confirmSave(pendingMeal); }}
                  placeholder="재료, 소스, 주의사항 등..."
                  autoFocus={window.innerWidth > 640}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setPending(null); setTab('suggest'); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                  ← 다시 선택
                </button>
                <button onClick={() => confirmSave(pendingMeal)}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm">
                  저장하기 ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
