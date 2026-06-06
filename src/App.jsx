import { useState, useCallback, useEffect } from 'react';
import { SAVE_KEY, CUSTOM_KEY, RATING_KEY, TEMPLATE_KEY } from './data/config.js';
import { generatePlan, pickOneMeal } from './utils/algorithm.js';
import { getMinAge, hasKids, trackEvent } from './utils/helpers.js';
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

      const openHelp  = useCallback(() => setShowHelp(true), []);
      const closeHelp = useCallback(() => {
        try { localStorage.setItem('fmp_help_seen', '1'); } catch(e) {}
        setShowHelp(false);
      }, []);

      // 시작 시 localStorage 확인
      useEffect(() => {
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
          </>
        );
      }
      return (
        <>
          <SetupScreen onComplete={handleComplete} restore={restore} onHelp={openHelp} />
          {showHelp && <HelpModal onClose={closeHelp} />}
        </>
      );
    }
