import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { NextRequest } from 'next/server';
import { GET as getAQI } from '../app/api/aqi/route';
import { POST as postPlan } from '../app/api/plan/route';
import { POST as postChat } from '../app/api/chat/route';
import { GET as getChallenges } from '../app/api/community/challenges/route';
import { GET as getLeaderboard } from '../app/api/community/leaderboard/route';
import { sanitizeChatMessage, sanitizeCity } from '../lib/sanitize';

describe('Serverless API Routes Verification', () => {
  it('GET /api/aqi returns calibrated CPCB telemetry for Delhi', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi?city=Delhi');
    const res = await getAQI(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.current.aqi).toBe(345);
    expect(data.current.category).toBe('Very Poor');
    expect(data.current.dominant_pollutant.name).toBe('PM2.5');
    expect(data.current.dominant_pollutant.sub_index).toBe(345);
    expect(data.forecast.length).toBe(12);
  });

  it('GET /api/aqi sanitizes malicious city query input', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi?city=%3Cscript%3Ealert(1)%3C/script%3E');
    const res = await getAQI(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.location.name).toBeTruthy();
    expect(data.location.name).not.toContain('<script>');
  });

  it('POST /api/plan returns structured 3-section daily mitigation plan', async () => {
    const body = {
      city: 'Delhi',
      household: {
        members: [{ id: '1', role: 'adult', age: 35, sensitivities: ['asthma'] }],
        transport: { mode: 'petrol_car', vehicles: 1, school_run_km: 4, commute_km: 15 },
        home: { type: 'apartment', floor: 4, has_purifier: false, cooking_fuel: 'LPG' },
        work_from_home_days: 2,
      },
    };

    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await postPlan(req);
    expect(res.status).toBe(200);

    const plan = await res.json();
    expect(plan.summary).toBeTruthy();
    expect(plan.sections.low_emission_routines.length).toBeGreaterThan(0);
    expect(plan.sections.indoor_air_hacks.length).toBeGreaterThan(0);
    expect(plan.sections.sustainable_alternatives.length).toBeGreaterThan(0);
    expect(plan.cautions.length).toBeGreaterThan(0);
    // Mandatory asthma caution
    expect(plan.cautions.some((c: string) => c.toLowerCase().includes('inhaler') || c.toLowerCase().includes('asthma'))).toBe(true);
  });

  it('POST /api/chat provides grounded multilingual replies with citations', async () => {
    const body = {
      message: 'When is the best time to exercise outdoors today?',
      city: 'Delhi',
      language: 'en',
    };

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await postChat(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reply).toBeTruthy();
    expect(data.grounded_sources.length).toBeGreaterThan(0);
    expect(data.disclaimer).toBeTruthy();
  });

  it('GET /api/community/challenges returns active community challenges', async () => {
    const res = await getChallenges();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(3);
    expect(data[0].title).toBeTruthy();
    expect(data[0].total_co2_saved_kg).toBeGreaterThan(0);
  });

  it('GET /api/community/leaderboard returns civic leaderboards', async () => {
    const res = await getLeaderboard();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(4);
    expect(data[0].neighbourhood).toBeTruthy();
    expect(data[0].co2_avoided_kg).toBeGreaterThan(0);
  });

  it('sanitizes city names while preserving Latin and Indic scripts', () => {
    expect(sanitizeCity('గుంటూరు')).toBe('గుంటూరు');
    expect(sanitizeCity('दिल्ली')).toBe('दिल्ली');
    expect(sanitizeCity('சென்னை')).toBe('சென்னை');
    expect(sanitizeCity('<script>alert(1)</script>')).not.toContain('<');
    expect(sanitizeCity('   ')).toBe('Delhi');
  });

  it('strips control characters and enforces 1000-char limit on chat messages', () => {
    expect(sanitizeChatMessage('Hello\x00World\x07!')).toBe('HelloWorld!');
    expect(sanitizeChatMessage('a'.repeat(1500)).length).toBe(1000);
  });

  it('next.config.js only enables FastAPI proxy rewrites when INTERNAL_API_URL is set', async () => {
    const prev = process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_URL;
    const requireCjs = createRequire(import.meta.url);
    const nextConfig = requireCjs('../../next.config.js');
    expect(await nextConfig.rewrites()).toEqual([]);
    process.env.INTERNAL_API_URL = 'http://backend:8000';
    const withProxy = await nextConfig.rewrites();
    expect(withProxy[0].destination).toBe('http://backend:8000/api/:path*');
    if (prev === undefined) delete process.env.INTERNAL_API_URL;
    else process.env.INTERNAL_API_URL = prev;
  });
});
