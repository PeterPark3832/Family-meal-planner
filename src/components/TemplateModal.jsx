import React, { useState, useEffect } from 'react';
import { CUISINE_INFO } from '../data/config.js';
import { formatTime } from '../utils/helpers.js';

export default function TemplateModal({ templates, currentConfig, currentPlan, onSave, onLoad, onDelete, onClose }) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim() });
    setName('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">📋 식단 템플릿</h3>
              <p className="text-xs text-gray-500 mt-0.5">지금 식단을 저장하고 나중에 다시 불러올 수 있어요</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight:'65vh'}}>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">현재 식단 저장</label>
            <div className="flex gap-2">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter' && name.trim()) handleSave(); }}
                placeholder="템플릿 이름 (예: 7월 2주차 식단)"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              <button onClick={handleSave} disabled={!name.trim()}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${saved ? 'bg-green-500 text-white' : 'bg-violet-500 text-white hover:bg-violet-600'}`}>
                {saved ? '✓' : '저장'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {currentConfig?.period}일 플랜 · {currentConfig?.cuisines?.map(c => CUISINE_INFO[c]?.label).join('/')}
              {currentConfig?.allergens?.length > 0 && ` · 알레르기 ${currentConfig.allergens.length}개 제외`}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">저장된 템플릿 ({templates.length}개)</p>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">저장된 템플릿이 없어요</p>
                <p className="text-xs mt-1">위에서 현재 식단을 저장해보세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...templates].reverse().map(t => (
                  <div key={t.id} className="flex items-center gap-2 p-3 bg-violet-50 rounded-xl border border-violet-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{t.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {t.config?.period}일 · {t.config?.cuisines?.map(c => CUISINE_INFO[c]?.label).join('/')} · {formatTime(t.savedAt)}
                      </p>
                    </div>
                    <button onClick={() => { onLoad(t); onClose(); }}
                      className="px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-bold hover:bg-violet-600 transition-all flex-shrink-0">
                      불러오기
                    </button>
                    <button onClick={() => onDelete(t.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">🗑️</button>
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
