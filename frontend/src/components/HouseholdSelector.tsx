'use client';

import React from 'react';
import { Users, Car, Home, Flame, Plus, Trash2, HeartPulse, Shield } from 'lucide-react';
import { HouseholdProfile, HouseholdMember } from '@/lib/api';

interface HouseholdSelectorProps {
  profile: HouseholdProfile;
  onChange: (profile: HouseholdProfile) => void;
}

export const HouseholdSelector: React.FC<HouseholdSelectorProps> = ({ profile, onChange }) => {
  const addMember = (role: string, age: number, sensitivities: string[] = []) => {
    const updated = {
      ...profile,
      members: [...profile.members, { id: Date.now().toString(), role, age, sensitivities }]
    };
    onChange(updated);
  };

  const removeMember = (index: number) => {
    const updated = {
      ...profile,
      members: profile.members.filter((_, i) => i !== index)
    };
    onChange(updated);
  };

  const toggleSensitivity = (index: number, sens: string) => {
    const updatedMembers = [...profile.members];
    const member = updatedMembers[index];
    if (member.sensitivities.includes(sens)) {
      member.sensitivities = member.sensitivities.filter(s => s !== sens);
    } else {
      member.sensitivities.push(sens);
    }
    onChange({ ...profile, members: updatedMembers });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Household & Lifestyle Profile</h3>
            <p className="text-xs text-slate-500">BreatheWise tailors every plan to who lives with you</p>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Family Members ({profile.members.length}) • {profile.members.filter(m => m.sensitivities.length > 0).length} with sensitivities
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addMember('child', 8)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg cursor-pointer"
            >
              + Child
            </button>
            <button
              onClick={() => addMember('adult', 35)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg cursor-pointer"
            >
              + Adult
            </button>
            <button
              onClick={() => addMember('elderly', 68)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg cursor-pointer"
            >
              + Senior
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {profile.members.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <span className="capitalize font-semibold text-slate-800">
                  {m.role} ({m.age} yrs)
                </span>
                {m.sensitivities.includes('asthma') ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 border border-red-300">
                    <HeartPulse className="w-3 h-3 text-red-600" />
                    Asthma / Respiratory
                    <button
                      type="button"
                      onClick={() => toggleSensitivity(idx, 'asthma')}
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
                    className="text-[10px] text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 rounded-full px-2 py-0.5 cursor-pointer hover:border-slate-400 hover:bg-white transition-colors"
                  >
                    + Add Asthma
                  </button>
                )}
              </div>
              <button
                onClick={() => removeMember(idx)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transport & Commute Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Primary Transport Mode
          </label>
          <select
            value={profile.transport.mode}
            onChange={(e) => onChange({
              ...profile,
              transport: { ...profile.transport, mode: e.target.value }
            })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-medium"
          >
            <option value="petrol_car">Petrol Car</option>
            <option value="diesel_car">Diesel Car / SUV</option>
            <option value="cng_car">CNG Car</option>
            <option value="ev_car">Electric Vehicle (EV)</option>
            <option value="petrol_twowheeler">Motorcycle / Scooter</option>
            <option value="metro">Metro Rail</option>
            <option value="bus">Public Bus</option>
            <option value="walking">Walking / Bicycle</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Work From Home Days / Week
          </label>
          <select
            value={profile.work_from_home_days}
            onChange={(e) => onChange({
              ...profile,
              work_from_home_days: parseInt(e.target.value, 10)
            })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-medium"
          >
            <option value="0">0 Days (Full In-Office)</option>
            <option value="1">1 Day WFH</option>
            <option value="2">2 Days WFH</option>
            <option value="3">3 Days WFH</option>
            <option value="5">5 Days (Fully Remote)</option>
          </select>
        </div>
      </div>

      {/* Home Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Cooking Fuel
          </label>
          <select
            value={profile.home.cooking_fuel}
            onChange={(e) => onChange({
              ...profile,
              home: { ...profile.home, cooking_fuel: e.target.value }
            })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-medium"
          >
            <option value="LPG">LPG Gas Cylinder</option>
            <option value="induction">Electric Induction (Cleanest)</option>
            <option value="piped_gas">Piped Natural Gas (PNG)</option>
            <option value="wood">Wood / Biomass</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Air Purifier Present
          </label>
          <div className="flex items-center gap-3 h-9">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="purifier"
                checked={profile.home.has_purifier}
                onChange={() => onChange({
                  ...profile,
                  home: { ...profile.home, has_purifier: true }
                })}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              Yes, have purifier
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="purifier"
                checked={!profile.home.has_purifier}
                onChange={() => onChange({
                  ...profile,
                  home: { ...profile.home, has_purifier: false }
                })}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              No purifier yet
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
