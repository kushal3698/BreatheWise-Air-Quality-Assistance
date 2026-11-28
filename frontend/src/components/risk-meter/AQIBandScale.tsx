'use client';

import React from 'react';
import { CPCB_BANDS } from '@/lib/cpcb';

interface AQIBandScaleProps {
  aqi: number;
  activeBandIdx: number;
  markerPosition: number;
}

export const AQIBandScale: React.FC<AQIBandScaleProps> = ({
  aqi,
  activeBandIdx,
  markerPosition,
}) => {
  return (
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
        {CPCB_BANDS.map((b, idx) => {
          const isActive = idx === activeBandIdx;
          return (
            <div
              key={b.name}
              className={`h-full rounded-lg transition-all duration-300 relative ${b.bg} ${
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
        {CPCB_BANDS.map((b, idx) => {
          const isActive = idx === activeBandIdx;
          return (
            <div key={b.name} className="flex flex-col items-center">
              <span className={`text-[10px] ${isActive ? 'font-black text-slate-900' : 'text-slate-600 font-medium'}`}>
                {b.range}
              </span>
              <span 
                className={`text-[10px] leading-tight ${isActive ? 'font-extrabold text-slate-900 underline decoration-2' : 'text-slate-600 font-normal'}`}
              >
                {b.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
