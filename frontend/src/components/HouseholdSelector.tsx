'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { HouseholdProfile } from '@/lib/api';
import { MemberSensitivityList } from './household/MemberSensitivityList';
import { CommuteHomeSettings } from './household/CommuteHomeSettings';

interface HouseholdSelectorProps {
  profile: HouseholdProfile;
  onChange: (profile: HouseholdProfile) => void;
}

export const HouseholdSelector: React.FC<HouseholdSelectorProps> = ({ profile, onChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Household &amp; Lifestyle Profile</h3>
            <p className="text-xs text-slate-500">BreatheWise tailors every plan to who lives with you</p>
          </div>
        </div>
      </div>

      <MemberSensitivityList profile={profile} onChange={onChange} />
      <CommuteHomeSettings profile={profile} onChange={onChange} />
    </div>
  );
};
