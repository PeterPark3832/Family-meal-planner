import React, { useState } from 'react';
import {
  Check, ChevronLeft, ChevronRight, Sparkles, HelpCircle,
  AlertTriangle, Flame, Zap, Leaf, Sun, Snowflake, Wind,
  PenLine, UtensilsCrossed, Users,
} from 'lucide-react';
import { CUISINE_INFO, CURRENT_SEASON, MEAL_TYPES } from '../data/config.js';
import { MEAL_ALLERGENS } from '../data/ingredients.js';
import RestorePrompt from './RestorePrompt.jsx';

const ALLERGEN_INFO = {
  egg:       { label:'달걀',          emoji:'🥚' },
  dairy:     { label:'유제품',         emoji:'🥛' },
  gluten:    { label:'밀/글루텐',      emoji:'🌾' },
  seafood:   { label:'생선',           emoji:'🐟' },
  shellfish: { label:'갑각류·연체류',   emoji:'🦐' },
  soy:       { label:'콩/두부',        emoji:'🫘' },
  nuts:      { label:'견과류',         emoji:'🥜' },
};

const SEASON_ICONS = {
  '봄': <Wind size={18} />,
  '여름': <Sun size={18} />,
  '가을': <Leaf size={18} />,
  '겨울': <Snowflake size={18} />,
};

