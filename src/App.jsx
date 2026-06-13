import { useState, useCallback, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { SAVE_KEY, CUSTOM_KEY, RATING_KEY, TEMPLATE_KEY } from './data/config.js';
import { generatePlan, pickOneMeal } from './utils/algorithm.js';
import { getMinAge, hasKids, trackEvent } from './utils/helpers.js';
import { getShareToken, decodePlan, clearShareParam } from './utils/shareUtils.js';
import PlanScreen from './components/PlanScreen.jsx';
import SetupScreen from './components/SetupScreen.jsx';
import HelpModal from './components/HelpModal.jsx';

export default function App() {
      const [screen, setScreen]         = useState('setup');
      const [config, setConfig]         = useState(null);
      const [mealPlan, setMealPlan]     = useState({});
      const [savedAt, setSavedAt]       = useState(null);
      const [restore, setRestore]       = useState(null);
      const [customMeals, setCustomMeals] = useState([]);
      const [ratings, setRatings]         = useState({});
      const [templates, setTemplates]     = useState([]);
      const [showHelp, setShowHelp]       = useState(false);
      const [installPrompt, setInstallPrompt] = useState(null);
      const [showInstallBanner, setShowInstallBanner] = useState(false);

      const openHelp  = useCallback(() => setShowHelp(true), []);
      const closeHelp = useCallback(() => {
        try { localStorage.setItem('fmp_help_seen', '1'); } catch(e) {}
        setShowHelp(false);
      }, []);

      // PWA 설치 프롬프트 캡처
      useEffect(() => {
        const handler = (e) => {
          e.preventDefault();
          setInstallPrompt(e);
          // 이미 설치된 경우 배너 표시 안 함
          try {
            if (!localStorage.getItem('fmp_install_dismissed')) setShowInstallBanner(true);
          } catch(err) { setShowInstallBanner(true); }
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }, []);

      const handleInstall = useCallback(async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        trackEvent('pwa_install_prompt', { outcome });
        setInstallPrompt(null);
        setShowInstallBanner(false);
      }, [installPrompt]);

      const dismissInstall = useCallback(() => {
        setShowInstallBanner(false);
        try { localStorage.setItem('fmp_install_dismissed', '1'); } catch(e) {}
      }, []);

      // 시작 시 URL 공유 토큰 우선 확인, 없으면 localStorage
      useEffect(() => {
        const token = getShareToken();
        if (token) {
          const shared = decodePlan(token);
          if (shared) {
            clearShareParam();
            setConfig(shared.config);
            setMealPlan(shared.mealPlan);
            setScreen('plan');
            trackEvent('shared_plan_loaded');
            return;
          }
        }
        try {
          const raw = localStorage.getItem(SAVE_KEY);
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.config && data?.mealPlan) setRestore(data);
          }
        } catch(e) {}
        try {
          const cm = localStorage.getItem(CUSTOM_KEY);
          if (cm) setCustomMeals(JSON.parse(cm) || []);
        } catch(e) {}
        try {
          const rt = localStorage.getItem(RATING_KEY);
          if (rt) setRatings(JSON.parse(rt) || {});
        } catch(e) {}
        try {
          const tp = localStorage.getItem(TEMPLATE_KEY);
          if (tp) setTemplates(JSON.parse(tp) || []);
        } catch(e) {}
        // 첫 방문 시 가이드 자동 표시
        try {
          if (!localStorage.getItem('fmp_help_seen')) setShowHelp(true);
        } catch(e) {}
      }, []);

      // 식단 변경 시 자동 저장
      useEffect(() => {
        if (screen === 'plan' && config && Object.keys(mealPlan).length > 0) {
          const ts = Date.now();
          try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ config, mealPlan, savedAt: ts }));
            setSavedAt(ts);
          } catch(e) {}
        }
      }, [mealPlan, screen, config]);

      const handleComplete = useCallback((cfgOrConfig, existingPlan) => {
        setConfig(cfgOrConfig);
        if (existingPlan) {
          setMealPlan(existingPlan);
        } else {
          const minAge    = getMinAge(cfgOrConfig.members);
          const children  = hasKids(cfgOrConfig.members);
          setMealPlan(generatePlan(
            cfgOrConfig.period, cfgOrConfig.cuisines, minAge, cfgOrConfig.noSpicy,
            children, customMeals, ratings, cfgOrConfig.allergens || [],
            cfgOrConfig.seasonBoost || false, cfgOrConfig.preferQuick || false
          ));
          trackEvent('plan_generated', {
            period: cfgOrConfig.period,
            cuisines: cfgOrConfig.cuisines.join(','),
            family_size: cfgOrConfig.members.length,
            has_children: children,
            prefer_quick: cfgOrConfig.preferQuick || false,
          });
        }
        setScreen('plan');
      }, [customMeals, ratings]);

      const handleRegen = useCallback(() => {
        if (!config) return;
        const minAge   = getMinAge(config.members);
        const children = hasKids(config.members);
        setMealPlan(generatePlan(
          config.period, config.cuisines, minAge, config.noSpicy,
          children, customMeals, ratings, config.allergens || [],
          config.seasonBoost || false, config.preferQuick || false
        ));
        trackEvent('plan_regenerated', { period: config.period });
      }, [config, customMeals, ratings]);

      const saveTemplate = useCallback((name, cfg, plan) => {
        setTemplates(prev => {
          const next = [...prev, { id: Date.now().toString(), name, config: cfg, mealPlan: plan, savedAt: Date.now() }];
          try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next)); } catch(e) {}
          return next;
        });
      }, []);

      const loadTemplate = useCallback((t) => {
        setConfig(t.config);
        setMealPlan(t.mealPlan);
        setScreen('plan');
      }, []);

      const deleteTemplate = useCallback((id) => {
        setTemplates(prev => {
          const next = prev.filter(t => t.id !== id);
          try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next)); } catch(e) {}
          return next;
        });
      }, []);

      const handleRate = useCallback((mealName, type) => {
        setRatings(prev => {
          const r = prev[mealName] || { likes: 0, dislikes: 0 };
          const next = {
            ...prev,
            [mealName]: {
              likes:    type === 'like'    ? r.likes + 1    : r.likes,
              dislikes: type === 'dislike' ? r.dislikes + 1 : r.dislikes,
            },
          };
          try { localStorage.setItem(RATING_KEY, JSON.stringify(next)); } catch(e) {}
          return next;
        });
        trackEvent('meal_rated', { meal: mealName, rating: type });
      }, []);

      const handleImport = useCallback((cfg, plan) => {
        setConfig(cfg);
        setMealPlan(plan);
      }, []);

      const addCustomMeal = useCallback((meal) => {
        setCustomMeals(prev => {
          const next = [...prev, meal];
          try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)); } catch(e) {}
          return next;
        });
      }, []);

      const deleteCustomMeal = useCallback((id) => {
        setCustomMeals(prev => {
          const next = prev.filter(m => m.id !== id);
          try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)); } catch(e) {}
          return next;
        });
      }, []);

      const InstallBanner = showInstallBanner && (
        <div className="install-banner fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 shadow-xl z-50 fade-in">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3 px-4 pt-3 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0"><Smartphone size={20} className="text-orange-500" strokeWidth={1.75} /></span>
              <div className="min-w-0">
                <div className="font-bold text-gray-800 text-sm">홈 화면에 추가하기</div>
                <div className="text-xs text-gray-500 truncate">앱처럼 빠르게 실행할 수 있어요</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={dismissInstall}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                나중에
              </button>
              <button onClick={handleInstall}
                className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-sm">
                설치
              </button>
            </div>
          </div>
        </div>
      );

      if (screen === 'plan') {
        return (
          <>
            <PlanScreen
              config={config}
              mealPlan={mealPlan}
              setMealPlan={setMealPlan}
              savedAt={savedAt}
              onBack={() => setScreen('setup')}
              onRegen={handleRegen}
              onImport={handleImport}
              customMeals={customMeals}
              onAddCustomMeal={addCustomMeal}
              onDeleteCustomMeal={deleteCustomMeal}
              ratings={ratings}
              onRate={handleRate}
              templates={templates}
              onSaveTemplate={saveTemplate}
              onLoadTemplate={loadTemplate}
              onDeleteTemplate={deleteTemplate}
              onHelp={openHelp}
            />
            {showHelp && <HelpModal onClose={closeHelp} />}
            {InstallBanner}
          </>
        );
      }
      return (
        <>
          <SetupScreen onComplete={handleComplete} restore={restore} onHelp={openHelp} />
          {showHelp && <HelpModal onClose={closeHelp} />}
          {InstallBanner}
        </>
      );
    }
