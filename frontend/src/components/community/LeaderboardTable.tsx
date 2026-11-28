'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { CommunityLeaderboardEntry } from '@/lib/api';

interface LeaderboardTableProps {
  entries: CommunityLeaderboardEntry[];
  city: string;
}

export function LeaderboardTable({ entries, city }: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
          Neighborhood Collective Impact Leaderboard
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
            Demo Data
          </span>
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Verified resident car-free trips and localized emissions abatement across participating RWAs.
      </p>

      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[500px] text-xs text-left">
          <caption className="sr-only">Neighborhood collective CO2 savings leaderboard across participating Indian cities</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th scope="col" className="py-2.5 px-3">Rank</th>
              <th scope="col" className="py-2.5 px-3">Neighborhood / RWA</th>
              <th scope="col" className="py-2.5 px-3">City</th>
              <th scope="col" className="py-2.5 px-3 text-right">Active Residents</th>
              <th scope="col" className="hidden sm:table-cell py-2.5 px-3 text-right">Car-Free Trips</th>
              <th scope="col" className="py-2.5 px-3 text-right whitespace-nowrap">CO₂ Avoided</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {entries.map((entry, idx) => {
              const isCurrentCity = Boolean(city && entry.city.toLowerCase() === city.toLowerCase());
              return (
                <tr
                  key={entry.neighbourhood}
                  className={`transition-colors ${
                    isCurrentCity
                      ? 'bg-emerald-50/80 font-semibold text-slate-900 border-l-2 border-emerald-600'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900">{entry.neighbourhood}</span>
                    {isCurrentCity && (
                      <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                        Your City
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{entry.city}</td>
                  <td className="py-3 px-3 text-right">{entry.participants}</td>
                  <td className="hidden sm:table-cell py-3 px-3 text-right text-slate-600">{entry.car_free_trips} trips</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                    +{entry.co2_avoided_kg.toLocaleString()} kg
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
