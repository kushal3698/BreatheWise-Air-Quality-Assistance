'use client';

import React from 'react';
import { 
  Footprints, 
  Home, 
  Repeat, 
  Clock, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  TrendingDown, 
  Leaf, 
  BookOpen 
} from 'lucide-react';
import { DailyPlan, PlanActionItem, HouseholdProfile } from '@/lib/api';

interface PlanCardProps {
  plan: DailyPlan;
  household?: HouseholdProfile;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, household }) => {
  const { summary, sections, today_timeline, cautions, disclaimer } = plan;

  const renderActionList = (items: PlanActionItem[], icon: React.ReactNode, title: string, subtitle: string) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1 text-slate-800">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 transition-all hover:border-emerald-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-sm text-slate-900">{item.action}</span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize font-medium">
                    {item.effort} effort
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                    item.cost === 'free' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.cost}
                  </span>
                </div>
              </div>

              {/* Why statement */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                <strong className="text-slate-700 font-semibold">Why this matters: </strong>
                {item.why}
              </p>

              {/* Impact badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-3 text-xs">
                  {item.impact.exposure_reduction_pct ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      ~{item.impact.exposure_reduction_pct}% less exposure
                    </span>
                  ) : null}
                  {item.impact.co2_saved_kg ? (
                    <span className="flex items-center gap-1 text-teal-700 font-semibold">
                      <Leaf className="w-3.5 h-3.5" />
                      +{item.impact.co2_saved_kg} kg CO₂ saved
                    </span>
                  ) : null}
                  {item.impact.cost_saved_inr ? (
                    <span className="text-blue-700 font-semibold">
                      ₹{item.impact.cost_saved_inr} saved
                    </span>
                  ) : null}
                </div>

                {/* Sources pill */}
                {item.sources && item.sources.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <BookOpen className="w-3 h-3" />
                    <span>{item.sources[0].replace('kb/', '').replace('.md', '')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Plan Header Summary */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>BreatheWise Daily Action Plan</span>
          </div>
          {household && (
            <span className="bg-emerald-900/60 text-emerald-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              {household.members.length} Family Members ({household.members.filter(m => m.sensitivities.length > 0).length} with sensitivities)
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold leading-snug">{summary}</h2>
      </div>

      {/* Cautions Alert if present or if household has sensitivities */}
      {((cautions && cautions.length > 0) || (household?.members?.some(m => m.sensitivities.length > 0))) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-900 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm mb-2 text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Health & Vulnerability Cautions</span>
          </div>
          <ul className="space-y-1.5 text-xs text-red-800/90 list-disc list-inside">
            {cautions && cautions.length > 0 ? (
              cautions.map((c, i) => (
                <li key={i}>{c}</li>
              ))
            ) : (
              <li>One or more household members have respiratory sensitivities (asthma/COPD): Keep fast-acting reliever inhalers easily accessible and shift intense morning cardio indoors.</li>
            )}
          </ul>
        </div>
      )}

      {/* Action Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderActionList(
          sections.low_emission_routines,
          <Footprints className="w-5 h-5" />,
          "Low-Emission Routines",
          "Commute, school run & exercise re-timed"
        )}
        {renderActionList(
          sections.indoor_air_hacks,
          <Home className="w-5 h-5" />,
          "Indoor Air Playbook",
          "Ventilation, filtration & cooking hacks"
        )}
        {renderActionList(
          sections.sustainable_alternatives,
          <Repeat className="w-5 h-5" />,
          "Sustainable Alternatives",
          "Trip batching, pooling & clean mobility"
        )}
      </div>

      {/* Today's Timeline */}
      {today_timeline && today_timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base mb-4">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Today&apos;s Hourly Protection Schedule</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {today_timeline.map((slot, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md self-start border border-emerald-200 mb-2">
                  {slot.time}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {slot.advice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
