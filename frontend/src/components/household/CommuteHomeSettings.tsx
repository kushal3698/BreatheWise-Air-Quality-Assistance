'use client';

import React from 'react';
import { HouseholdProfile } from '@/lib/api';

interface CommuteHomeSettingsProps {
  profile: HouseholdProfile;
  onChange: (profile: HouseholdProfile) => void;
}

export function CommuteHomeSettings({ profile, onChange }: CommuteHomeSettingsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <label htmlFor="transport-mode-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Primary Transport Mode
          </label>
          <select
            id="transport-mode-select"
            value={profile.transport.mode}
            onChange={(e) =>
              onChange({
                ...profile,
                transport: { ...profile.transport, mode: e.target.value },
              })
            }
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
          <label htmlFor="wfh-days-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Work From Home Days / Week
          </label>
          <select
            id="wfh-days-select"
            value={profile.work_from_home_days}
            onChange={(e) =>
              onChange({
                ...profile,
                work_from_home_days: parseInt(e.target.value, 10),
              })
            }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <label htmlFor="cooking-fuel-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Cooking Fuel
          </label>
          <select
            id="cooking-fuel-select"
            value={profile.home.cooking_fuel}
            onChange={(e) =>
              onChange({
                ...profile,
                home: { ...profile.home, cooking_fuel: e.target.value },
              })
            }
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-medium"
          >
            <option value="LPG">LPG Gas Cylinder</option>
            <option value="induction">Electric Induction (Cleanest)</option>
            <option value="piped_gas">Piped Natural Gas (PNG)</option>
            <option value="wood">Wood / Biomass</option>
          </select>
        </div>

        <fieldset>
          <legend className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Air Purifier Present
          </legend>
          <div className="flex items-center gap-3 h-9">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="purifier"
                checked={profile.home.has_purifier}
                onChange={() =>
                  onChange({
                    ...profile,
                    home: { ...profile.home, has_purifier: true },
                  })
                }
                className="text-emerald-600 focus:ring-emerald-500"
              />
              Yes, have purifier
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="purifier"
                checked={!profile.home.has_purifier}
                onChange={() =>
                  onChange({
                    ...profile,
                    home: { ...profile.home, has_purifier: false },
                  })
                }
                className="text-emerald-600 focus:ring-emerald-500"
              />
              No purifier yet
            </label>
          </div>
        </fieldset>
      </div>
    </>
  );
}
