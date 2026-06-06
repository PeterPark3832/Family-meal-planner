import React from 'react';
import { SAVE_KEY } from '../data/config.js';
import { trackEvent } from '../utils/helpers.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) {
    try { trackEvent('app_error', { message: error?.message?.slice(0, 100) }); } catch(e) {}
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">😅</div>
          <h2 className="text-xl font-black text-gray-800 mb-2">앗, 오류가 발생했어요</h2>
          <p className="text-sm text-gray-500 mb-6">데이터를 초기화하거나 페이지를 새로고침해 보세요.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { try { localStorage.removeItem(SAVE_KEY); } catch(e) {} this.setState({ hasError: false }); }}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all">
              식단 초기화 후 재시작
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all">
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }
}
