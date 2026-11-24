import { describe, it, expect } from 'vitest';
import { calculateCPCB_AQI } from '../lib/initialData';
import { getAQIBand } from '../components/RiskMeter';

describe('CPCB National Air Quality Index (NAQI) Breakpoint Engine', () => {
  it('correctly maps Good band (0-50)', () => {
    const res = calculateCPCB_AQI(15.0, 30.0);
    expect(res.aqi).toBeLessThanOrEqual(50);
    expect(res.category).toBe('Good');
  });

  it('correctly maps Satisfactory band (51-100)', () => {
    const res = calculateCPCB_AQI(45.0, 75.0);
    expect(res.aqi).toBeGreaterThanOrEqual(51);
    expect(res.aqi).toBeLessThanOrEqual(100);
    expect(res.category).toBe('Satisfactory');
  });

  it('correctly maps Moderate band (101-200) with official integer rounding (PM10 118.3 gives 112, PM2.5 60.1 gives 100)', () => {
    // PM2.5 = 60.1 -> 100 after integer rounding, PM10 = 118.3 -> 112 => AQI = 112 Moderate
    const res = calculateCPCB_AQI(60.1, 118.3);
    expect(res.subIndices.pm2_5).toBe(100);
    expect(res.subIndices.pm10).toBe(112);
    expect(res.aqi).toBe(112);
    expect(res.category).toBe('Moderate');
    expect(res.dominantPollutant.name).toBe('PM10');
  });

  it('correctly maps Poor band (201-300)', () => {
    const res = calculateCPCB_AQI(105.0, 220.0);
    expect(res.aqi).toBeGreaterThanOrEqual(201);
    expect(res.aqi).toBeLessThanOrEqual(300);
    expect(res.category).toBe('Poor');
  });

  it('correctly maps Very Poor band (301-400)', () => {
    const res = calculateCPCB_AQI(135.0, 320.0);
    expect(res.aqi).toBeGreaterThanOrEqual(301);
    expect(res.aqi).toBeLessThanOrEqual(400);
    expect(res.category).toBe('Very Poor');
  });

  it('correctly maps Very Poor band (301-400) and Delhi real-world coordinates', () => {
    // Delhi real telemetry: PM2.5 = 178.4 -> 345, PM10 = 288 -> 238, NO2 = 45.2 -> 56
    const res = calculateCPCB_AQI(178.4, 288.0, 45.2);
    expect(res.subIndices.pm2_5).toBe(345);
    expect(res.subIndices.pm10).toBe(238);
    expect(res.subIndices.no2).toBe(56);
    expect(res.aqi).toBe(345);
    expect(res.category).toBe('Very Poor');
    expect(res.dominantPollutant.name).toBe('PM2.5');
    expect(res.dominantPollutant.subIndex).toBe(345);
  });

  it('correctly maps Severe band (401-500) for extreme winter smog episodes', () => {
    // PM2.5 = 280.0 in [250.1, 380] -> 401 + (99/129.9)*(280-250.1) ≈ 424
    const res = calculateCPCB_AQI(280.0, 450.0);
    expect(res.aqi).toBeGreaterThanOrEqual(401);
    expect(res.category).toBe('Severe');
  });

  it('handles upper concentration bounds gracefully with 500 ceiling', () => {
    const res = calculateCPCB_AQI(650.0, 850.0);
    expect(res.aqi).toBe(500);
    expect(res.category).toBe('Severe');
  });

  it('synchronizes getAQIBand outputs for badge, color, and bar highlighting', () => {
    const band345 = getAQIBand(345);
    expect(band345.name).toBe('Very Poor');
    expect(band345.color).toBe('#e74c3c');
    expect(band345.badgeClass).toContain('bg-red-50');

    const band285 = getAQIBand(285);
    expect(band285.name).toBe('Poor');
    expect(band285.color).toBe('#e67e22');
    expect(band285.badgeClass).toContain('bg-orange-50');
  });
});
