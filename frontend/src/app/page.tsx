'use client';

import React, { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

import { SupportedLanguage, I18N_DATA } from '@/lib/i18n';
import { ALL_SEARCHABLE_CITIES } from '@/lib/cities';
import { getCityPresetPlan } from '@/lib/presetPlan';
import { recalculateInteractiveImpact } from '@/lib/impactSimulator';
import { triggerClickFeel } from '@/lib/feedback';

import { RiskMeter } from '@/components/RiskMeter';
import { SafeWindows } from '@/components/SafeWindows';
import { PlanCard } from '@/components/PlanCard';
import { ImpactBar } from '@/components/ImpactBar';
import { ChatAssistant } from '@/components/ChatAssistant';
import { HouseholdSelector } from '@/components/HouseholdSelector';
import { HouseholdModal } from '@/components/household/HouseholdModal';
import { SchoolView } from '@/components/SchoolView';
import { CommunityView } from '@/components/CommunityView';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileCityBar } from '@/components/navbar/MobileCityBar';
import { DashboardTabs, DashboardTabId } from '@/components/dashboard/DashboardTabs';

import { useAirQuality } from '@/hooks/useAirQuality';
import { useHousehold } from '@/hooks/useHousehold';
import { usePlan } from '@/hooks/usePlan';

const ForecastChart = dynamic(
  () => import('@/components/ForecastChart').then((mod) => mod.ForecastChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-72 flex items-center justify-center text-slate-600 text-xs">
        Loading hourly CPCB AQI forecast...
      </div>
    ),
  }
);

const POPULAR_CITIES = ['Delhi', 'Guntur', 'Bengaluru', 'Mumbai', 'Kolkata', 'Hyderabad'];

