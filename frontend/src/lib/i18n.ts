import localesData from '../data/locales.json';

export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    planner: string;
    assistant: string;
    impact: string;
    community: string;
    school: string;
  };
  aqiLabels: {
    stationDistance: string;
    updatedJustNow: string;
    safeWindowsTitle: string;
    hourlyTrend: string;
    pollutants: string;
  };
  plannerLabels: {
    householdTitle: string;
    planSummary: string;
    routines: string;
    indoorAir: string;
    sustainable_alternatives: string;
    timeline: string;
    why: string;
    impactTitle: string;
  };
  impactLabels: {
    beforeAfter: string;
    exposureAvoided: string;
    co2Avoided: string;
    costSaved: string;
    cigarettesAvoided: string;
  };
  common: {
    refresh: string;
    generatePlan: string;
    loading: string;
    disclaimer: string;
    safeWindow: string;
  };
}

export const I18N_DATA: Record<SupportedLanguage, Translations> = localesData as Record<SupportedLanguage, Translations>;
