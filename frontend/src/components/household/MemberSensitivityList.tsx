'use client';

import React from 'react';
import { Trash2, HeartPulse } from 'lucide-react';
import { HouseholdProfile } from '@/lib/api';

interface MemberSensitivityListProps {
  profile: HouseholdProfile;
  onChange: (profile: HouseholdProfile) => void;
}

export function MemberSensitivityList({ profile, onChange }: MemberSensitivityListProps) {
  const addMember = (role: string, age: number, sensitivities: string[] = []) => {
    onChange({
      ...profile,
      members: [...profile.members, { id: Date.now().toString(), role, age, sensitivities }],
    });
  };

  const removeMember = (index: number) => {
    onChange({
      ...profile,
      members: profile.members.filter((_, i) => i !== index),
    });
  };

  const toggleSensitivity = (index: number, sens: string) => {
    const updatedMembers = profile.members.map((member, idx) => {
      if (idx !== index) return member;
      const hasSens = member.sensitivities.includes(sens);
      return {
        ...member,
        sensitivities: hasSens
          ? member.sensitivities.filter((s) => s !== sens)
          : [...member.sensitivities, sens],
      };
    });
    onChange({ ...profile, members: updatedMembers });
  };

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Family Members ({profile.members.length}) • {profile.members.filter((m) => m.sensitivities.length > 0).length} with sensitivities
        </legend>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => addMember('child', 8)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg cursor-pointer"
          >
            + Child
          </button>
          <button
            type="button"
            onClick={() => addMember('adult', 35)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg cursor-pointer"
          >
            + Adult
          </button>
          <button
            type="button"
            onClick={() => addMember('elderly', 68)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg cursor-pointer"
          >
            + Senior
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {profile.members.map((m, idx) => (
          <div
            key={m.id || idx}
            className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="capitalize font-semibold text-slate-800">
                {m.role} ({m.age} yrs)
              </span>
              {m.sensitivities.includes('asthma') ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 border border-red-300">
                  <HeartPulse className="w-3 h-3 text-red-600" aria-hidden="true" />
                  Asthma / Respiratory
                  <button
                    type="button"
                    onClick={() => toggleSensitivity(idx, 'asthma')}
                    aria-label={`Remove asthma sensitivity for ${m.role}`}
                    className="ml-1 hover:text-red-950 font-black cursor-pointer text-xs"
                    title="Remove sensitivity"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleSensitivity(idx, 'asthma')}
                  className="text-[10px] text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-full px-2 py-0.5 cursor-pointer hover:border-slate-400 hover:bg-white transition-colors"
                >
                  + Add Asthma
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeMember(idx)}
              aria-label={`Remove ${m.role} from household`}
              className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