function Toggle({ on, onChange, color = 'orange' }) {
  const tracks = {
    rose: on ? 'bg-rose-500' : 'bg-stone-200',
    green: on ? 'bg-green-500' : 'bg-stone-200',
    sky: on ? 'bg-sky-500' : 'bg-stone-200',
    orange: on ? 'bg-orange-600' : 'bg-stone-200',
  };
  return (
    <button onClick={onChange} role="switch" aria-checked={on}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${tracks[color]}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function OptionRow({ icon, title, desc, on, onChange, color }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={on}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
        on ? 'border-stone-200 bg-stone-50' : 'border-stone-100 bg-white hover:border-stone-200'
      }`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`flex-shrink-0 ${on ? 'text-stone-700' : 'text-stone-400'}`}>{icon}</span>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-stone-800 leading-tight">{title}</div>
          <div className="text-xs text-stone-400 mt-0.5 leading-tight">{desc}</div>
        </div>
      </div>
      <Toggle on={on} onChange={e => { e.stopPropagation(); onChange(); }} color={color} />
    </button>
  );
}

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
      <h2 className="text-lg font-bold text-stone-900 mb-0.5">가족 구성원 설정</h2>
      <p className="text-stone-400 text-sm mb-5">함께 식사하는 인원을 알려주세요</p>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">인원 수</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => updateCount(n)}
              className={`w-11 h-11 rounded-xl border-2 font-bold text-sm transition-all ${
                members.length===n
                  ? 'border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-200'
                  : 'border-stone-200 text-stone-500 hover:border-orange-300 bg-white'
              }`}>
              {n}
            </button>
          ))}
          <span className="flex items-center text-stone-400 text-sm pl-1 font-medium">명</span>
        </div>
      </div>

      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-orange-500" />
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1 min-w-0">
              <select value={m.type} onChange={e => update(i,'type',e.target.value)}
                className="border border-stone-200 rounded-xl px-2 py-2 text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all">
                <option value="adult">성인</option>
                <option value="child">자녀</option>
              </select>
              <select value={m.gender} onChange={e => update(i,'gender',e.target.value)}
                className="border border-stone-200 rounded-xl px-2 py-2 text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all">
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
              <div className="flex items-center gap-1">
                <input type="number" value={m.age}
                  onChange={e => update(i,'age',parseInt(e.target.value)||0)}
                  min={m.type==='child'?1:18} max={99}
                  className="w-full border border-stone-200 rounded-xl px-2 py-2 text-sm text-center bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                <span className="text-stone-400 text-sm flex-shrink-0">세</span>
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
      <h2 className="text-lg font-bold text-stone-900 mb-0.5">식단 기간 선택</h2>
      <p className="text-stone-400 text-sm mb-5">얼마나 계획하실 건가요?</p>
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        {opts.map(o => {
          const on = period===o.val && custom==='';
          return (
            <button key={o.val} onClick={() => { setPeriod(o.val); setCustom(''); }}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                on ? 'border-orange-600 bg-orange-50' : 'border-stone-100 hover:border-stone-200 bg-white'
              }`}>
              <div className={`font-bold text-lg leading-tight ${on ? 'text-orange-700' : 'text-stone-700'}`}>{o.label}</div>
              <div className={`text-xs mt-0.5 ${on ? 'text-orange-400' : 'text-stone-400'}`}>{o.sub}</div>
            </button>
          );
        })}
      </div>
      <div onClick={() => setCustom(p => p==='' ? '10' : p)}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
          custom!=='' ? 'border-orange-600 bg-orange-50' : 'border-stone-100 hover:border-stone-200 bg-white'
        }`}>
        <div className={`flex items-center gap-1.5 font-semibold text-sm mb-3 ${custom!=='' ? 'text-orange-700' : 'text-stone-600'}`}>
          <PenLine size={14} /> 직접 입력
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <input type="number" value={custom}
            onChange={e => { setCustom(e.target.value); setPeriod(parseInt(e.target.value)||7); }}
            placeholder="일 수 입력" min="1" max="90"
            className="w-28 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          <span className="text-stone-400 text-sm">일</span>
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
    { key:'korean',   icon:'🍚', desc:'김치찌개, 불고기, 된장찌개' },
    { key:'western',  icon:'🍝', desc:'파스타, 카레, 오므라이스' },
    { key:'chinese',  icon:'🥢', desc:'짜장면, 탕수육, 볶음밥' },
    { key:'japanese', icon:'🍱', desc:'우동, 돈카츠, 오야코동' },
  ];

  return (
    <div className="fade-in">
      <h2 className="text-lg font-bold text-stone-900 mb-0.5">요리 종류 선택</h2>
      <p className="text-stone-400 text-sm mb-4">선호하는 요리를 선택하세요 <span className="text-orange-600 font-medium">(중복 가능)</span></p>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {items.map(({ key, icon, desc }) => {
          const info = CUISINE_INFO[key];
          const on = cuisines.includes(key);
          return (
            <button key={key} onClick={() => toggle(key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                on ? 'border-orange-600 bg-orange-50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-200'
              }`}>
              {on && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
              <div className="text-3xl mb-2">{icon}</div>
              <div className={`font-bold text-sm ${on ? 'text-orange-700' : 'text-stone-700'}`}>{info.label}</div>
              <div className="text-stone-400 text-xs mt-1 leading-tight">{desc}</div>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        <OptionRow
          icon={<Flame size={18} />}
          title="매운 음식 제외"
          desc="제육볶음, 김치찌개, 짬뽕 등 매운 음식을 제외합니다"
          on={noSpicy} onChange={() => setNoSpicy(v => !v)} color="rose" />
        <OptionRow
          icon={SEASON_ICONS[CURRENT_SEASON] || <Sun size={18} />}
          title={`${CURRENT_SEASON} 제철 메뉴 우선`}
          desc="현재 계절에 어울리는 메뉴를 더 자주 추천합니다"
          on={seasonBoost} onChange={() => setSeasonBoost(v => !v)} color="green" />
        <OptionRow
          icon={<Zap size={18} />}
          title="주중 빠른 조리 우선"
          desc="월~금 20분 이내 간편 메뉴를 우선 추천합니다"
          on={preferQuick} onChange={() => setPreferQuick(v => !v)} color="sky" />

        <div className="p-4 rounded-2xl border-2 border-stone-100 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={17} className="text-amber-500 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-stone-800">알레르기 제외</div>
              <div className="text-xs text-stone-400 mt-0.5">해당 재료가 포함된 메뉴를 추천에서 제외합니다</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ALLERGEN_INFO).map(([key, { label, emoji }]) => {
              const on = allergens.includes(key);
              return (
                <button key={key} onClick={() => toggleAllergen(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    on ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}>
                  <span>{emoji}</span>{label}
                  {on && <Check size={10} strokeWidth={3} className="text-amber-500" />}
                </button>
              );
            })}
          </div>
          {allergens.length > 0 && (
            <p className="flex items-center gap-1 text-[10px] text-amber-600 mt-2.5 font-medium">
              <AlertTriangle size={11} />
              {allergens.map(a => ALLERGEN_INFO[a]?.label).join(', ')} 포함 메뉴가 제외됩니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupScreen({ onComplete, restore, onHelp }) {
  const [step, setStep]           = useState(1);
  const [members, setMembers]     = useState([
    { type:'adult', gender:'male',   age:35 },
    { type:'adult', gender:'female', age:33 },
  ]);
  const [period, setPeriod]       = useState(7);
  const [custom, setCustom]       = useState('');
  const [cuisines, setCuisines]   = useState(['korean']);
  const [noSpicy, setNoSpicy]     = useState(false);
  const [allergens, setAllergens] = useState([]);
  const [seasonBoost, setSeasonBoost] = useState(false);
  const [preferQuick, setPreferQuick] = useState(false);
  const [restoreData, setRestoreData] = useState(restore || null);

  const finalPeriod = custom !== '' ? (parseInt(custom)||7) : period;
  const stepLabels  = ['가족 구성원','식단 기간','요리 종류'];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      {restoreData && (
        <RestorePrompt
          savedAt={restoreData.savedAt}
          onRestore={() => { setRestoreData(null); onComplete(restoreData.config, restoreData.mealPlan); }}
          onDismiss={() => setRestoreData(null)}
        />
      )}

      {/* 헤더 */}
      <div className="text-center mb-8 relative">
        <button onClick={onHelp}
          className="absolute top-0 right-0 h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-400 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm flex items-center justify-center"
          title="사용 가이드">
          <HelpCircle size={16} />
        </button>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200 select-none">
          <UtensilsCrossed size={28} className="text-white" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">우리 가족 식단 플래너</h1>
        <p className="text-stone-400 mt-1.5 text-sm">맞춤형 식단으로 건강한 한 주를 시작해요</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="mb-7">
        <div className="flex items-center justify-center">
          {stepLabels.map((_, i) => {
            const s = i + 1;
            const done = s < step;
            const active = s === step;
            return (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                  done   ? 'bg-green-500 text-white shadow-sm' :
                  active ? 'bg-orange-600 text-white shadow-md shadow-orange-200' :
                           'bg-stone-200 text-stone-400'
                }`}>
                  {done ? <Check size={13} strokeWidth={3} /> : s}
                </div>
                {i < 2 && (
                  <div className={`w-14 sm:w-20 h-0.5 flex-shrink-0 transition-all ${done ? 'bg-green-400' : 'bg-stone-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5" style={{paddingLeft:'0.25rem', paddingRight:'0.25rem'}}>
          {stepLabels.map((lbl, i) => (
            <span key={i} className={`text-[10px] font-semibold flex-1 text-center ${i+1===step ? 'text-orange-600' : 'text-stone-400'}`}>{lbl}</span>
          ))}
        </div>
      </div>

      {/* 폼 카드 */}
      <div className="bg-white rounded-3xl border border-stone-100 card-shadow p-6">
        {step === 1 && <StepFamily members={members} setMembers={setMembers} />}
        {step === 2 && <StepPeriod period={period} setPeriod={setPeriod} custom={custom} setCustom={setCustom} />}
        {step === 3 && (
          <StepCuisine
            cuisines={cuisines} setCuisines={setCuisines}
            noSpicy={noSpicy} setNoSpicy={setNoSpicy}
            allergens={allergens} setAllergens={setAllergens}
            seasonBoost={seasonBoost} setSeasonBoost={setSeasonBoost}
            preferQuick={preferQuick} setPreferQuick={setPreferQuick}
          />
        )}

        <div className="flex justify-between mt-7 pt-5 border-t border-stone-100">
          <button onClick={() => setStep(s => s-1)} disabled={step===1}
            className="h-10 px-5 rounded-xl border border-stone-200 text-stone-600 font-medium text-sm disabled:opacity-30 hover:bg-stone-50 transition-all flex items-center gap-1.5">
            <ChevronLeft size={15} /> 이전
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s+1)}
              className="h-10 px-6 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-200 flex items-center gap-1.5">
              다음 <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={() => onComplete({ members, period: finalPeriod, cuisines, noSpicy, allergens, seasonBoost, preferQuick })}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-rose-500 text-white font-bold text-sm hover:from-orange-700 hover:to-rose-600 transition-all shadow-md shadow-orange-200 flex items-center gap-1.5">
              식단 생성 <Sparkles size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
