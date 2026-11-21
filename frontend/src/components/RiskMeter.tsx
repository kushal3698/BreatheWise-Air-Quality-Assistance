'use client';

import React from 'react';
import { Wind, Droplets, Thermometer, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AirQualityData } from '@/lib/api';

interface RiskMeterProps {
  data: AirQualityData;
}

const CPCB_BANDS = [
  { name: 'Good', min: 0, max: 50, color: '#2ecc71', bg: 'bg-emerald-500', range: '0–50' },
  { name: 'Satisfactory', min: 51, max: 100, color: '#27ae60', bg: 'bg-green-600', range: '51–100' },
  { name: 'Moderate', min: 101, max: 200, color: '#f39c12', bg: 'bg-amber-500', range: '101–200' },
  { name: 'Poor', min: 201, max: 300, color: '#e67e22', bg: 'bg-orange-500', range: '201–300' },
  { name: 'Very Poor', min: 301, max: 400, color: '#e74c3c', bg: 'bg-red-500', range: '301–400' },
  { name: 'Severe', min: 401, max: 500, color: '#8e44ad', bg: 'bg-purple-600', range: '401–500' },
];

export const RiskMeter: React.FC<RiskMeterProps> = ({ data }) => {
  const { current, station, location, weather } = data;
  const aqi = current.aqi;

  const getTextColor = (val: number) => {
    if (val <= 50) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val <= 100) return 'text-green-700 bg-green-50 border-green-200';
    if (val <= 200) return 'text-amber-800 bg-amber-50 border-amber-200';
    if (val <= 300) return 'text-orange-800 bg-orange-50 border-orange-200';
    if (val <= 400) return 'text-red-800 bg-red-50 border-red-200';
    return 'text-purple-900 bg-purple-50 border-purple-200';
  };

  const activeBandIdx = CPCB_BANDS.findIndex(b => aqi >= b.min && aqi <= b.max) !== -1
    ? CPCB_BANDS.findIndex(b => aqi >= b.min && aqi <= b.max)
    : (aqi > 500 ? 5 : 0);

  const markerPosition = Math.min(97, Math.max(3, (aqi / 500) * 100));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-slate-700">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-lg">{location.name}</span>
          {location.state && <span className="text-slate-400 text-sm">({location.state})</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <span>{station.name || 'Regional Airshed Model'}</span>
          <span className="font-semibold text-slate-700">
            • {station.distance_km > 0 ? `${station.distance_km} km away` : 'Modelled Estimate'}
          </span>
        </div>
      </div>

      {/* Main AQI Meter Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        {/* Left: AQI Number & Category */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1 flex items-center gap-1.5 flex-wrap">
            <span>Current Air Quality Index (CPCB)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 normal-case">
              Current (11:00)
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-extrabold tracking-tight text-slate-900">{aqi}</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getTextColor(aqi)}`}>
              {current.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {station.distance_km > 0 
              ? `Air varies street to street. Monitor is ${station.distance_km} km away.` 
              : 'Synthesized regional atmospheric estimate. Local roadside air varies street to street.'}
          </p>
        </div>

        {/* Middle: 6 Segmented Bands with Active Highlight & Pin */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="relative pt-6 pb-1">
            {/* Value Marker Pin */}
            <div 
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-20 pointer-events-none"
              style={{ left: `${markerPosition}%` }}
            >
              <span className="text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-md whitespace-nowrap border border-slate-700">
                {aqi}
              </span>
              <span className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 -mt-0.5" />
            </div>

            {/* Six Segmented Bands */}
            <div className="grid grid-cols-6 gap-1.5 h-4.5 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              {CPCB_BANDS.map((band, idx) => {
                const isActive = idx === activeBandIdx;
                return (
                  <div
                    key={band.name}
                    className={`h-full rounded-lg transition-all duration-300 relative ${band.bg} ${
                      isActive
                        ? 'ring-2 ring-slate-900 ring-offset-1 scale-105 shadow-md z-10 opacity-100'
                        : 'opacity-55 hover:opacity-80'
                    }`}
                  />
                );
              })}
            </div>

            {/* Band Range and Name Labels Below */}
            <div className="grid grid-cols-6 gap-1 text-center pt-2">
              {CPCB_BANDS.map((band, idx) => {
                const isActive = idx === activeBandIdx;
                return (
                  <div key={band.name} className="flex flex-col items-center">
                    <span className={`text-[10px] ${isActive ? 'font-black text-slate-900' : 'text-slate-400 font-medium'}`}>
                      {band.range}
                    </span>
                    <span 
                      className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'text-slate-400 font-normal'}`} 
                      style={{ color: isActive ? band.color : undefined }}
                    >
                      {band.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pollutants Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
        {/* PM2.5 with WHO and Indian NAAQS benchmarks */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">PM2.5 (Fine)</div>
            <div className="text-lg font-bold text-slate-800">{current.pm2_5} <span className="text-xs font-normal text-slate-500">µg/m³</span></div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] space-y-0.5 leading-tight">
            <div className="flex justify-between items-center text-slate-500">
              <span>WHO limit:</span>
              <span className={current.pm2_5 > 15 ? "font-bold text-rose-600" : "font-bold text-emerald-600"}>
                15 µg/m³ ({Math.round((current.pm2_5 / 15) * 10) / 10}×)
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>India NAAQS:</span>
              <span className={current.pm2_5 > 60 ? "font-bold text-amber-600" : "font-bold text-emerald-600"}>
                60 µg/m³
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">PM10 (Inhalable)</div>
            <div className="text-lg font-bold text-slate-800">{current.pm10} <span className="text-xs font-normal text-slate-500">µg/m³</span></div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
            India NAAQS: 100 µg/m³
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">NO₂ (Traffic)</div>
            <div className="text-lg font-bold text-slate-800">{current.no2 || 35} <span className="text-xs font-normal text-slate-500">µg/m³</span></div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
            Vehicular combustion
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">Temperature</div>
            <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>{weather.temp_c}°C</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
            {weather.temp_c < 18 ? 'Cool air traps smog' : 'Warm thermal mixing'}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">Humidity</div>
            <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>{weather.humidity}%</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
            {weather.humidity > 65 ? 'Traps moisture & haze' : 'Dry dispersion'}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400">Wind Speed</div>
            <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
              <Wind className="w-4 h-4 text-teal-500" />
              <span>{weather.wind_kmh} <span className="text-xs font-normal">km/h</span></span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
            {weather.wind_kmh < 6 ? 'Still / Inversion' : 'Dispersion breeze'}
          </div>
        </div>
      </div>
    </div>
  );
};
