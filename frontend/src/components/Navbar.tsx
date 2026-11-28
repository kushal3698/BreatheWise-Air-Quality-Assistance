'use client';

import React from 'react';
import { Wind, Check } from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n';
import type { CityToastInfo } from '@/hooks/useAirQuality';
import { CityToastBanner } from './navbar/CityToastBanner';
import { CitySearchAutocomplete, FilteredCity } from './navbar/CitySearchAutocomplete';
import { LanguageSwitcher } from './navbar/LanguageSwitcher';

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
  cityToast: CityToastInfo | null;
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
      <CityToastBanner cityToast={cityToast} />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm"
              aria-hidden="true"
            >
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

          <div className="hidden lg:flex items-center gap-2">
            <div
              role="group"
              aria-label="Popular cities"
              className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold"
            >
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
                    {isSelected && <Check className="w-3 h-3 text-white ml-0.5" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <CitySearchAutocomplete
              cityInput={cityInput}
              setCityInput={setCityInput}
              searchDropdownOpen={searchDropdownOpen}
              setSearchDropdownOpen={setSearchDropdownOpen}
              filteredCities={filteredCities}
              handleCitySubmit={handleCitySubmit}
              selectSearchedCity={selectSearchedCity}
              variant="desktop"
            />
          </div>

          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>
      </header>
    </>
  );
}
