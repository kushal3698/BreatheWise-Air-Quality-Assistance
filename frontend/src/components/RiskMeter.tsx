'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { AirQualityData } from '@/lib/api';
import { calculateCPCB_AQI, getAQIBand, CPCB_BANDS } from '@/lib/cpcb';
import { AQIBandScale } from './risk-meter/AQIBandScale';
import { PollutantGrid } from './risk-meter/PollutantGrid';

export { CPCB_BANDS, getAQIBand };

interface RiskMeterProps {
  data: AirQualityData;
  isLive?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ data, isLive = false }) => {
  const { current, station, location, weather } = data;
  const aqi = current.aqi;

  const band = getAQIBand(aqi);
  const activeBandIdx = band.idx;
  const markerPosition = Math.min(97, Math.max(3, (aqi / 500) * 100));

  // Determine dominant pollutant
  let dominantName = current.dominant_pollutant?.name;
  let dominantSubIndex = current.dominant_pollutant?.sub_index;
  if (!dominantName || !dominantSubIndex) {
    const cpcb = calculateCPCB_AQI(
      current.pm2_5,
      current.pm10,
      current.no2,
      current.so2,
      current.co,
      current.o3
    );
    dominantName = cpcb.dominantPollutant.name;
    dominantSubIndex = cpcb.dominantPollutant.subIndex;
  }

  // Reference area clean formatting for Estimated mode
  const cleanRefArea = (station.name || 'Central')
    .replace(/(CAAQMS|Continuous|Ambient|Air Monitoring|Monitoring|Station)/gi, '')
    .trim();

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
          {isLive && station.distance_km > 0 ? (
            <>
              <span>{station.name || 'Continuous Monitoring Station'}</span>
              <span className="font-semibold text-slate-700">• {station.distance_km} km away</span>
            </>
          ) : (
            <>
              <span>Regional estimate for {location.name}</span>
              <span className="font-semibold text-slate-700">
                • Nearest reference: {cleanRefArea || 'Central'} area
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main AQI Meter Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        {/* Left: AQI Number, Category Badge & Dominant Pollutant */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1 flex items-center gap-1.5 flex-wrap">
            <span>Current Air Quality Index (CPCB)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 normal-case">
              Current (11:00)
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-extrabold tracking-tight text-slate-900">{aqi}</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${band.badgeClass}`}>
              {band.name}
            </span>
          </div>

          {/* Dominant Pollutant Line */}
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70 inline-flex">
            <span className="text-slate-500">Dominant pollutant:</span>
            <strong className="text-slate-900 font-bold">{dominantName}</strong>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Sub-index:</span>
            <strong className="text-slate-900 font-bold">~{dominantSubIndex}</strong>
          </div>

          <p className="text-xs text-slate-500 mt-2.5">
            {isLive && station.distance_km > 0
              ? `Air varies street to street. Monitor is ${station.distance_km} km away.`
              : `Regional atmospheric estimate for ${location.name}. Street-level exposures vary with local traffic.`}
          </p>
        </div>

        {/* Middle: 6 Segmented Bands with Active Highlight & Pin */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <AQIBandScale
            aqi={aqi}
            activeBandIdx={activeBandIdx}
            markerPosition={markerPosition}
          />
        </div>
      </div>

      {/* Pollutants Breakdown Grid */}
      <PollutantGrid current={current} weather={weather} />
    </div>
  );
};
