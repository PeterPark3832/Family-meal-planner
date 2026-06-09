import React, { useState, useEffect } from 'react';

const HELP_TABS = ['🚀 시작하기', '⭐ 주요 기능', '💡 팁'];

export default function HelpModal({ onClose }) {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <div>
                <h2 className="font-black text-gray-800 text-lg leading-tight">사용 가이드</h2>
                <p className="text-xs text-gray-400">우리 가족 식단 플래너</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg">✕</button>
          </div>
          <div className="flex gap-1.5 mt-4">
            {HELP_TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === i ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {tab === 0 && (
            <div className="space-y-4">
              {[
                { step:'1', emoji:'👨‍👩‍👧', title:'가족 구성원 설정', desc:'성인·자녀 구분과 나이를 입력하세요. 아이가 있으면 성인·아이 식단이 자동으로 분리됩니다.' },
                { step:'2', emoji:'📅', title:'식단 기간 선택', desc:'7일·14일·21일·30일 중 선택하거나 직접 입력할 수 있어요. 주차별로 탭이 나뉩니다.' },
                { step:'3', emoji:'🥢', title:'요리 종류 & 알레르기', desc:'한식·양식·중식·일식을 자유롭게 조합하세요. 알레르기 재료는 추천에서 자동 제외됩니다.' },
                { step:'4', emoji:'✨', title:'식단 생성!', desc:'설정 완료 후 식단이 자동 생성됩니다. 마음에 안 드는 메뉴는 언제든 바꿀 수 있어요.' },
              ].map(({ step, emoji, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex-shrink-0 flex items-center justify-center mt-0.5">{step}</div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span>{emoji}</span>
                      <span className="font-bold text-sm text-gray-800">{title}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-3">
              {[
                { emoji:'🎲', title:'개별 재생성', desc:'셀에 마우스를 올리면 우상단에 나타납니다. 해당 메뉴 하나만 새로 뽑아줍니다.' },
                { emoji:'📺', title:'레시피 검색', desc:'셀 호버 시 좌상단에 나타납니다. YouTube·만개의레시피·네이버·구글 링크를 한 번에 제공합니다.' },
                { emoji:'👍👎', title:'식단 평가', desc:'셀 호버 시 우하단에 나타납니다. 👍2회 이상이면 초록 테두리, 👎누적 시 추천에서 제외됩니다.' },
                { emoji:'✏️', title:'메뉴 직접 변경', desc:'셀을 클릭하면 추천 목록에서 고르거나 직접 입력할 수 있습니다.' },
                { emoji:'🛒', title:'장보기 목록', desc:'현재 식단의 재료를 자동으로 정리합니다. 재료별·메뉴별 두 가지 보기를 지원합니다.' },
                { emoji:'⭐', title:'내 메뉴 DB', desc:'자주 먹는 메뉴를 저장해두면 추천 풀에 자동으로 포함됩니다.' },
                { emoji:'📋', title:'템플릿 저장', desc:'마음에 드는 식단을 이름 붙여 저장하고, 나중에 바로 불러올 수 있습니다.' },
                { emoji:'💾', title:'JSON 백업/복원', desc:'식단을 파일로 저장해 다른 기기에서 불러오거나 보관할 수 있습니다.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                  <div>
                    <div className="font-bold text-sm text-gray-800 mb-0.5">{title}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-3">
              {[
                { emoji:'🎯', title:'평가할수록 똑똑해져요', desc:'👍👎로 평가를 쌓으면 좋아하는 음식은 더 자주, 싫어하는 음식은 덜 추천됩니다.' },
                { emoji:'🧒', title:'아이 나이를 정확히 입력하세요', desc:'6세 이하는 매운 음식이 자동 제외되고, 나이에 맞지 않는 메뉴도 걸러집니다.' },
                { emoji:'🖨️', title:'인쇄해서 냉장고에 붙이세요', desc:'우상단 🖨️ 인쇄 버튼을 누르면 깔끔한 식단표 형태로 출력됩니다.' },
                { emoji:'📊', title:'영양 분포를 확인하세요', desc:'📊 통계 버튼으로 이번 식단의 단백질·채소·탄수화물 분포를 확인할 수 있습니다.' },
                { emoji:'📱', title:'앱으로 설치하기 (PWA)', desc:'브라우저 주소창 옆 설치 버튼을 누르면 홈 화면에 아이콘이 추가됩니다. 오프라인에서도 사용 가능해요.' },
                { emoji:'💾', title:'데이터는 자동 저장돼요', desc:'식단은 수정할 때마다 기기에 자동 저장됩니다. 브라우저를 닫아도 다음에 그대로 이어집니다.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex gap-3 p-3 rounded-xl border border-gray-100">
                  <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                  <div>
                    <div className="font-bold text-sm text-gray-800 mb-0.5">{title}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
          <div className="flex gap-1">
            {HELP_TABS.map((_, i) => (
              <button key={i} onClick={() => setTab(i)}
                className={`w-2 h-2 rounded-full transition-all ${tab === i ? 'bg-orange-500 w-4' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {tab < 2
              ? <button onClick={() => setTab(t => t + 1)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all">
                  다음 →
                </button>
              : <button onClick={onClose}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all">
                  시작하기 🚀
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
