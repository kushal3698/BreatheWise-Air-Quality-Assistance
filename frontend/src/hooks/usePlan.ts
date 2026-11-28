import { useState, useEffect, useRef } from 'react';
import { DailyPlan, HouseholdProfile, fetchDailyPlan } from '@/lib/api';
import { SupportedLanguage } from '@/lib/i18n';
import { DEFAULT_PLAN_DATA, getCityPresetPlan } from '@/lib/initialData';
import { logger } from '@/lib/logger';

export function usePlan(city: string, language: SupportedLanguage, household: HouseholdProfile) {
  const [planData, setPlanData] = useState<DailyPlan>(DEFAULT_PLAN_DATA);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    let active = true;
    const reqId = ++requestSeqRef.current;

    fetchDailyPlan(city, language, household)
      .then((plan) => {
        if (active && reqId === requestSeqRef.current) {
          setPlanData(plan);
        }
      })
      .catch(() => {
        if (active && reqId === requestSeqRef.current) {
          setPlanData(getCityPresetPlan(city, household));
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadPlan = async (targetCity: string, lang: SupportedLanguage, hh: HouseholdProfile) => {
    const reqId = ++requestSeqRef.current;
    setLoadingPlan(true);
    try {
      const plan = await fetchDailyPlan(targetCity, lang, hh);
      if (reqId === requestSeqRef.current) {
        setPlanData(plan);
      }
    } catch (e) {
      logger.warn('Using structured fallback plan:', e);
      if (reqId === requestSeqRef.current) {
        setPlanData(getCityPresetPlan(targetCity, hh));
      }
    } finally {
      if (reqId === requestSeqRef.current) {
        setLoadingPlan(false);
      }
    }
  };

  return { planData, setPlanData, loadingPlan, reloadPlan };
}
