import React from 'react';
import { formatTime } from '../utils/helpers.js';

export default function RestorePrompt({ savedAt, onRestore, onDismiss }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm fade-in text-center">
        <div className="text-4xl mb-3">💾</div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">이전 식단이 있어요</h3>
        <p className="text-sm text-gray-500 mb-5">
          {formatTime(savedAt)}에 저장된 식단을<br />이어서 보시겠어요?
        </p>
        <div className="flex gap-3">
          <button onClick={onDismiss}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            새로 만들기
          </button>
          <button onClick={onRestore}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md">
            이어서 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
