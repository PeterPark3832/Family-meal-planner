import React, { useState, useCallback, useRef, useMemo } from 'react';
import { CUISINE_INFO, MEAL_TYPES, WEEK_DAYS, NUTRITION_INFO, IS_TOUCH } from '../data/config.js';
import { getMinAge, hasKids, getDayNutrition, formatTime, trackEvent } from '../utils/helpers.js';
import { pickOneMeal } from '../utils/algorithm.js';
import { exportToCalendar, shareImage } from '../utils/exportUtils.js';
import MealCell from './MealCell.jsx';
import MobilePlanView from './MobilePlanView.jsx';
import EditModal from './EditModal.jsx';
import CustomMealsModal from './CustomMealsModal.jsx';
import ShoppingListModal from './ShoppingListModal.jsx';
import TemplateModal from './TemplateModal.jsx';
import RecipeModal from './RecipeModal.jsx';
import StatsPanel from './StatsPanel.jsx';
import TodayCard from './TodayCard.jsx';

export default function PlanScreen({ config, mealPlan, setMealPlan, savedAt, onBack, onRegen, onImport, customMeals = [], onAddCustomMeal, onDeleteCustomMeal, ratings = {}, onRate, templates = [], onSaveTemplate, onLoadTemplate, onDeleteTemplate, onHelp }) {
  const [week, setWeek]             = useState(0);
  const [editTarget, setEdit]       = useState(null);
  const [showStats, setShowStats]   = useState(false);
  const [showCustomDB, setShowCustomDB]     = useState(false);
  const [showShopping, setShowShopping]     = useState(false);
  const [showTemplate, setShowTemplate]     = useState(false);
  const [recipeMeal, setRecipeMeal]         = useState(null);
  const [toast, setToast]                   = useState(null);
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  const allergens = config?.allergens || [];

  const showToastMsg = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const openRecipe = useCallback((name, cuisine) => {
    setRecipeMeal({ name, cuisine });
    trackEvent('recipe_searched', { meal: name, cuisine });
  }, []);

  const totalWeeks  = Math.ceil(config.period / 7);
  const weekStart   = week * 7;
  const weekEnd     = Math.min(weekStart + 7, config.period);
  const daysInWeek  = weekEnd - weekStart;
  const minAge      = getMinAge(config.members);
  const children    = hasKids(config.members);
  const todayDow    = new Date().getDay();
  const todayIdx    = todayDow === 0 ? 6 : todayDow - 1;

  // Memoize per-day nutrition so grid header doesn't recompute each render
  const weekDayNutrition = useMemo(() => {
    const result = {};
    for (let i = 0; i < daysInWeek; i++) {
      const di = weekStart + i;
      result[di] = getDayNutrition(mealPlan[di], children);
    }
    return result;
  }, [mealPlan, weekStart, daysInWeek, children]);

  const saveMeal = useCallback(({ name, cuisine, note }) => {
    const { day, mt, who } = editTarget;
    setMealPlan(prev => {
      const dayPlan = { ...prev[day] };
      if (who) {
        dayPlan[mt] = { ...(dayPlan[mt] || {}), [who]: { name, cuisine, note } };
      } else {
        dayPlan[mt] = { name, cuisine, note };
      }
      return { ...prev, [day]: dayPlan };
    });
    setEdit(null);
  }, [editTarget, setMealPlan]);

  const copyWeekToNext = useCallback(() => {
    if (totalWeeks < 2) return;
    const srcStart = week * 7;
    const dstStart = (week + 1) * 7;
    if (dstStart >= config.period) return;
    setMealPlan(prev => {
      const next = { ...prev };
      for (let i = 0; i < 7; i++) {
        if (dstStart + i < config.period) {
          next[dstStart + i] = JSON.parse(JSON.stringify(prev[srcStart + i] || {}));
        }
      }
      return next;
    });
  }, [week, totalWeeks, config.period, setMealPlan]);

  const regenOne = useCallback((day, mt, mode) => {
    if (mode === 'both') {
      const adultCur = mealPlan[day]?.[mt]?.adult?.name;
      const childCur = mealPlan[day]?.[mt]?.child?.name;
      const cAdult = pickOneMeal(mt, config.cuisines, 99,    adultCur, config.noSpicy, customMeals, ratings, allergens);
      const childNoSpicy = minAge <= 6 || config.noSpicy;
      const cChild = pickOneMeal(mt, config.cuisines, minAge, childCur, childNoSpicy, customMeals, ratings, allergens);
      setMealPlan(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mt]: {
            adult: cAdult ? { name: cAdult.name, cuisine: cAdult.cuisine } : prev[day]?.[mt]?.adult,
            child: cChild ? { name: cChild.name, cuisine: cChild.cuisine } : prev[day]?.[mt]?.child,
          }
        }
      }));
    } else {
      const current = mealPlan[day]?.[mt]?.name;
      const chosen  = pickOneMeal(mt, config.cuisines, minAge, current, config.noSpicy, customMeals, ratings, allergens);
      if (!chosen) return;
      setMealPlan(prev => ({ ...prev, [day]: { ...prev[day], [mt]: { name: chosen.name, cuisine: chosen.cuisine } } }));
    }
  }, [mealPlan, config, customMeals, ratings, allergens, minAge, setMealPlan]);

  const exportJSON = useCallback(() => {
    const payload = JSON.stringify({ config, mealPlan, exportedAt: Date.now() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `식단플래너_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config, mealPlan]);

  const importJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data?.config && data?.mealPlan) {
          onImport(data.config, data.mealPlan);
          showToastMsg('✓ 식단을 불러왔습니다');
        } else {
          showToastMsg('⚠️ 올바른 백업 파일이 아닙니다');
        }
      } catch {
        showToastMsg('⚠️ 파일을 읽을 수 없습니다');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }, [onImport, showToastMsg]);

  const shareApp = useCallback(() => {
    const url  = 'https://peterpark3832.github.io/Family-meal-planner/';
    const text = `${config.period}일 가족 식단표를 자동으로 만들었어요! 무료로 써보세요 🍽️`;
    if (navigator.share) {
      navigator.share({ title: '우리 가족 식단 플래너', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToastMsg('✓ 링크를 복사했습니다'));
    }
  }, [config.period, showToastMsg]);

  const exportText = useCallback(() => {
    const lines = [`🍽️ 우리 가족 식단표 (${config.period}일)`];
    if (children) lines.push('📌 [성인] / [아이] 분리 식단\n');
    else lines.push('');
    for (let w = 0; w < totalWeeks; w++) {
      lines.push(`[${w+1}주차]`);
      const wStart = w * 7, wEnd = Math.min(wStart+7, config.period);
      for (const mt of MEAL_TYPES) {
        if (children) {
          const adultRow = [mt.label + '(성인)'];
          const childRow = [mt.label + '(아이) '];
          for (let d = wStart; d < wEnd; d++) {
            const slot = mealPlan[d]?.[mt.id];
            adultRow.push((slot?.adult?.name || '-').slice(0,10).padEnd(11));
            childRow.push((slot?.child?.name || '-').slice(0,10).padEnd(11));
          }
          lines.push(adultRow.join(' '));
          lines.push(childRow.join(' '));
        } else {
          const row = [mt.label.padEnd(6)];
          for (let d = wStart; d < wEnd; d++) {
            row.push((mealPlan[d]?.[mt.id]?.name || '-').slice(0,10).padEnd(11));
          }
          lines.push(row.join(' '));
        }
      }
      lines.push('');
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => showToastMsg('✓ 텍스트를 복사했습니다'));
  }, [config, mealPlan, children, totalWeeks, showToastMsg]);

  return (
    <div className="max-w-5xl mx-auto p-3 py-6">
      <div className="print-title">우리 가족 식단표 ({config.period}일 플랜)</div>

      <div className="flex items-center justify-between mb-5 no-print flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all">← 설정</button>
          <div>
            <h1 className="text-lg font-black text-gray-800">우리 가족 식단표</h1>
            <p className="text-xs text-gray-400">
              {config.members.length}인 가족 · {config.period}일 플랜 · {config.cuisines.map(c => CUISINE_INFO[c].label).join(' / ')}
              {savedAt && <span className="ml-2 text-gray-300 hidden sm:inline">· 저장 {formatTime(savedAt)}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <button onClick={() => setShowStats(s => !s)} title="통계"
            className={`px-2.5 py-2 rounded-xl border text-xs font-medium transition-all touch-target ${showStats ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            📊<span className="hidden sm:inline ml-1">통계</span>
          </button>
          <button onClick={() => setShowCustomDB(true)} title="내 메뉴"
            className={`px-2.5 py-2 rounded-xl border text-xs font-medium transition-all touch-target ${customMeals.length > 0 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            ⭐<span className="hidden sm:inline ml-1">내 메뉴{customMeals.length > 0 ? ` (${customMeals.length})` : ''}</span>
          </button>
          <button onClick={() => { setShowShopping(true); trackEvent('shopping_list_opened'); }} title="장보기"
            className="px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all touch-target">
            🛒<span className="hidden sm:inline ml-1">장보기</span>
          </button>
          <button onClick={() => setShowTemplate(true)} title="템플릿"
            className={`px-2.5 py-2 rounded-xl border text-xs font-medium transition-all touch-target ${templates.length > 0 ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            📋<span className="hidden sm:inline ml-1">템플릿{templates.length > 0 ? ` (${templates.length})` : ''}</span>
          </button>
          <button onClick={onRegen} title="전체 재생성"
            className="px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all touch-target">
            🔄<span className="hidden sm:inline ml-1">재생성</span>
          </button>
          <button onClick={exportText} title="텍스트 복사"
            className="px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all touch-target">
            📄<span className="hidden sm:inline ml-1">복사</span>
          </button>
          <button onClick={exportJSON} title="JSON 저장"
            className="hidden sm:flex px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
            💾<span className="hidden sm:inline ml-1">백업</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="백업 불러오기"
            className="hidden sm:flex px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
            📂<span className="hidden sm:inline ml-1">불러오기</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importJSON} />
          <button onClick={() => exportToCalendar(mealPlan, config, children, MEAL_TYPES)} title="캘린더 내보내기"
            className="hidden sm:flex px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
            📅<span className="hidden sm:inline ml-1">캘린더</span>
          </button>
          <button onClick={() => shareImage(mealPlan, config, week, weekStart, totalWeeks, children, MEAL_TYPES, NUTRITION_INFO)} title="이미지로 공유"
            className="px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition-all touch-target">
            🖼️<span className="hidden sm:inline ml-1">이미지</span>
          </button>
          <button onClick={() => window.print()} title="인쇄"
            className="hidden sm:flex px-2.5 py-2 rounded-xl bg-gray-800 text-white text-xs font-medium hover:bg-gray-700 transition-all">
            🖨️<span className="hidden sm:inline ml-1">인쇄</span>
          </button>
          <button onClick={shareApp} aria-label="앱 공유하기"
            className="w-8 h-8 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-orange-50 hover:border-orange-300 transition-all flex items-center justify-center touch-target">🔗</button>
          <button onClick={onHelp} aria-label="사용 가이드"
            className="w-8 h-8 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 transition-all flex items-center justify-center touch-target">?</button>
        </div>
      </div>

      <TodayCard
        mealPlan={mealPlan}
        config={config}
        hasChildren={children}
        onEdit={(day, mt, who) => setEdit({ day, mt, who })}
        onRecipe={(name, cuisine) => openRecipe(name, cuisine)}
      />

      {showStats && <div className="mb-4"><StatsPanel mealPlan={mealPlan} period={config.period} hasChildren={children} members={config.members} /></div>}

      {IS_TOUCH ? (
        <MobilePlanView
          mealPlan={mealPlan}
          config={config}
          hasChildren={children}
          ratings={ratings}
          onEdit={(day, mt, who) => setEdit({ day, mt, who })}
          onRate={onRate}
          onRecipe={(name, cuisine) => openRecipe(name, cuisine)}
          onRegen={regenOne}
        />
      ) : (
        <>
          {totalWeeks > 1 && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-print">
              {Array.from({length:totalWeeks}, (_,i) => (
                <button key={i} onClick={() => setWeek(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${week===i ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                  {i+1}주차
                </button>
              ))}
              {week < totalWeeks - 1 && (
                <button onClick={copyWeekToNext} title="이번 주 식단을 다음 주로 복사"
                  className="ml-auto flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 transition-all">
                  📋 다음 주로 복사
                </button>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden print-wrap">
            <div className="week-scroll">
              <div style={{display:'grid', gridTemplateColumns:`60px repeat(${daysInWeek}, minmax(90px,1fr))`}}>
                <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-r border-gray-100 flex flex-col items-center justify-end">
                  <span className="text-[9px] text-gray-400 font-medium">영양</span>
                </div>
                {Array.from({length:daysInWeek}, (_,i) => {
                  const di = weekStart + i;
                  const dow = di % 7;
                  const isSat = dow === 5, isSun = dow === 6, isToday = dow === todayIdx && week === 0;
                  const dayNut = weekDayNutrition[di] || {};
                  const dayNutTotal = Object.values(dayNut).reduce((a,b)=>a+b,0) || 1;
                  return (
                    <div key={i} className={`p-3 text-center border-b border-l border-gray-100 transition-colors ${isToday ? 'today-col' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
                      <div className={`text-[10px] font-medium ${isToday ? 'text-orange-400' : 'text-gray-400'}`}>{isToday ? '오늘' : `${di+1}일차`}</div>
                      <div className={`font-bold text-sm ${isSat ? 'text-blue-500' : isSun ? 'text-red-500' : isToday ? 'today-header font-black' : 'text-gray-700'}`}>{WEEK_DAYS[dow]}</div>
                      <div className="flex h-1.5 rounded-full overflow-hidden mt-1.5 gap-px" title="영양 분포">
                        {Object.entries(NUTRITION_INFO).map(([key, info]) => {
                          const pct = Math.round(dayNut[key] / dayNutTotal * 100);
                          if (!pct) return null;
                          return <div key={key} className={`h-full ${info.bar}`} style={{width:`${pct}%`}} />;
                        })}
                      </div>
                    </div>
                  );
                })}
                {MEAL_TYPES.map(mt => (
                  <React.Fragment key={mt.id}>
                    <div className="p-2.5 flex flex-col items-center justify-center border-b border-r border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <span className="text-xl">{mt.emoji}</span>
                      <span className="text-[10px] font-bold text-gray-500 mt-0.5">{mt.label}</span>
                    </div>
                    {Array.from({length:daysInWeek}, (_,i) => {
                      const di = weekStart + i;
                      const dow = di % 7;
                      const isToday = dow === todayIdx && week === 0;
                      const meal = mealPlan[di]?.[mt.id];
                      return (
                        <div key={i} className={`p-1.5 border-b border-l border-gray-100 ${isToday ? 'today-col' : ''}`}>
                          <MealCell
                            meal={meal}
                            hasChildren={children}
                            onClick={children ? undefined : () => setEdit({ day:di, mt:mt.id, who:null })}
                            onClickAdult={children ? () => setEdit({ day:di, mt:mt.id, who:'adult' }) : undefined}
                            onClickChild={children ? () => setEdit({ day:di, mt:mt.id, who:'child' }) : undefined}
                            onRegen={(mode) => regenOne(di, mt.id, mode)}
                            onRate={onRate}
                            onRecipe={(name, cuisine) => openRecipe(name, cuisine)}
                            ratings={ratings}
                          />
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 no-print">
            {config.cuisines.map(c => (
              <span key={c} className={`px-3 py-1 rounded-full text-xs font-medium border ${CUISINE_INFO[c].badge} ${CUISINE_INFO[c].border}`}>
                {CUISINE_INFO[c].emoji} {CUISINE_INFO[c].label}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">✏️ 직접입력</span>
            <span className="text-xs text-gray-400 ml-auto">🎲 셀 호버 시 개별 재생성 · 클릭 시 메뉴 변경</span>
          </div>
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-2 no-print">
        {config.members.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-600">
            <span>{m.type==='child' ? '🧒' : m.gender==='male' ? '👨' : '👩'}</span>
            <span>{m.type==='adult' ? '성인' : '자녀'} · {m.age}세</span>
          </div>
        ))}
      </div>

      {editTarget && (
        <EditModal
          dayIdx={editTarget.day}
          mealType={editTarget.mt}
          meal={
            editTarget.who
              ? mealPlan[editTarget.day]?.[editTarget.mt]?.[editTarget.who]
              : mealPlan[editTarget.day]?.[editTarget.mt]
          }
          config={config}
          minAge={minAge}
          who={editTarget.who}
          onSave={saveMeal}
          onClose={() => setEdit(null)}
          customMeals={customMeals}
          onAddCustomMeal={onAddCustomMeal}
        />
      )}

      {showCustomDB && (
        <CustomMealsModal
          customMeals={customMeals}
          onAdd={onAddCustomMeal}
          onDelete={onDeleteCustomMeal}
          onClose={() => setShowCustomDB(false)}
        />
      )}

      {showTemplate && (
        <TemplateModal
          templates={templates}
          currentConfig={config}
          currentPlan={mealPlan}
          onSave={({ name }) => onSaveTemplate(name, config, mealPlan)}
          onLoad={(t) => onLoadTemplate(t)}
          onDelete={onDeleteTemplate}
          onClose={() => setShowTemplate(false)}
        />
      )}

      {showShopping && (
        <ShoppingListModal
          mealPlan={mealPlan}
          period={config.period}
          hasChildren={children}
          members={config.members}
          onClose={() => setShowShopping(false)}
        />
      )}

      {recipeMeal && (
        <RecipeModal
          mealName={recipeMeal.name}
          cuisine={recipeMeal.cuisine}
          onClose={() => setRecipeMeal(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl z-[60] fade-in pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
