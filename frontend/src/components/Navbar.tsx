'use client';

import React from 'react';
import { Wind, Search, X, Check, Globe } from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n';

interface CityToast {
  name: string;
  aqi: number;
  cat: string;
  color: string;
  safeWindow: string;
}

interface FilteredCity {
  name: string;
  state: string;
  aqi: number;
  cat: string;
  color: string;
}

interface NavbarProps {
  city: string;
  cityInput: string;
  setCityInput: (val: string) => void;
  searchDropdownOpen: boolean;
  setSearchDropdownOpen: (open: boolean) => void;
  filteredCities: FilteredCity[];
  popularCities: string[];
  handleCitySelect: (cityName: string) => void;
  handleCitySubmit: (e: React.FormEvent) => void;
  selectSearchedCity: (cityName: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLiveConnected: boolean;
  isLiveStation: boolean;
  cityToast: CityToast | null;
}

export function Navbar({
  city,
  cityInput,
  setCityInput,
  searchDropdownOpen,
  setSearchDropdownOpen,
  filteredCities,
  popularCities,
  handleCitySelect,
  handleCitySubmit,
  selectSearchedCity,
  language,
  setLanguage,
  isLiveConnected,
  isLiveStation,
  cityToast,
}: NavbarProps) {
  return (
    <>
      {/* City Switch Instant Feedback Floating Toast */}
      {cityToast && (
        <div 
          role="status" 
          aria-live="polite" 
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95"
        >
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

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm" aria-hidden="true">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">BreatheWise</span>
                {isLiveConnected && isLiveStation ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Live Station
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
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
            <div role="group" aria-label="Popular cities" className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
              {popularCities.map((c) => {
                const isSelected = city.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleCitySelect(c)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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
              <form onSubmit={handleCitySubmit} className="relative" role="search">
                <input
                  type="text"
                  aria-label="Search city name"
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 250)}
                  placeholder="Search city..."
                  className="text-xs pl-7 pr-6 py-1.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 transition-all focus:w-52"
                />
                <button
                  type="submit"
                  aria-label="Submit city search"
                  title="Search city"
                  className="w-4 h-4 text-slate-400 hover:text-emerald-600 absolute left-2 top-2 cursor-pointer flex items-center justify-center p-0 border-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                {cityInput && (
                  <button
                    type="button"
                    aria-label="Clear city search input"
                    onClick={() => { setCityInput(''); setSearchDropdownOpen(false); }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
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
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
            <Globe className="w-4 h-4 text-slate-400 hidden sm:block" aria-hidden="true" />
            <select
              value={language}
              aria-label="Select application language"
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>
      </header>
    </>
  );
}
