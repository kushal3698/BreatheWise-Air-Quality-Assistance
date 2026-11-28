'use client';

import React from 'react';
import { Leaf } from 'lucide-react';
import { CommunityChallenge } from '@/lib/api';

interface ChallengeCardProps {
  challenge: CommunityChallenge;
  description: string;
  isJoined: boolean;
  onToggleJoin: (id: string, title: string) => void;
}

export function ChallengeCard({ challenge, description, isJoined, onToggleJoin }: ChallengeCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {challenge.target_date}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {challenge.participants_count + (isJoined ? 1 : 0)} joined
          </span>
        </div>
        <h4 className="font-bold text-sm text-slate-900 mb-1">{challenge.title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">{description}</p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-teal-700 flex items-center gap-1">
          <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
          {challenge.total_co2_saved_kg} kg CO₂ saved
        </span>
        <button
          type="button"
          aria-pressed={isJoined}
          onClick={() => onToggleJoin(challenge.id, challenge.title)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
            isJoined
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs'
          }`}
        >
          {isJoined ? 'Joined ✓' : 'Join Challenge'}
        </button>
      </div>
    </div>
  );
}
