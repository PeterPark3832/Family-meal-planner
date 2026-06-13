import React, { useState } from 'react';
import { CUISINE_INFO, CURRENT_SEASON, MEAL_TYPES } from '../data/config.js';
import { MEAL_ALLERGENS } from '../data/ingredients.js';
import RestorePrompt from './RestorePrompt.jsx';

const ALLERGEN_INFO = {
  egg:       { label:'달걀',      emoji:'🥚' },
  dairy:     { label:'유제품',    emoji:'🥛' },
  gluten:    { label:'밀/글루텐', emoji:'🌾' },
  seafood:   { label:'생선',      emoji:'🐟' },
  shellfish: { label:'갑각류·연체류', emoji:'🦐' },
  soy:       { label:'콩/두부',   emoji:'🫘' },
  nuts:      { label:'견과류',    emoji:'🥜' },
};

function StepFamily({ members, setMembers }) {
  const updateCount = (n) => {
    const next = [...members];
    while (next.length < n) next.push({ type:'adult', gender:'female', age:30 });
    setMembers(next.slice(0, n));
  };
  const update = (i, field, val) => {
    const next = [...members];
    next[i] = { ...next[i], [field]: val };
    if (field==='type' && val==='adult') next[i].age = 35;
    if (field==='type' && val==='child') next[i].age = 8;
    setMembers(next);
  };
  return (
    <div className="fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-1">가족 구성원 설정</h2>
      <p className="text-gray-500 text-sm mb-5">함께 식사하는 인원을 알려주세요</p>
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">인원 수</label>
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => updateCount(n)}
              className={`w-11 h-11 rounded-xl border-2 font-bold text-sm transition-all ${members.length===n ? 'border-orange-500 bg-orange-500 text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-orange-300'}`}>
              {n}
            </button>
          ))}
          <span className="flex items-center text-gray-500 text-sm pl-1">명</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {members.map((m, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
              {m.type==='child' ? '🧒' : m.gender==='male' ? '👨' : '👩'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <select value={m.type} onChange={e => update(i,'type',e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-400 flex-1 min-w-[72px]">
                  <option value="adult">성인</option>
                  <option value="child">자녀</option>
                </select>
                <select value={m.gender} onChange={e => update(i,'gender',e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-400 flex-1 min-w-[72px]">
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
                <div className="flex items-center gap-1">
                  <input type="number" value={m.age}
                    onChange={e => update(i,'age',parseInt(e.target.value)||0)}
                    min={m.type==='child'?1:18} max={99}
                    className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:border-orange-400" />
                  <span className="text-gray-500 text-sm">세</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPeriod({ period, setPeriod, custom, setCustom }) {
  const opts = [
    { val:7,  label:'1주일', sub:'7일'  },
    { val:14, label:'2주일', sub:'14일' },
    { val:21, label:'3주일', sub:'21일' },
    { val:30, label:'한 달', sub:'30일' },
  ];
  return (
    <div className="fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-1">식단 기간 선택</h2>
      <p className="text-gray-500 text-sm mb-5">얼마나 계획하실 건가요?</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {opts.map(o => (
          <button key={o.val} onClick={() => { setPeriod(o.val); setCustom(''); }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${period===o.val && custom==='' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className={`font-bold text-lg ${period===o.val && custom==='' ? 'text-orange-600' : 'text-gray-700'}`}>{o.label}</div>
            <div className="text-gray-400 text-xs mt-0.5">{o.sub}</div>
          </button>
        ))}
      </div>
      <div onClick={() => setCustom(p => p==='' ? '10' : p)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${custom!=='' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
        <div className={`font-bold mb-2 ${custom!=='' ? 'text-orange-600' : 'text-gray-700'}`}>✏️ 직접 입력</div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <input type="number" value={custom}
            onChange={e => { setCustom(e.target.value); setPeriod(parseInt(e.target.value)||7); }}
            placeholder="일 수 입력" min="1" max="90"
            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400" />
          <span className="text-gray-500 text-sm">일</span>
        </div>
      </div>
    </div>
  );
}

function StepCuisine({ cuisines, setCuisines, noSpicy, setNoSpicy, allergens, setAllergens, seasonBoost, setSeasonBoost, preferQuick, setPreferQuick }) {
  const toggle = (c) => setCuisines(prev =>
    prev.includes(c) ? (prev.length>1 ? prev.filter(x=>x!==c) : prev) : [...prev, c]
  );
  const toggleAllergen = (a) => setAllergens(prev =>
    prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
  );
  const items = [
    { key:'korean',   icon:'🍚', desc:'김치찌개, 불고기, 된장찌개...' },
    { key:'western',  icon:'🍝', desc:'파스타, 피자, 오므라이스...'   },
    { key:'chinese',  icon:'🥢', desc:'짜장면, 탕수육, 볶음밥...'    },
    { key:'japanese', icon:'🍱', desc:'우동, 돈카츠, 오야코동...'     },
  ];
  const seasonEmojis = { '봄':'🌸', '여름':'🌻', '가을':'🍂', '겨울':'❄️' };
  return (
    <div className="fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-1">요리 종류 선택</h2>
      <p className="text-gray-500 text-sm mb-5">선호하는 요리를 선택하세요 <span className="text-orange-500 font-medium">(중복 선택 가능)</span></p>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ key, icon, desc }) => {
          const info = CUISINE_INFO[key];
          const on = cuisines.includes(key);
          return (
            <button key={key} onClick={() => toggle(key)}
              className={`p-5 rounded-xl border-2 text-left transition-all relative ${on ? `${info.border} ${info.bg} shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              {on && <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
              <div className="text-3xl mb-2">{icon}</div>
              <div className={`font-bold ${on ? 'text-gray-800' : 'text-gray-600'}`}>{info.label}</div>
              <div className="text-gray-400 text-xs mt-1 leading-tight">{desc}</div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">* 최소 1개 이상 선택해야 합니다</p>

      <button
        onClick={() => setNoSpicy(v => !v)}
        role="switch" aria-checked={noSpicy}
        className={`mt-4 w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${noSpicy ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">🌶️</span>
          <div className="text-left">
            <div className={`font-bold text-sm ${noSpicy ? 'text-rose-600' : 'text-gray-700'}`}>매운 음식 제외</div>
            <div className="text-xs text-gray-400 mt-0.5">제육볶음, 김치찌개, 짬뽕 등 🌶️ 음식을 추천에서 뺍니다</div>
          </div>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${noSpicy ? 'bg-rose-500' : 'bg-gray-200'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-sm mt-0.5 ml-0.5 transition-transform ${noSpicy ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </button>

      <button
        onClick={() => setSeasonBoost(v => !v)}
        role="switch" aria-checked={seasonBoost}
        className={`mt-4 w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${seasonBoost ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{seasonEmojis[CURRENT_SEASON]}</span>
          <div className="text-left">
            <div className={`font-bold text-sm ${seasonBoost ? 'text-green-700' : 'text-gray-700'}`}>{CURRENT_SEASON} 제철 메뉴 우선 추천</div>
            <div className="text-xs text-gray-400 mt-0.5">현재 계절에 어울리는 메뉴를 더 자주 추천합니다</div>
          </div>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${seasonBoost ? 'bg-green-500' : 'bg-gray-200'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-sm mt-0.5 ml-0.5 transition-transform ${seasonBoost ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </button>

      <button
        onClick={() => setPreferQuick(v => !v)}
        role="switch" aria-checked={preferQuick}
        className={`mt-4 w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${preferQuick ? 'border-sky-400 bg-sky-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <div className="text-left">
            <div className={`font-bold text-sm ${preferQuick ? 'text-sky-700' : 'text-gray-700'}`}>주중 빠른 조리 우선</div>
            <div className="text-xs text-gray-400 mt-0.5">월~금에는 20분 이내 간편 메뉴를 우선 추천합니다</div>
          </div>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${preferQuick ? 'bg-sky-500' : 'bg-gray-200'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-sm mt-0.5 ml-0.5 transition-transform ${preferQuick ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </button>

      <div className="mt-4 p-4 rounded-xl border-2 border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold text-sm text-gray-700">알레르기 제외</div>
            <div className="text-xs text-gray-400 mt-0.5">해당 재료가 포함된 메뉴를 추천에서 제외합니다</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ALLERGEN_INFO).map(([key, { label, emoji }]) => {
            const on = allergens.includes(key);
            return (
              <button key={key} onClick={() => toggleAllergen(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${on ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <span>{emoji}</span>{label}
                {on && <span className="text-amber-500">✓</span>}
              </button>
            );
          })}
        </div>
        {allergens.length > 0 && (
          <p className="text-[10px] text-amber-600 mt-2">
            ⚠️ {allergens.map(a => ALLERGEN_INFO[a]?.label).join(', ')} 포함 메뉴가 제외됩니다
          </p>
        )}
      </div>
    </div>
  );
}

export default function SetupScreen({ onComplete, restore, onHelp }) {
  const [step, setStep]         = useState(1);
  const [members, setMembers]   = useState([
    { type:'adult', gender:'male',   age:35 },
    { type:'adult', gender:'female', age:33 },
  ]);
  const [period, setPeriod]     = useState(7);
  const [custom, setCustom]     = useState('');
  const [cuisines, setCuisines]   = useState(['korean']);
  const [noSpicy, setNoSpicy]     = useState(false);
  const [allergens, setAllergens]   = useState([]);
  const [seasonBoost, setSeasonBoost] = useState(false);
  const [preferQuick, setPreferQuick] = useState(false);
  const [restoreData, setRestoreData] = useState(restore || null);

  const finalPeriod = custom !== '' ? (parseInt(custom)||7) : period;
  const stepLabels  = ['가족 구성원','식단 기간','요리 종류'];

  return (
    <div className="max-w-xl mx-auto p-4 py-6 sm:py-10">
      {restoreData && (
        <RestorePrompt
          savedAt={restoreData.savedAt}
          onRestore={() => { setRestoreData(null); onComplete(restoreData.config, restoreData.mealPlan); }}
          onDismiss={() => setRestoreData(null)}
        />
      )}

      <div className="text-center mb-6 sm:mb-8 relative">
        <button onClick={onHelp}
          className="absolute top-0 right-0 w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-400 text-sm font-bold hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm"
          title="사용 가이드">?</button>
        <div className="text-5xl sm:text-6xl mb-2 sm:mb-3 select-none">🍽️</div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800">우리 가족 식단 플래너</h1>
        <p className="text-gray-500 mt-1.5 text-xs sm:text-sm">맞춤형 식단으로 건강한 한 주를 시작해요</p>
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-6 sm:mb-8">
        {stepLabels.map((lbl, i) => {
          const s = i + 1, done = s < step, active = s === step;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${done ? 'bg-green-500 text-white' : active ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                  {done ? '✓' : s}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1 font-medium ${active ? 'text-orange-600' : 'text-gray-400'}`}>{lbl}</span>
              </div>
              {i < 2 && <div className={`w-8 sm:w-12 h-0.5 mb-5 rounded flex-shrink-0 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {step === 1 && <StepFamily members={members} setMembers={setMembers} />}
        {step === 2 && <StepPeriod period={period} setPeriod={setPeriod} custom={custom} setCustom={setCustom} />}
        {step === 3 && <StepCuisine cuisines={cuisines} setCuisines={setCuisines} noSpicy={noSpicy} setNoSpicy={setNoSpicy} allergens={allergens} setAllergens={setAllergens} seasonBoost={seasonBoost} setSeasonBoost={setSeasonBoost} preferQuick={preferQuick} setPreferQuick={setPreferQuick} />}

        <div className="flex justify-between mt-8">
          <button onClick={() => setStep(s => s-1)} disabled={step===1}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-30 hover:bg-gray-50 transition-all">
            ← 이전
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s+1)}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-200">
              다음 →
            </button>
          ) : (
            <button onClick={() => onComplete({ members, period: finalPeriod, cuisines, noSpicy, allergens, seasonBoost, preferQuick })}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-md shadow-orange-200">
              식단 생성 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
