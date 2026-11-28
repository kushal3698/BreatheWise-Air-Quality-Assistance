'use client';

import React from 'react';
import { Wind, Droplets, Thermometer } from 'lucide-react';
import { CurrentAQI, WeatherInfo } from '@/lib/api';

interface PollutantGridProps {
  current: CurrentAQI;
  weather: WeatherInfo;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ current, weather }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
      {/* PM2.5 with WHO and Indian NAAQS benchmarks */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-600">PM2.5 (Fine)</div>
          <div className="text-lg font-bold text-slate-800">
            {current.pm2_5} <span className="text-xs font-normal text-slate-600">µg/m³</span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] space-y-0.5 leading-tight">
          <div className="flex justify-between items-center text-slate-600">
            <span>WHO limit:</span>
            <span className={current.pm2_5 > 15 ? "font-bold text-rose-700" : "font-bold text-emerald-700"}>
              15 µg/m³ ({Math.round((current.pm2_5 / 15) * 10) / 10}×)
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>India NAAQS:</span>
            <span className={current.pm2_5 > 60 ? "font-bold text-amber-700" : "font-bold text-emerald-700"}>
              60 µg/m³
            </span>
          </div>
        </div>
      </div>

      {/* PM10 with India NAAQS and WHO benchmarks */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-600">PM10 (Inhalable)</div>
          <div className="text-lg font-bold text-slate-800">
            {current.pm10} <span className="text-xs font-normal text-slate-600">µg/m³</span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] space-y-0.5 leading-tight">
          <div className="flex justify-between items-center text-slate-600">
            <span>India NAAQS:</span>
            <span className={current.pm10 > 100 ? "font-bold text-rose-700" : "font-bold text-emerald-700"}>
              100 µg/m³ {current.pm10 > 100 ? `(${Math.round((current.pm10 / 100) * 10) / 10}×)` : '(Within limit)'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>WHO limit:</span>
            <span className={current.pm10 > 45 ? "font-bold text-rose-700" : "font-bold text-emerald-700"}>
              45 µg/m³ ({Math.round((current.pm10 / 45) * 10) / 10}×)
            </span>
          </div>
        </div>
      </div>

      {/* NO2 with India NAAQS benchmark */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-600">NO₂ (Traffic)</div>
          <div className="text-lg font-bold text-slate-800">
            {current.no2 || 35} <span className="text-xs font-normal text-slate-600">µg/m³</span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] space-y-0.5 leading-tight">
          <div className="flex justify-between items-center text-slate-600">
            <span>India NAAQS:</span>
            <span className={(current.no2 || 0) > 80 ? "font-bold text-rose-700" : "font-bold text-emerald-700"}>
              80 µg/m³ {(current.no2 || 0) > 80 ? `(${Math.round(((current.no2 || 0) / 80) * 10) / 10}×)` : '(Within limit)'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Source:</span>
            <span className="text-slate-600 font-medium">Vehicular combustion</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-600">Temperature</div>
          <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span>{weather.temp_c}°C</span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600">
          {weather.temp_c < 18 ? 'Cool air traps smog' : 'Warm thermal mixing'}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-600">Humidity</div>
          <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>{weather.humidity}%</span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600">
          {weather.humidity > 65 ? 'Traps moisture & haze' : 'Dry dispersion'}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-600">Wind Speed</div>
          <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
            <Wind className="w-4 h-4 text-teal-500" />
            <span>{weather.wind_kmh} <span className="text-xs font-normal">km/h</span></span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600">
          {weather.wind_kmh < 6 ? 'Still / Inversion' : 'Dispersion breeze'}
        </div>
      </div>
    </div>
  );
};
