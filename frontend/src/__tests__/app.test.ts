import { describe, it, expect } from 'vitest';
import { I18N_DATA, SupportedLanguage } from '../lib/i18n';
import { getCityPresetAQI, getCityPresetPlan, calculateCPCB_AQI } from '../lib/initialData';

describe('BreatheWise Application Core Logic', () => {
  it('supports all required Indian languages', () => {
    const languages: SupportedLanguage[] = ['en', 'hi', 'te', 'ta'];
    languages.forEach((lang) => {
      const data = I18N_DATA[lang];
      expect(data).toBeDefined();
      expect(data.appName).toBeTruthy();
      expect(data.nav.dashboard).toBeTruthy();
      expect(data.nav.planner).toBeTruthy();
      expect(data.nav.assistant).toBeTruthy();
    });
  });

  it('calculates official CPCB AQI correctly with integer rounding (PM2.5 60.1 -> 100, PM10 118.3 -> 112)', () => {
    // PM2.5 = 60.1 -> sub-index 100 after integer rounding, PM10 = 118.3 -> 112
    const res = calculateCPCB_AQI(60.1, 118.3);
    expect(res.subIndices.pm2_5).toBe(100);
    expect(res.subIndices.pm10).toBe(112);
    expect(res.aqi).toBe(112);
    expect(res.category).toBe('Moderate');

    // Multi-pollutant check: max of all supplied pollutants
    const multi = calculateCPCB_AQI(30, 45, 120, 20, 1.0, 40); // NO2 = 120 -> sub-index ~140 (Moderate)
    expect(multi.subIndices.no2).toBeGreaterThan(100);
    expect(multi.aqi).toBe(multi.subIndices.no2);
  });

  it('correctly calculates Delhi headline CPCB AQI as max(sub-indices) = 345 Very Poor', () => {
    const res = calculateCPCB_AQI(178.4, 288.0, 45.2, 14.8, 1.9, 28.5);
    expect(res.subIndices.pm2_5).toBe(345);
    expect(res.subIndices.pm10).toBe(238);
    expect(res.subIndices.no2).toBe(56);
    expect(res.aqi).toBe(345);
    expect(res.category).toBe('Very Poor');
    expect(res.dominantPollutant.name).toBe('PM2.5');
    expect(res.dominantPollutant.subIndex).toBe(345);

    const delhi = getCityPresetAQI('Delhi');
    expect(delhi.current.aqi).toBe(345);
    expect(delhi.current.category).toBe('Very Poor');
  });

  it('demonstrates realistic diurnal atmospheric pattern with strictly even 2-hour intervals', () => {
    const delhi = getCityPresetAQI('Delhi');
    expect(delhi.forecast).toBeDefined();
    expect(delhi.forecast.length).toBe(12);

    const expectedHours = [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ];
    expect(delhi.forecast.map(f => f.hour)).toEqual(expectedHours);

    const peakMorning = delhi.forecast.find(f => f.hour === '08:00');
    const dipAfternoon = delhi.forecast.find(f => f.hour === '14:00');
    const peakEvening = delhi.forecast.find(f => f.hour === '20:00');

    expect(peakMorning).toBeDefined();
    expect(dipAfternoon).toBeDefined();
    expect(peakEvening).toBeDefined();

    // Afternoon dip must be lower than morning and evening peaks
    expect(dipAfternoon!.aqi).toBeLessThan(peakMorning!.aqi);
    expect(dipAfternoon!.aqi).toBeLessThan(peakEvening!.aqi);
  });

  it('provides safe windows derived from forecast curve with realistic reason', () => {
    const delhi = getCityPresetAQI('Delhi');
    expect(delhi.safe_windows.length).toBeGreaterThan(0);
    const win = delhi.safe_windows[0];
    expect(win.guidance).toContain('Lowest forecast AQI today');
    // Window start matches afternoon dispersion
    expect(win.start).toBe('13:30');
    expect(win.end).toBe('16:30');
  });

  it('tailors transit alternatives by city type: Guntur does not claim metro while Delhi does', () => {
    const delhiPlan = getCityPresetPlan('Delhi');
    const gunturPlan = getCityPresetPlan('Guntur');

    const delhiRoutines = delhiPlan.sections.low_emission_routines.map(a => a.action.toLowerCase()).join(' ');
    const gunturRoutines = gunturPlan.sections.low_emission_routines.map(a => a.action.toLowerCase()).join(' ');

    expect(delhiRoutines).toContain('metro');
    expect(gunturRoutines).not.toContain('metro');
    expect(gunturRoutines).toMatch(/bus|shared transit|carpool/);
  });

  it('adjusts indoor air hacks based on air purifier ownership in household', () => {
    const withoutPurifier = getCityPresetPlan('Delhi', {
      members: [],
      transport: { mode: 'petrol_car', vehicles: 1, school_run_km: 4, commute_km: 15 },
      home: { type: 'apartment', floor: 2, has_purifier: false, cooking_fuel: 'LPG' },
      work_from_home_days: 2
    });

    const withPurifier = getCityPresetPlan('Delhi', {
      members: [],
      transport: { mode: 'petrol_car', vehicles: 1, school_run_km: 4, commute_km: 15 },
      home: { type: 'apartment', floor: 2, has_purifier: true, cooking_fuel: 'LPG' },
      work_from_home_days: 2
    });

    const noPurifierHacks = withoutPurifier.sections.indoor_air_hacks.map(h => h.action).join(' ');
    const withPurifierHacks = withPurifier.sections.indoor_air_hacks.map(h => h.action).join(' ');

    expect(noPurifierHacks).toContain('DIY Corsi-Rosenthal');
    expect(withPurifierHacks).toContain('Run bedroom HEPA');
  });

  it('generates consistent procedural data for unknown cities with diurnal peaks and even 2h ticks', () => {
    const unknownCity = getCityPresetAQI('RanchiXYZ');
    expect(unknownCity.location.name).toBe('RanchiXYZ');
    expect(unknownCity.forecast.length).toBe(12);
    expect(unknownCity.forecast.map(f => f.hour)).toEqual([
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ]);
    const peakMorning = unknownCity.forecast.find(f => f.hour === '08:00');
    const dipAfternoon = unknownCity.forecast.find(f => f.hour === '14:00');
    expect(peakMorning).toBeDefined();
    expect(dipAfternoon).toBeDefined();
    expect(dipAfternoon!.aqi).toBeLessThan(peakMorning!.aqi);
  });
});
