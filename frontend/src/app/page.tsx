'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Calendar, 
  Bot, 
  TrendingDown, 
  Users, 
  School,
  Sparkles,
  MapPin,
  Search,
  X,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';

import { SupportedLanguage, I18N_DATA } from '@/lib/i18n';
import { ALL_SEARCHABLE_CITIES } from '@/lib/cities';
import { getCityPresetPlan } from '@/lib/presetPlan';
import { RiskMeter } from '@/components/RiskMeter';
import { SafeWindows } from '@/components/SafeWindows';
import { PlanCard } from '@/components/PlanCard';
import { ImpactBar } from '@/components/ImpactBar';
import { ChatAssistant } from '@/components/ChatAssistant';
import { HouseholdSelector } from '@/components/HouseholdSelector';
import { SchoolView } from '@/components/SchoolView';
import { CommunityView } from '@/components/CommunityView';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { useAirQuality } from '@/hooks/useAirQuality';
import { useHousehold } from '@/hooks/useHousehold';
import { usePlan } from '@/hooks/usePlan';

const ForecastChart = dynamic(
  () => import('@/components/ForecastChart').then(mod => mod.ForecastChart),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-72 flex items-center justify-center text-slate-400 text-xs">
        Loading hourly CPCB AQI forecast...
      </div>
    )
  }
);

const POPULAR_CITIES = ['Delhi', 'Guntur', 'Bengaluru', 'Mumbai', 'Kolkata', 'Hyderabad'];

// Crisp audio & haptic feedback on city tap with strict typing
function triggerClickFeel() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Silently continue if audio permissions are not yet granted
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 10, 20]);
    }
  } catch {}
}

