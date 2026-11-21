'use client';

import React from 'react';
import { Clock, Sun, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { SafeWindow } from '@/lib/api';

interface SafeWindowsProps {
  safeWindows: SafeWindow[];
}

export const SafeWindows: React.FC<SafeWindowsProps> = ({ safeWindows }) => {
  if (!safeWindows || safeWindows.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          No Clear Safe Window Detected Today
        </div>
        <p className="mt-1 text-xs text-amber-700">
          Pollutant levels remain elevated throughout the day due to continuous stagnant air. Limit non-essential outdoor travel.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 rounded-2xl border border-emerald-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              Optimal Safe Windows Today
              <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Forecast-based
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Derived from diurnal curve; afternoon thermal convection lowers surface particulate concentration
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeWindows.map((win, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 border transition-all ${
              idx === 0
                ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-200'
                : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 text-sm">
                  {win.start} — {win.end}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Avg AQI ≈ {win.avg_aqi}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {win.guidance}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{idx === 0 ? 'Optimal atmospheric dispersion window' : 'Secondary transit window'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