export default function HomePage() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<DashboardTabId>('dashboard');
  const [householdModalOpen, setHouseholdModalOpen] = useState(false);
  const [disabledActions, setDisabledActions] = useState<Set<string>>(() => new Set());
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { household, setHousehold } = useHousehold();
  const {
    city,
    cityInput,
    setCityInput,
    searchDropdownOpen,
    setSearchDropdownOpen,
    aqiData,
    isLiveConnected,
    cityToast,
    selectCity,
  } = useAirQuality('Delhi');

  const { planData, setPlanData, loadingPlan, reloadPlan } = usePlan(city, language, household);
  const t = I18N_DATA[language];

  const allPlanActions = useMemo(
    () => [
      ...planData.sections.low_emission_routines,
      ...planData.sections.indoor_air_hacks,
      ...planData.sections.sustainable_alternatives,
    ],
    [planData]
  );

  const enabledActions = useMemo(() => {
    const enabled = new Set<string>();
    allPlanActions.forEach((item, idx) => {
      const key = `${idx}:${item.action}`;
      if (!disabledActions.has(key)) enabled.add(key);
    });
    return enabled;
  }, [allPlanActions, disabledActions]);

  const outdoorPm25 = aqiData.current.pm2_5;
  const liveImpact = useMemo(
    () =>
      recalculateInteractiveImpact(
        allPlanActions,
        enabledActions,
        outdoorPm25,
        planData.impact_summary
      ),
    [allPlanActions, enabledActions, outdoorPm25, planData.impact_summary]
  );

  const toggleActionItem = (actionKey: string) => {
    setDisabledActions((prev) => {
      const next = new Set(prev);
      if (next.has(actionKey)) next.delete(actionKey);
      else next.add(actionKey);
      return next;
    });
  };

  const filteredCities = cityInput.trim()
    ? ALL_SEARCHABLE_CITIES.filter(
        (item) =>
          item.name.toLowerCase().includes(cityInput.toLowerCase().trim()) ||
          item.state.toLowerCase().includes(cityInput.toLowerCase().trim())
      ).slice(0, 7)
    : [];

  const handleCitySelect = (targetCity: string) => {
    triggerClickFeel();
    selectCity(targetCity);
    setDisabledActions(new Set());
    setPlanData(getCityPresetPlan(targetCity, household));
    reloadPlan(targetCity, language, household);
  };

  const selectSearchedCity = (cityName: string) => {
    handleCitySelect(cityName);
    setCityInput('');
    setSearchDropdownOpen(false);
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) selectSearchedCity(cityInput.trim());
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        Skip to main content
      </a>

      <Navbar
        city={city}
        cityInput={cityInput}
        setCityInput={setCityInput}
        searchDropdownOpen={searchDropdownOpen}
        setSearchDropdownOpen={setSearchDropdownOpen}
        filteredCities={filteredCities}
        popularCities={POPULAR_CITIES}
        handleCitySelect={handleCitySelect}
        handleCitySubmit={handleCitySubmit}
        selectSearchedCity={selectSearchedCity}
        language={language}
        setLanguage={(newLang) => {
          setLanguage(newLang);
          reloadPlan(city, newLang, household);
        }}
        isLiveConnected={isLiveConnected}
        isLiveStation={aqiData.source === 'live_cpcb_station'}
        cityToast={cityToast}
      />

      <DashboardTabs activeTab={activeTab} onChange={setActiveTab} labels={t.nav} />

      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        lang={language}
        className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none"
      >
        <MobileCityBar
          city={city}
          selectedCityLabel={aqiData.location.name || city}
          aqi={aqiData.current.aqi}
          category={aqiData.current.category}
          cpcbColor={aqiData.current.cpcb_color}
          cityInput={cityInput}
          setCityInput={setCityInput}
          searchDropdownOpen={searchDropdownOpen}
          setSearchDropdownOpen={setSearchDropdownOpen}
          filteredCities={filteredCities}
          popularCities={POPULAR_CITIES}
          handleCitySelect={handleCitySelect}
          handleCitySubmit={handleCitySubmit}
          selectSearchedCity={selectSearchedCity}
        />

        {activeTab === 'dashboard' && (
          <div role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard" key={city} className="space-y-6">
            <RiskMeter data={aqiData} isLive={isLiveConnected && aqiData.source === 'live_cpcb_station'} />
            <SafeWindows safeWindows={aqiData.safe_windows} />
            <ForecastChart
              forecast={aqiData.forecast}
              cityName={aqiData.location.name}
              currentColor={aqiData.current.cpcb_color}
              currentAqi={aqiData.current.aqi}
            />

            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Current Household Profile
                </span>
                <h4 className="text-base font-bold mt-1">
                  {household.members.length} Family Members (
                  {household.members.filter((m) => m.sensitivities.length > 0).length} with sensitivities)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Mode: {household.transport.mode.replace('_', ' ')} • Purifier:{' '}
                  {household.home.has_purifier ? 'Active' : 'None yet'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  ref={modalTriggerRef}
                  type="button"
                  onClick={() => setHouseholdModalOpen(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Edit Household Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('planner')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  View Tailored Action Plan →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div
            role="tabpanel"
            id="panel-planner"
            aria-labelledby="tab-planner"
            key={city}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-4 space-y-4">
              <HouseholdSelector
                profile={household}
                onChange={(updated) => {
                  setHousehold(updated);
                  reloadPlan(city, language, updated);
                }}
              />
              <button
                type="button"
                onClick={() => reloadPlan(city, language, household)}
                disabled={loadingPlan}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{loadingPlan ? 'Updating Plan...' : t.common.generatePlan}</span>
              </button>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <PlanCard
                plan={planData}
                household={household}
                enabledActions={enabledActions}
                onToggleAction={toggleActionItem}
              />
              <ImpactBar
                exposureReductionPct={liveImpact.exposure_reduction_pct}
                co2AvoidedKgWeek={liveImpact.co2_avoided_kg_week}
                costSavedInrMonth={liveImpact.cost_saved_inr_month}
                cigarettesAvoidedDay={liveImpact.cigarettes_avoided_day}
                confidence={liveImpact.confidence}
              />
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div role="tabpanel" id="panel-chat" aria-labelledby="tab-chat" key={city} className="max-w-4xl mx-auto">
            <ChatAssistant city={city} language={language} household={household} />
          </div>
        )}

        {activeTab === 'impact' && (
          <div role="tabpanel" id="panel-impact" aria-labelledby="tab-impact" className="space-y-6">
            <ImpactBar
              exposureReductionPct={liveImpact.exposure_reduction_pct}
              co2AvoidedKgWeek={liveImpact.co2_avoided_kg_week}
              costSavedInrMonth={liveImpact.cost_saved_inr_month}
              cigarettesAvoidedDay={liveImpact.cigarettes_avoided_day}
              confidence={liveImpact.confidence}
            />
          </div>
        )}

        {activeTab === 'community' && (
          <div role="tabpanel" id="panel-community" aria-labelledby="tab-community" key={city} className="space-y-6">
            <CommunityView city={city} />
          </div>
        )}

        {activeTab === 'school' && (
          <div role="tabpanel" id="panel-school" aria-labelledby="tab-school" key={city} className="max-w-4xl mx-auto">
            <SchoolView city={city} />
          </div>
        )}
      </main>

      <HouseholdModal
        isOpen={householdModalOpen}
        profile={household}
        triggerRef={modalTriggerRef}
        onChange={(updated) => {
          setHousehold(updated);
          reloadPlan(city, language, updated);
        }}
        onClose={() => setHouseholdModalOpen(false)}
      />

      <Footer disclaimer={t.common.disclaimer} />
    </div>
  );
}
