'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { CityToastInfo } from '@/hooks/useAirQuality';

interface CityToastBannerProps {
  cityToast: CityToastInfo | null;
}

export function CityToastBanner({ cityToast }: CityToastBannerProps) {
  if (!cityToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold shrink-0">
          <Check className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-bold flex items-center gap-2">
            <span>
              Switched to <strong className="text-emerald-300 text-sm font-black">{cityToast.name}</strong>
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${cityToast.color}25`,
                color: cityToast.color,
                border: `1px solid ${cityToast.color}50`,
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
  );
}
