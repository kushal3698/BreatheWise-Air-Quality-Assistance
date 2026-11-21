'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  MapPin, 
  Calendar, 
  Bot, 
  Users, 
  School, 
  TrendingDown, 
  Globe, 
  RotateCw, 
  Check, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { 
  fetchAQI, 
  fetchDailyPlan, 
  AirQualityData, 
  DailyPlan, 
  HouseholdProfile 
} from '@/lib/api';
import { 
  DEFAULT_AQI_DATA, 
  DEFAULT_PLAN_DATA,
  getCityPresetAQI,
  getCityPresetPlan,
  ALL_SEARCHABLE_CITIES
} from '@/lib/initialData';
import { I18N_DATA, SupportedLanguage } from '@/lib/i18n';
import { RiskMeter } from '@/components/RiskMeter';
import { SafeWindows } from '@/components/SafeWindows';
import { PlanCard } from '@/components/PlanCard';
import { ImpactBar } from '@/components/ImpactBar';
import { ChatAssistant } from '@/components/ChatAssistant';
import { HouseholdSelector } from '@/components/HouseholdSelector';
import { SchoolView } from '@/components/SchoolView';
import { CommunityView } from '@/components/CommunityView';
import dynamic from 'next/dynamic';

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

interface CityToastInfo {
  name: string;
  aqi: number;
  cat: string;
  color: string;
  safeWindow: string;
}

// Crisp audio & haptic feedback on city tap
function triggerClickFeel() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
  } catch (e) {
    // Silently continue if audio permissions are not yet granted
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 10, 20]);
    }
  } catch (e) {}
}

