import React, { useState, useMemo, useEffect } from 'react';
import { CUISINE_INFO, CAT_ORDER, CAT_EMOJI } from '../data/config.js';
import { MEALS } from '../data/meals.js';
import { MEAL_INGREDIENTS, INGREDIENT_CATEGORY, INGREDIENT_QUANTITY } from '../data/ingredients.js';
import { coupangUrl, coupangMealUrl } from '../utils/helpers.js';

export default function ShoppingListModal({ mealPlan, period, hasChildren, members = [], onClose }) {
  const [checked, setChecked]   = useState(new Set());
  const [copied, setCopied]     = useState(false);
  const [view, setView]         = useState('category');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const { grouped, totalCount, mealList, ingToMeals, mealCounts } = useMemo(() => {
    const mealNames = new Set();
    for (let d = 0; d < period; d++) {
      for (const mt of ['breakfast','lunch','dinner']) {
        const slot = mealPlan[d]?.[mt];
        if (!slot) continue;
        if (hasChildren) {
          if (slot.adult?.name) mealNames.add(slot.adult.name);
          if (slot.child?.name) mealNames.add(slot.child.name);
        } else {
          if (slot.name) mealNames.add(slot.name);
        }
      }
    }

    const mealCounts = {};
    for (let d = 0; d < period; d++) {
      for (const mt of ['breakfast','lunch','dinner']) {
        const slot = mealPlan[d]?.[mt];
        if (!slot) continue;
        if (hasChildren) {
          if (slot.adult?.name) mealCounts[slot.adult.name] = (mealCounts[slot.adult.name]||0)+1;
          if (slot.child?.name) mealCounts[slot.child.name] = (mealCounts[slot.child.name]||0)+1;
        } else {
          if (slot.name) mealCounts[slot.name] = (mealCounts[slot.name]||0)+1;
        }
      }
    }

    const ingredients = new Set();
    const ingToMeals = {};
    mealNames.forEach(name => {
      (MEAL_INGREDIENTS[name] || []).forEach(ing => {
        ingredients.add(ing);
        if (!ingToMeals[ing]) ingToMeals[ing] = [];
        if (!ingToMeals[ing].includes(name)) ingToMeals[ing].push(name);
      });
    });
    const groups = {};
    ingredients.forEach(ing => {
      const cat = INGREDIENT_CATEGORY[ing] || '기타';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ing);
    });
    CAT_ORDER.forEach(cat => { if (groups[cat]) groups[cat].sort(); });

    const mealList = [...mealNames]
      .filter(name => MEAL_INGREDIENTS[name])
      .sort()
      .map(name => ({
        name,
        cuisine: MEALS.find(m => m.name === name)?.cuisine || 'custom',
        ingredients: MEAL_INGREDIENTS[name] || [],
      }));

    return { grouped: groups, totalCount: ingredients.size, mealList, ingToMeals, mealCounts };
  }, [mealPlan, period, hasChildren]);

  const adultCount = members.filter(m => m.type === 'adult').length || 1;
  const kidCount   = members.filter(m => m.type === 'child').length;
  const getIngQty  = (ing) => {
    const q = INGREDIENT_QUANTITY[ing];
    if (!q) return null;
    const meals = ingToMeals[ing] || [];
    const occ = meals.reduce((s, mn) => s + (mealCounts[mn]||0), 0);
    if (!occ) return null;
    const raw = occ * (adultCount * q.perAdult + kidCount * q.perChild);
    const rounded = raw < 1 ? Math.ceil(raw * 10) / 10 : Math.ceil(raw);
    return `약 ${rounded}${q.unit}`;
  };

  const toggle = (item) => setChecked(prev => {
    const next = new Set(prev);
    next.has(item) ? next.delete(item) : next.add(item);
    return next;
  });

  const remaining = totalCount - checked.size;

  const copyCategory = () => {
    const lines = ['🛒 장보기 목록\n'];
    CAT_ORDER.forEach(cat => {
      const items = (grouped[cat] || []).filter(i => !checked.has(i));
      if (items.length) {
        lines.push(`[${CAT_EMOJI[cat]} ${cat}]`);
        items.forEach(i => lines.push(`  ☐ ${i}`));
        lines.push('');
      }
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyMeal = () => {
    const lines = ['🍽️ 메뉴별 재료 목록\n'];
    mealList.forEach(({ name, ingredients }) => {
      lines.push(`[ ${name} ]`);
      lines.push(`  ${ingredients.join(', ')}`);
      lines.push('');
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800">🛒 장보기 목록</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {view === 'category'
                  ? <>총 {totalCount}가지 재료 · 남은 항목 <span className="text-green-600 font-bold">{remaining}개</span></>
                  : <>{mealList.length}가지 메뉴의 재료를 한눈에</>
                }
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={view === 'category' ? copyCategory : copyMeal}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${copied ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {copied ? '✓ 복사됨' : '📋 복사'}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
          </div>
          <div className="flex gap-2">
            {[['category','📦 재료별'],['meal','🍽️ 메뉴별']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight:'60vh'}}>
          {totalCount === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-3xl mb-2">🧺</div>
              <p className="text-sm">식단에 등록된 재료가 없어요</p>
            </div>
          ) : view === 'category' ? (
            <div className="p-4 space-y-4">
              {CAT_ORDER.filter(cat => grouped[cat]).map(cat => (
                <div key={cat}>
                  <p className="text-xs font-bold text-gray-500 mb-2">{CAT_EMOJI[cat]} {cat}</p>
                  <div className="space-y-1.5">
                    {grouped[cat].map(item => (
                      <div key={item}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                          checked.has(item)
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}>
                        <button onClick={() => toggle(item)} className="flex items-start gap-2 flex-1 text-left min-w-0">
                          <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] mt-0.5 ${checked.has(item) ? 'bg-gray-300 border-gray-300 text-white' : 'border-gray-300'}`}>
                            {checked.has(item) ? '✓' : ''}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${checked.has(item) ? 'line-through text-gray-300' : 'text-gray-700'}`}>{item}</span>
                          {!checked.has(item) && getIngQty(item) && (
                            <span className="text-[10px] text-blue-500 font-medium mt-0.5 block">{getIngQty(item)}</span>
                          )}
                            {!checked.has(item) && ingToMeals[item] && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ingToMeals[item].slice(0, 4).map(meal => {
                                  const c = MEALS.find(m => m.name === meal)?.cuisine || 'custom';
                                  return (
                                    <span key={meal} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${CUISINE_INFO[c].badge} ${CUISINE_INFO[c].border}`}>
                                      {meal}
                                    </span>
                                  );
                                })}
                                {ingToMeals[item].length > 4 && (
                                  <span className="text-[9px] text-gray-400">+{ingToMeals[item].length - 4}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                        {!checked.has(item) && (
                          <a href={coupangUrl(item)} target="_blank" rel="noopener noreferrer sponsored"
                            onClick={e => e.stopPropagation()}
                            className="flex-shrink-0 flex flex-col items-center gap-0.5"
                            title="쿠팡 파트너스 광고 — 구매 시 수수료가 발생합니다">
                            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-wide leading-none">AD</span>
                            <span className="text-[10px] px-2 py-1 bg-red-50 border border-red-200 text-red-500 rounded-lg font-bold hover:bg-red-100 hover:text-red-600 transition-all whitespace-nowrap">
                              쿠팡↗
                            </span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {mealList.map(({ name, cuisine, ingredients }) => {
                const info = CUISINE_INFO[cuisine] || CUISINE_INFO['custom'];
                const allChecked = ingredients.every(i => checked.has(i));
                return (
                  <div key={name} className={`rounded-xl border p-3 transition-all ${allChecked ? 'opacity-50 bg-gray-50 border-gray-200' : `${info.bg} ${info.border}`}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{info.emoji}</span>
                      <span className={`font-bold text-sm ${allChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{name}</span>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium ${info.badge}`}>{info.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredients.map(ing => (
                        <button key={ing} onClick={() => toggle(ing)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                            checked.has(ing)
                              ? 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                          }`}>
                          {checked.has(ing) ? '✓ ' : ''}{ing}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                      <a href={coupangMealUrl()} target="_blank" rel="noopener noreferrer sponsored"
                        className="inline-flex items-center gap-1 text-[11px] text-red-500 font-semibold hover:text-red-600 transition-colors">
                        🛒 쿠팡에서 재료 장보기 →
                      </a>
                      <span className="text-[9px] text-gray-300 font-bold border border-gray-200 px-1 rounded">광고</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50">
          {view === 'category' && checked.size > 0 && (
            <button onClick={() => setChecked(new Set())}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors border-b border-gray-100">
              체크 모두 해제
            </button>
          )}
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <p className="text-[10px] text-gray-400">🛒 추천 식재료</p>
              <span className="text-[9px] font-bold text-gray-300 border border-gray-200 px-1 rounded">광고</span>
            </div>
            <iframe
              src="./coupang-banner.html"
              width="100%" height="158"
              frameBorder="0" scrolling="no"
              style={{border:'none', borderRadius:'8px', display:'block'}}
              title="쿠팡 파트너스 광고 — 추천 식재료"
            />
            <p className="text-[9px] text-gray-300 mt-1 text-right">이 링크는 쿠팡 파트너스 광고이며, 구매 시 수수료가 발생합니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
