import { useState, useEffect } from 'react';
import { DailyPlan, HouseholdProfile, fetchDailyPlan } from '@/lib/api';
import { SupportedLanguage } from '@/lib/i18n';
import { DEFAULT_PLAN_DATA, getCityPresetPlan } from '@/lib/initialData';
import { logger } from '@/lib/logger';

export function usePlan(city: string, language: SupportedLanguage, household: HouseholdProfile) {
  const [planData, setPlanData] = useState<DailyPlan>(DEFAULT_PLAN_DATA);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    fetchDailyPlan(city, language, household)
      .then(plan => {
        setPlanData(plan);
      })
      .catch(() => {
        setPlanData(getCityPresetPlan(city, household));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadPlan = async (targetCity: string, lang: SupportedLanguage, hh: HouseholdProfile) => {
    setLoadingPlan(true);
    try {
      const plan = await fetchDailyPlan(targetCity, lang, hh);
      setPlanData(plan);
    } catch (e) {
      logger.warn('Using structured fallback plan:', e);
      setPlanData(getCityPresetPlan(targetCity, hh));
    } finally {
      setLoadingPlan(false);
    }
  };

  return {
    planData,
    setPlanData,
    loadingPlan,
    reloadPlan
  };
}
