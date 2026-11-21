import { describe, it, expect } from 'vitest';
import { I18N_DATA, SupportedLanguage } from '../lib/i18n';
import { getCityPresetAQI, calculateCPCB_AQI } from '../lib/initialData';

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

  it('calculates official CPCB AQI correctly with 61 lower breakpoint for PM2.5 and max over pollutants', () => {
    // PM2.5 = 60.1 -> sub-index 98 (using 61-90 official band), PM10 = 118.3 -> 113
    const res = calculateCPCB_AQI(60.1, 118.3);
    expect(res.subIndices.pm2_5).toBe(98);
    expect(res.subIndices.pm10).toBe(113);
    expect(res.aqi).toBe(113);
    expect(res.category).toBe('Moderate');

    // Multi-pollutant check: max of all supplied pollutants
    const multi = calculateCPCB_AQI(30, 45, 120, 20, 1.0, 40); // NO2 = 120 -> sub-index ~140 (Moderate)
    expect(multi.subIndices.no2).toBeGreaterThan(100);
    expect(multi.aqi).toBe(multi.subIndices.no2);
  });

  it('correctly calculates Delhi headline CPCB AQI as max(sub-indices) = 428 Severe', () => {
    const res = calculateCPCB_AQI(178.4, 288.0, 45.2, 14.8, 1.9, 28.5);
    expect(res.subIndices.pm2_5).toBe(428);
    expect(res.subIndices.pm10).toBe(338);
    expect(res.subIndices.no2).toBe(56);
    expect(res.aqi).toBe(428);
    expect(res.category).toBe('Severe');
    expect(res.dominantPollutant.name).toBe('PM2.5');
    expect(res.dominantPollutant.subIndex).toBe(428);

    const delhi = getCityPresetAQI('Delhi');
    expect(delhi.current.aqi).toBe(428);
    expect(delhi.current.category).toBe('Severe');
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
