'use client';

import React, { useEffect, useState } from 'react';
import { Users, Trophy, Award, Leaf, ShieldAlert, Sparkles, CheckCircle, MapPin } from 'lucide-react';
import { fetchCommunityChallenges, fetchCommunityLeaderboard, CommunityChallenge, CommunityLeaderboardEntry } from '@/lib/api';
import { DEFAULT_COMMUNITY_CHALLENGES, DEFAULT_COMMUNITY_LEADERBOARD } from '@/lib/initialData';

interface CommunityViewProps {
  city?: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ city = 'Delhi' }) => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(DEFAULT_COMMUNITY_CHALLENGES);
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboardEntry[]>(DEFAULT_COMMUNITY_LEADERBOARD);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityChallenges()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) setChallenges(res);
      })
      .catch(() => {});
    fetchCommunityLeaderboard()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) setLeaderboard(res);
      })
      .catch(() => {});
  }, []);

  const handleJoin = (id: string, title: string) => {
    const isNowJoined = !joined[id];
    setJoined(prev => ({ ...prev, [id]: isNowJoined }));
    setToastMessage(
      isNowJoined 
        ? `Joined "${title}"! Your impact contributes to cleaner neighborhood air in ${city}.`
        : `Left "${title}" challenge.`
    );
    setTimeout(() => setToastMessage(null), 3200);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification on Join */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in fade-in zoom-in-95 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Users className="w-4 h-4" />
          <span>Resident Welfare & Neighborhood Action</span>
        </div>
        <h2 className="text-xl font-bold leading-snug">
          Community Air Challenges & RWA Leaderboard
        </h2>
        <p className="text-xs text-teal-100 mt-1">
          Cleaner air requires collective neighborhood action. Join local challenges to multiply emissions impact across {city} and partner cities.
        </p>
      </div>

      {/* Challenges Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Active Neighborhood Challenges
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
              Demo Data
            </span>
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Community-led emission reduction campaigns across Indian urban centers. Pledging actions directly cut localized surface emissions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {c.target_date}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {c.participants_count + (joined[c.id] ? 1 : 0)} joined
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">{c.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  {c.total_co2_saved_kg} kg CO₂ saved
                </span>
                <button
                  onClick={() => handleJoin(c.id, c.title)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
                    joined[c.id]
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs'
                  }`}
                >
                  {joined[c.id] ? 'Joined ✓' : 'Join Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
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
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Neighborhood / RWA</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3 text-right">Active Residents</th>
                <th className="hidden sm:table-cell py-2.5 px-3 text-right">Car-Free Trips</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">CO₂ Avoided</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {leaderboard.map((entry, idx) => {
                const isCurrentCity = city && entry.city.toLowerCase() === city.toLowerCase();
                return (
                  <tr 
                    key={idx} 
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
    </div>
  );
};
