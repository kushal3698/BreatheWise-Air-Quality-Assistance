'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilteredCity {
  name: string;
  state: string;
  aqi: number;
  cat: string;
  color: string;
}

interface CitySearchAutocompleteProps {
  cityInput: string;
  setCityInput: (val: string) => void;
  searchDropdownOpen: boolean;
  setSearchDropdownOpen: (open: boolean) => void;
  filteredCities: FilteredCity[];
  handleCitySubmit: (e: React.FormEvent) => void;
  selectSearchedCity: (cityName: string) => void;
  variant?: 'desktop' | 'mobile';
}

export function CitySearchAutocomplete({
  cityInput,
  setCityInput,
  searchDropdownOpen,
  setSearchDropdownOpen,
  filteredCities,
  handleCitySubmit,
  selectSearchedCity,
  variant = 'desktop',
}: CitySearchAutocompleteProps) {
  const isMobile = variant === 'mobile';
  const inputClass = isMobile
    ? 'text-xs pl-8 pr-7 py-2 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full'
    : 'text-xs pl-7 pr-6 py-1.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 transition-all focus:w-52';
  const dropdownClass = isMobile
    ? 'absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-1 divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150'
    : 'absolute top-full right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150';

  return (
    <div className="relative">
      <form onSubmit={handleCitySubmit} className="relative" role="search">
        <input
          type="text"
          aria-label="Search city name"
          maxLength={60}
          value={cityInput}
          onChange={(e) => {
            setCityInput(e.target.value);
            setSearchDropdownOpen(true);
          }}
          onFocus={() => setSearchDropdownOpen(true)}
          onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 250)}
          placeholder={isMobile ? 'Search any Indian city (e.g. Pune, Chennai, Jaipur)...' : 'Search city...'}
          className={inputClass}
        />
        <button
          type="submit"
          aria-label="Submit city search"
          title="Search city"
          className={`w-4 h-4 text-slate-600 hover:text-emerald-700 absolute ${
            isMobile ? 'left-2.5 top-2.5' : 'left-2 top-2'
          } cursor-pointer flex items-center justify-center p-0 border-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded`}
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        {cityInput && (
          <button
            type="button"
            aria-label="Clear city search input"
            onClick={() => {
              setCityInput('');
              setSearchDropdownOpen(false);
            }}
            className={`absolute ${
              isMobile ? 'right-2.5 top-2.5' : 'right-2 top-2'
            } text-slate-600 hover:text-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded`}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      {searchDropdownOpen && filteredCities.length > 0 && (
        <div className={dropdownClass}>
          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Instant City Matches
          </div>
          {filteredCities.map((item) => (
            <button
              key={item.name}
              type="button"
              onMouseDown={() => selectSearchedCity(item.name)}
              onClick={() => selectSearchedCity(item.name)}
              onTouchStart={isMobile ? () => selectSearchedCity(item.name) : undefined}
              className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div>
                <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">{item.name}</span>
                <span className="text-[10px] text-slate-600 ml-1.5">({item.state})</span>
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
  );
}
