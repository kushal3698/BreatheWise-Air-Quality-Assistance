'use client';

import React, { useEffect, useState } from 'react';
import { Users, Award, CheckCircle } from 'lucide-react';
import {
  fetchCommunityChallenges,
  fetchCommunityLeaderboard,
  CommunityChallenge,
  CommunityLeaderboardEntry,
} from '@/lib/api';
import {
  DEFAULT_COMMUNITY_CHALLENGES,
  DEFAULT_COMMUNITY_LEADERBOARD,
  METRO_CITIES,
} from '@/lib/initialData';
import { ChallengeCard } from './community/ChallengeCard';
import { LeaderboardTable } from './community/LeaderboardTable';

interface CommunityViewProps {
  city?: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ city = 'Delhi' }) => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(DEFAULT_COMMUNITY_CHALLENGES);
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboardEntry[]>(DEFAULT_COMMUNITY_LEADERBOARD);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isMetro = METRO_CITIES.has(city.toLowerCase().trim());

  const getChallengeDescription = (challenge: CommunityChallenge) => {
    if (challenge.id === 'c1' || challenge.title.includes('Car-Free')) {
      return isMetro
        ? 'Pledge to replace private car trips with public transit (bus/metro), cycling, or shared electric shuttles this Friday.'
        : 'Pledge to replace private car trips with public transit (bus / shared electric shuttle), cycling, or carpooling this Friday.';
    }
    return challenge.description;
  };

  useEffect(() => {
    let active = true;
    fetchCommunityChallenges()
      .then((res) => {
        if (active && Array.isArray(res) && res.length > 0) setChallenges(res);
      })
      .catch(() => {});
    fetchCommunityLeaderboard()
      .then((res) => {
        if (active && Array.isArray(res) && res.length > 0) setLeaderboard(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleJoin = (id: string, title: string) => {
    const isNowJoined = !joined[id];
    setJoined((prev) => ({ ...prev, [id]: isNowJoined }));
    setToastMessage(
      isNowJoined
        ? `Joined "${title}"! Your impact contributes to cleaner neighborhood air in ${city}.`
        : `Left "${title}" challenge.`
    );
    setTimeout(() => setToastMessage(null), 3200);
  };

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in fade-in zoom-in-95 pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Users className="w-4 h-4" aria-hidden="true" />
          <span>Resident Welfare &amp; Neighborhood Action</span>
        </div>
        <h2 className="text-xl font-bold leading-snug">Community Air Challenges &amp; RWA Leaderboard</h2>
        <p className="text-xs text-teal-100 mt-1">
          Cleaner air requires collective neighborhood action. Join local challenges to multiply emissions impact across {city} and partner cities.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" aria-hidden="true" />
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
            <ChallengeCard
              key={c.id}
              challenge={c}
              description={getChallengeDescription(c)}
              isJoined={Boolean(joined[c.id])}
              onToggleJoin={handleJoin}
            />
          ))}
        </div>
      </div>

      <LeaderboardTable entries={leaderboard} city={city} />
    </div>
  );
};
