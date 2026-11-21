'use client';

import React from 'react';
import { TrendingDown, Leaf, IndianRupee, HeartPulse, Sparkles, Check } from 'lucide-react';

interface ImpactBarProps {
  exposureReductionPct: number;
  co2AvoidedKgWeek: number;
  costSavedInrMonth: number;
  cigarettesAvoidedDay?: number;
  confidence?: string;
}

export const ImpactBar: React.FC<ImpactBarProps> = ({
  exposureReductionPct = 42,
  co2AvoidedKgWeek = 8.5,
  costSavedInrMonth = 1850,
  cigarettesAvoidedDay = 2.4,
  confidence = 'Modelled estimate',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Quantified Direct Impact
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Modelled estimate
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated deterministically using vehicle emission factors & indoor infiltration physics
          </p>
        </div>
      </div>

      {/* Before vs After Visual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Before Card */}
        <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-200">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Unplanned Daily Routine (Before)
          </div>
          <ul className="text-xs text-rose-900/80 space-y-1 mt-2">
            <li>• Morning outdoor walk/jog during peak 7 AM smog peak</li>
            <li>• Windows left open during morning cold-air inversion</li>
            <li>• Private car travel during idling peak rush hours</li>
            <li>• LPG cooking without forced kitchen exhaust</li>
          </ul>
        </div>

        {/* After Card */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Following BreatheWise Plan (After)
          </div>
          <ul className="text-xs text-emerald-900/80 space-y-1 mt-2">
            <li>• Shift cardio indoors; walk only in afternoon safe window</li>
            <li>• Windows sealed in morning; brief afternoon ventilation</li>
            <li>• Metro/carpool modal shift and batched grocery runs</li>
            <li>• Purifier / DIY filter box running with sealed doors</li>
          </ul>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exposure Avoided */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold">Fine PM2.5 Inhaled</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-900">
              ~{exposureReductionPct}%
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              Average exposure reduction today
            </div>
          </div>
        </div>

        {/* Cigarettes Equivalent */}
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-800 mb-2">
            <span className="text-xs font-semibold">Cigarette Equivalent</span>
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-teal-900">
              ~{cigarettesAvoidedDay} <span className="text-sm font-normal text-teal-700">cigs/day</span>
            </div>
            <div className="text-xs text-teal-700 mt-1 font-medium">
              Harm avoided based on Berkeley metric
            </div>
          </div>
        </div>

        {/* CO2 Avoided */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-xs font-semibold">CO₂ Emissions</span>
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-900">
              {co2AvoidedKgWeek} <span className="text-sm font-normal text-blue-700">kg/week</span>
            </div>
            <div className="text-xs text-blue-700 mt-1 font-medium">
              From transit shift & errand batching
            </div>
          </div>
        </div>

        {/* Cost Saved */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold">Fuel & Transit Cost</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-900">
              ₹{costSavedInrMonth.toLocaleString()} <span className="text-sm font-normal text-amber-700">/mo</span>
            </div>
            <div className="text-xs text-amber-700 mt-1 font-medium">
              Estimated monthly household savings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
