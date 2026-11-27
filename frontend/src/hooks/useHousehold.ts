import { useState } from 'react';
import { HouseholdProfile } from '@/lib/api';

const DEFAULT_HOUSEHOLD: HouseholdProfile = {
  members: [
    { id: '1', role: 'child', age: 8, sensitivities: [] },
    { id: '2', role: 'adult', age: 38, sensitivities: ['asthma'] },
    { id: '3', role: 'adult', age: 40, sensitivities: [] },
    { id: '4', role: 'elderly', age: 68, sensitivities: [] }
  ],
  transport: {
    mode: 'petrol_car',
    vehicles: 1,
    school_run_km: 4.0,
    commute_km: 15.0
  },
  home: {
    type: 'apartment',
    floor: 4,
    has_purifier: false,
    cooking_fuel: 'LPG'
  },
  work_from_home_days: 2
};

export function useHousehold(initial: HouseholdProfile = DEFAULT_HOUSEHOLD) {
  const [household, setHousehold] = useState<HouseholdProfile>(initial);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleSensitivity = (role: string, sens: string) => {
    setHousehold(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.role === role) {
          const has = m.sensitivities.includes(sens);
          return {
            ...m,
            sensitivities: has
              ? m.sensitivities.filter(s => s !== sens)
              : [...m.sensitivities, sens]
          };
        }
        return m;
      })
    }));
  };

  return {
    household,
    setHousehold,
    isDrawerOpen,
    setIsDrawerOpen,
    toggleSensitivity
  };
}