export default function HomePage() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'chat' | 'impact' | 'community' | 'school'>('dashboard');

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
    selectCity
  } = useAirQuality('Delhi');

  const { planData, setPlanData, loadingPlan, reloadPlan } = usePlan(city, language, household);

  const t = I18N_DATA[language];

  // Autocomplete filtering
  const filteredCities = cityInput.trim()
    ? ALL_SEARCHABLE_CITIES.filter(item => 
        item.name.toLowerCase().includes(cityInput.toLowerCase().trim()) ||
        item.state.toLowerCase().includes(cityInput.toLowerCase().trim())
      ).slice(0, 7)
    : [];

  const handleCitySelect = (c: string) => {
    triggerClickFeel();
    selectCity(c);
    setPlanData(getCityPresetPlan(c, household));
    reloadPlan(c, language, household);
  };

  const selectSearchedCity = (cityName: string) => {
    handleCitySelect(cityName);
    setCityInput('');
    setSearchDropdownOpen(false);
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      selectSearchedCity(cityInput.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Skip to Main Content Link for Keyboard and Screen Readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        Skip to main content
      </a>

      {/* Top Navbar Component */}
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

      {/* Navigation Tabs Bar */}
      <nav role="tablist" aria-label="Main application tabs" className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs font-bold text-slate-600">
          <button
            role="tab"
            id="tab-dashboard"
            aria-controls="panel-dashboard"
            aria-selected={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t.nav.dashboard}</span>
          </button>

          <button
            role="tab"
            id="tab-planner"
            aria-controls="panel-planner"
            aria-selected={activeTab === 'planner'}
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.nav.planner}</span>
          </button>

          <button
            role="tab"
            id="tab-chat"
            aria-controls="panel-chat"
            aria-selected={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.nav.assistant}</span>
          </button>

          <button
            role="tab"
            id="tab-impact"
            aria-controls="panel-impact"
            aria-selected={activeTab === 'impact'}
            onClick={() => setActiveTab('impact')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'impact'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{t.nav.impact}</span>
          </button>

          <button
            role="tab"
            id="tab-community"
            aria-controls="panel-community"
            aria-selected={activeTab === 'community'}
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.nav.community}</span>
          </button>

          <button
            role="tab"
            id="tab-school"
            aria-controls="panel-school"
            aria-selected={activeTab === 'school'}
            onClick={() => setActiveTab('school')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'school'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>{t.nav.school}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} role="main" lang={language} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none">
        {/* Mobile City Selector with rich feedback & instant search */}
        <div className="flex lg:hidden flex-col gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Selected City: <span className="text-emerald-700 font-extrabold">{aqiData.location.name || city}</span>
              </span>
            </div>
            <span 
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${aqiData.current.cpcb_color}18`,
                color: aqiData.current.cpcb_color,
                borderColor: `${aqiData.current.cpcb_color}40`
              }}
            >
              AQI {aqiData.current.aqi} • {aqiData.current.category}
            </span>
          </div>

          {/* Mobile Instant Search Input */}
          <div className="relative">
            <form onSubmit={handleCitySubmit} className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onFocus={() => setSearchDropdownOpen(true)}
                onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 250)}
                placeholder="Search any Indian city (e.g. Pune, Chennai, Jaipur)..."
                className="text-xs pl-8 pr-7 py-2 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
              />
              <button
                type="submit"
                title="Search city"
                className="w-4 h-4 text-slate-400 hover:text-emerald-600 absolute left-2.5 top-2.5 cursor-pointer flex items-center justify-center p-0 border-none bg-transparent"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              {cityInput && (
                <button
                  type="button"
                  onClick={() => { setCityInput(''); setSearchDropdownOpen(false); }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Mobile Autocomplete Dropdown */}
            {searchDropdownOpen && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-1 divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Instant City Matches
                </div>
                {filteredCities.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onMouseDown={() => selectSearchedCity(item.name)}
                    onClick={() => selectSearchedCity(item.name)}
                    onTouchStart={() => selectSearchedCity(item.name)}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({item.state})</span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      AQI {item.aqi}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {POPULAR_CITIES.map((c) => {
              const isSelected = city.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => handleCitySelect(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md scale-105 ring-2 ring-emerald-400 ring-offset-1'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  <span>{c}</span>
                  {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: AIR DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard" key={city} className="space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <RiskMeter 
              data={aqiData} 
              isLive={isLiveConnected && aqiData.source === 'live_cpcb_station'} 
            />

            {/* Safe Windows Highlight */}
            <SafeWindows safeWindows={aqiData.safe_windows} />

            {/* 24-Hour Forecast Chart */}
            <ForecastChart 
              forecast={aqiData.forecast} 
              cityName={aqiData.location.name} 
              currentColor={aqiData.current.cpcb_color} 
              currentAqi={aqiData.current.aqi} 
            />

            {/* Household Quick Status Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Current Household Profile
                </span>
                <h4 className="text-base font-bold mt-1">
                  {household.members.length} Family Members ({household.members.filter(m => m.sensitivities.length > 0).length} with sensitivities)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mode: {household.transport.mode.replace('_', ' ')} • Purifier: {household.home.has_purifier ? 'Active' : 'None yet'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                View Tailored Action Plan →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY PLANNER */}
        {activeTab === 'planner' && (
          <div role="tabpanel" id="panel-planner" aria-labelledby="tab-planner" key={city} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {/* Household Config Drawer (Left 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <HouseholdSelector
                profile={household}
                onChange={(updated) => {
                  setHousehold(updated);
                  reloadPlan(city, language, updated);
                }}
              />
              <button
                onClick={() => reloadPlan(city, language, household)}
                disabled={loadingPlan}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loadingPlan ? 'Updating Plan...' : t.common.generatePlan}</span>
              </button>
            </div>

            {/* Plan Display (Right 8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <PlanCard plan={planData} household={household} />
              <ImpactBar
                exposureReductionPct={planData.impact_summary.exposure_reduction_pct}
                co2AvoidedKgWeek={planData.impact_summary.co2_avoided_kg_week}
                costSavedInrMonth={planData.impact_summary.cost_saved_inr_month}
                cigarettesAvoidedDay={planData.impact_summary.cigarettes_avoided_day}
                confidence={planData.impact_summary.confidence}
              />
            </div>
          </div>
        )}

        {/* TAB 3: GENAI ASSISTANT */}
        {activeTab === 'chat' && (
          <div role="tabpanel" id="panel-chat" aria-labelledby="tab-chat" key={city} className="max-w-4xl mx-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <ChatAssistant city={city} language={language} household={household} />
          </div>
        )}

        {/* TAB 4: PERSONAL IMPACT */}
        {activeTab === 'impact' && (
          <div role="tabpanel" id="panel-impact" aria-labelledby="tab-impact" className="space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <ImpactBar
              exposureReductionPct={planData ? planData.impact_summary.exposure_reduction_pct : 42}
              co2AvoidedKgWeek={planData ? planData.impact_summary.co2_avoided_kg_week : 8.5}
              costSavedInrMonth={planData ? planData.impact_summary.cost_saved_inr_month : 1850}
              cigarettesAvoidedDay={planData ? planData.impact_summary.cigarettes_avoided_day : 3.4}
              confidence={planData ? planData.impact_summary.confidence : "Modelled estimate"}
            />
          </div>
        )}

        {/* TAB 5: COMMUNITY CHALLENGES & LEADERBOARDS */}
        {activeTab === 'community' && (
          <div role="tabpanel" id="panel-community" aria-labelledby="tab-community" key={city} className="space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <CommunityView city={city} />
          </div>
        )}

        {/* TAB 6: SCHOOL GUIDANCE */}
        {activeTab === 'school' && (
          <div role="tabpanel" id="panel-school" aria-labelledby="tab-school" key={city} className="max-w-4xl mx-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <SchoolView city={city} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer disclaimer={t.common.disclaimer} />
    </div>
  );
}
