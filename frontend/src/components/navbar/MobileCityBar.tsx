'use client';

import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { CitySearchAutocomplete, FilteredCity } from './CitySearchAutocomplete';

interface MobileCityBarProps {
  city: string;
  selectedCityLabel: string;
  aqi: number;
  category: string;
  cpcbColor: string;
  cityInput: string;
  setCityInput: (val: string) => void;
  searchDropdownOpen: boolean;
  setSearchDropdownOpen: (open: boolean) => void;
  filteredCities: FilteredCity[];
  popularCities: string[];
  handleCitySelect: (cityName: string) => void;
  handleCitySubmit: (e: React.FormEvent) => void;
  selectSearchedCity: (cityName: string) => void;
}

export function MobileCityBar({
  city,
  selectedCityLabel,
  aqi,
  category,
  cpcbColor,
  cityInput,
  setCityInput,
  searchDropdownOpen,
  setSearchDropdownOpen,
  filteredCities,
  popularCities,
  handleCitySelect,
  handleCitySubmit,
  selectSearchedCity,
}: MobileCityBarProps) {
  return (
    <div className="flex lg:hidden flex-col gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-slate-800">
            Selected City: <span className="text-emerald-700 font-extrabold">{selectedCityLabel}</span>
          </span>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
          style={{
            backgroundColor: `${cpcbColor}18`,
            color: cpcbColor,
            borderColor: `${cpcbColor}40`,
          }}
        >
          AQI {aqi} • {category}
        </span>
      </div>

      <CitySearchAutocomplete
        cityInput={cityInput}
        setCityInput={setCityInput}
        searchDropdownOpen={searchDropdownOpen}
        setSearchDropdownOpen={setSearchDropdownOpen}
        filteredCities={filteredCities}
        handleCitySubmit={handleCitySubmit}
        selectSearchedCity={selectSearchedCity}
        variant="mobile"
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {popularCities.map((c) => {
          const isSelected = city.toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleCitySelect(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md scale-105 ring-2 ring-emerald-400 ring-offset-1'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              <span>{c}</span>
              {isSelected && <Check className="w-3 h-3 text-white ml-0.5" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