export default function HomePage() {
  const [city, setCity] = useState('Delhi');
  const [cityInput, setCityInput] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'chat' | 'impact' | 'school'>('dashboard');

  const [aqiData, setAqiData] = useState<AirQualityData>(DEFAULT_AQI_DATA);
  const [planData, setPlanData] = useState<DailyPlan>(DEFAULT_PLAN_DATA);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [cityToast, setCityToast] = useState<CityToastInfo | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default household profile
  const [household, setHousehold] = useState<HouseholdProfile>({
    members: [
      { id: '1', role: 'child', age: 8, sensitivities: [] },
      { id: '2', role: 'adult', age: 38, sensitivities: ['asthma'] },
      { id: '3', role: 'adult', age: 40, sensitivities: [] },
      { id: '4', role: 'elderly', age: 68, sensitivities: [] }
    ],
    transport: {
      mode: 'petrol_car',
      vehicles: 1,
      school_run_km: 4.0,
      commute_km: 15.0
    },
    home: {
      type: 'apartment',
      floor: 4,
      has_purifier: false,
      cooking_fuel: 'LPG'
    },
    work_from_home_days: 2
  });

  const t = I18N_DATA[language];

  // Autocomplete filtering
  const filteredCities = cityInput.trim()
    ? ALL_SEARCHABLE_CITIES.filter(item => 
        item.name.toLowerCase().includes(cityInput.toLowerCase().trim()) ||
        item.state.toLowerCase().includes(cityInput.toLowerCase().trim())
      ).slice(0, 7)
    : [];

  // Initial mount sync for live data
  useEffect(() => {
    fetchAQI(city)
      .then(data => {
        setAqiData(data);
        setIsLiveConnected(true);
      })
      .catch(() => {
        setIsLiveConnected(false);
      });

    fetchDailyPlan(city, language, household)
      .then(plan => {
        setPlanData(plan);
        setIsLiveConnected(true);
      })
      .catch(() => {
        setIsLiveConnected(false);
      });
  }, []);

  // Update plan when language or household changes
  const reloadPlanForProfile = async (targetCity: string, lang: SupportedLanguage, hh: HouseholdProfile) => {
    setLoadingPlan(true);
    try {
      const plan = await fetchDailyPlan(targetCity, lang, hh);
      setPlanData(plan);
      setIsLiveConnected(true);
    } catch (e) {
      console.warn("Using structured fallback plan:", e);
      setPlanData(getCityPresetPlan(targetCity, hh));
    } finally {
      setLoadingPlan(false);
    }
  };

  // ⚡ Instant synchronous UI switch + tactile feedback
  const handleCitySelect = (c: string) => {
    triggerClickFeel();

    setCity(c);
    const presetAQI = getCityPresetAQI(c);
    const presetPlan = getCityPresetPlan(c, household);

    // Instant zero-millisecond update
    setAqiData(presetAQI);
    setPlanData(presetPlan);

    // High-visibility animated toast banner
    const firstSafe = presetAQI.safe_windows && presetAQI.safe_windows[0];
    const safeWindowStr = firstSafe ? `${firstSafe.start} – ${firstSafe.end}` : '13:00 – 16:00';

    setCityToast({
      name: presetAQI.location.name,
      aqi: presetAQI.current.aqi,
      cat: presetAQI.current.category,
      color: presetAQI.current.cpcb_color,
      safeWindow: safeWindowStr
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setCityToast(null);
    }, 3200);

    // Silent background live sync (does not block or freeze UI)
    fetchAQI(c)
      .then(liveAQI => {
        setAqiData(liveAQI);
        setIsLiveConnected(true);
      })
      .catch(() => {
        setIsLiveConnected(false);
      });

    fetchDailyPlan(c, language, household)
      .then(livePlan => {
        setPlanData(livePlan);
        setIsLiveConnected(true);
      })
      .catch(() => {
        setIsLiveConnected(false);
      });
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
      {/* City Switch Instant Feedback Floating Toast */}
      {cityToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-bold flex items-center gap-2">
                <span>Switched to <strong className="text-emerald-300 text-sm font-black">{cityToast.name}</strong></span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${cityToast.color}25`,
                    color: cityToast.color,
                    border: `1px solid ${cityToast.color}50`
                  }}
                >
                  AQI {cityToast.aqi} • {cityToast.cat}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5">
                <span>Safe outdoor window:</span>
                <span className="text-emerald-400 font-bold">{cityToast.safeWindow}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">BreatheWise</span>
                {isLiveConnected && aqiData.source === 'live_cpcb_station' ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Live Station
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Modelled estimate
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Cleaner air begins with smarter daily choices
              </p>
            </div>
          </div>

          {/* Desktop City Quick Switcher & Search with Autocomplete */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
              {POPULAR_CITIES.map((c) => {
                const isSelected = city.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    onClick={() => handleCitySelect(c)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-md scale-105 ring-2 ring-emerald-400 ring-offset-1'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    <span>{c}</span>
                    {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Instant Search Bar with Live Autocomplete */}
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
                  placeholder="Search city..."
                  className="text-xs pl-7 pr-6 py-1.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 transition-all focus:w-52"
                />
                <button
                  type="submit"
                  title="Search city"
                  className="w-4 h-4 text-slate-400 hover:text-emerald-600 absolute left-2 top-2 cursor-pointer flex items-center justify-center p-0 border-none bg-transparent"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                {cityInput && (
                  <button
                    type="button"
                    onClick={() => { setCityInput(''); setSearchDropdownOpen(false); }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Desktop Autocomplete Dropdown */}
              {searchDropdownOpen && filteredCities.length > 0 && (
                <div className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant City Matches
                  </div>
                  {filteredCities.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onMouseDown={() => selectSearchedCity(item.name)}
                      onClick={() => selectSearchedCity(item.name)}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">{item.name}</span>
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
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as SupportedLanguage;
                setLanguage(newLang);
                reloadPlanForProfile(city, newLang, household);
              }}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs font-bold text-slate-600">
          <button
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
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          <div key={city} className="space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
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
          <div key={city} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {/* Household Config Drawer (Left 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <HouseholdSelector
                profile={household}
                onChange={(updated) => {
                  setHousehold(updated);
                  reloadPlanForProfile(city, language, updated);
                }}
              />
              <button
                onClick={() => reloadPlanForProfile(city, language, household)}
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
          <div key={city} className="max-w-4xl mx-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <ChatAssistant city={city} language={language} household={household} />
          </div>
        )}

        {/* TAB 4: IMPACT & COMMUNITY */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            <ImpactBar
              exposureReductionPct={planData ? planData.impact_summary.exposure_reduction_pct : 42}
              co2AvoidedKgWeek={planData ? planData.impact_summary.co2_avoided_kg_week : 8.5}
              costSavedInrMonth={planData ? planData.impact_summary.cost_saved_inr_month : 1850}
              cigarettesAvoidedDay={planData ? planData.impact_summary.cigarettes_avoided_day : 2.4}
              confidence={planData ? planData.impact_summary.confidence : "Modelled estimate"}
            />
            <CommunityView city={city} />
          </div>
        )}

        {/* TAB 5: SCHOOL GUIDANCE */}
        {activeTab === 'school' && (
          <div key={city} className="max-w-4xl mx-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <SchoolView city={city} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">BreatheWise</span>
            <span>• Urban Air Quality Companion</span>
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-right max-w-full break-words">
            {t.common.disclaimer}
          </div>
        </div>
      </footer>
    </div>
  );
}