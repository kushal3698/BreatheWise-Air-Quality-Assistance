import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  fetchAQI,
  fetchDailyPlan,
  sendChatMessage,
  fetchSchoolGuidance,
  fetchCommunityLeaderboard,
  fetchCommunityChallenges,
} from '../lib/api';
import { generateLocalChatReply } from '../lib/chatEngine';
import { GET as getAQI } from '../app/api/aqi/route';
import { POST as postPlan } from '../app/api/plan/route';
import { POST as postChat } from '../app/api/chat/route';

const SAMPLE_HOUSEHOLD = {
  members: [{ id: '1', role: 'adult', age: 35, sensitivities: ['asthma'] }],
  transport: { mode: 'petrol_car', vehicles: 1, school_run_km: 4, commute_km: 15 },
  home: { type: 'apartment', floor: 4, has_purifier: true, cooking_fuel: 'LPG' },
  work_from_home_days: 2,
};

describe('Frontend API Client, Local Chat Engine, and Live Route Branches', () => {
  const originalFetch = globalThis.fetch;
  const originalDemoMode = process.env.DEMO_MODE;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    if (originalDemoMode === undefined) {
      delete process.env.DEMO_MODE;
    } else {
      process.env.DEMO_MODE = originalDemoMode;
    }
    delete process.env.GEMINI_API_KEY;
  });

  it('calls all client API methods cleanly on HTTP 200 and throws on failure', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    ) as typeof fetch;

    await expect(fetchAQI('Delhi')).resolves.toEqual({ ok: true });
    await expect(fetchDailyPlan('Delhi', 'en', SAMPLE_HOUSEHOLD)).resolves.toEqual({ ok: true });
    await expect(sendChatMessage('hello', 'Delhi', 'en', SAMPLE_HOUSEHOLD, [])).resolves.toEqual({ ok: true });
    await expect(fetchSchoolGuidance('Delhi')).resolves.toEqual({ ok: true });
    await expect(fetchCommunityLeaderboard()).resolves.toEqual({ ok: true });
    await expect(fetchCommunityChallenges()).resolves.toEqual({ ok: true });

    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response('err', { status: 500 }))
    ) as typeof fetch;
    await expect(fetchAQI('Delhi')).rejects.toThrow();
    await expect(fetchDailyPlan('Delhi', 'en')).rejects.toThrow();
    await expect(sendChatMessage('hi', 'Delhi', 'en')).rejects.toThrow();
    await expect(fetchSchoolGuidance('Delhi')).rejects.toThrow();
    await expect(fetchCommunityLeaderboard()).rejects.toThrow();
    await expect(fetchCommunityChallenges()).rejects.toThrow();
  });

  it('covers all chatEngine topic branches cleanly', () => {
    const childPlay = generateLocalChatReply('Should my child play outside at 4 pm?', 'Delhi', 'en', SAMPLE_HOUSEHOLD);
    expect(childPlay.reply).toContain('High Sensitivity Caution');

    const commute = generateLocalChatReply('Plan my metro commute in traffic', 'Delhi', 'en', SAMPLE_HOUSEHOLD);
    expect(commute.reply).toContain('Public Transit / Metro');

    const purifier = generateLocalChatReply('Should I buy a HEPA purifier or DIY Corsi?', 'Delhi', 'en');
    expect(purifier.reply).toContain('Corsi-Rosenthal');

    const multiDay = generateLocalChatReply('Give me a 3-day plan schedule', 'Delhi', 'en', SAMPLE_HOUSEHOLD);
    expect(multiDay.reply).toContain('Day 1');

    const fallback = generateLocalChatReply('What is the general air status today?', 'Delhi', 'en', SAMPLE_HOUSEHOLD);
    expect(fallback.reply).toContain('reliever inhalers');
  });

  it('GET /api/aqi fetches live 6-pollutant Open-Meteo hourly CPCB data when DEMO_MODE=false', async () => {
    process.env.DEMO_MODE = 'false';
    const mockAQPayload = {
      current: {
        pm2_5: 178.4,
        pm10: 288.0,
        nitrogen_dioxide: 45.2,
        sulphur_dioxide: 14.8,
        carbon_monoxide: 1900.0,
        ozone: 28.5,
      },
      hourly: {
        time: Array.from({ length: 24 }, (_, idx) => `2026-11-28T${String(idx).padStart(2, '0')}:00`),
        pm2_5: Array.from({ length: 24 }, (_, idx) => (idx >= 12 && idx <= 16 ? 70 : 180)),
        pm10: Array.from({ length: 24 }, () => 150),
        nitrogen_dioxide: Array.from({ length: 24 }, () => 35),
        sulphur_dioxide: Array.from({ length: 24 }, () => 10),
        carbon_monoxide: Array.from({ length: 24 }, () => 1200),
        ozone: Array.from({ length: 24 }, () => 30),
      },
    };
    const mockWeatherPayload = {
      current: { temperature_2m: 14.5, relative_humidity_2m: 68, wind_speed_10m: 5.2 },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(mockAQPayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockWeatherPayload), { status: 200 })) as typeof fetch;

    const req = new NextRequest('http://localhost:3000/api/aqi?city=Delhi');
    const res = await getAQI(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.current.aqi).toBe(345);
    expect(data.weather.temp_c).toBe(14.5);
    expect(data.forecast.length).toBe(12);
    expect(data.safe_windows[0].avg_aqi).toBeLessThan(345);
  });

  it('POST /api/plan and POST /api/chat invoke Gemini when configured, enforce deterministic impact/cautions, and handle fallback', async () => {
    process.env.DEMO_MODE = 'false';
    process.env.GEMINI_API_KEY = 'mock-gemini-key';

    const bogusLLMPlan = {
      summary: 'Live Gemini Summary',
      risk_level: 'very_poor',
      sections: {
        low_emission_routines: [],
        indoor_air_hacks: [],
        sustainable_alternatives: [],
      },
      today_timeline: [],
      impact_summary: { exposure_reduction_pct: 99, co2_avoided_kg_week: 999, cost_saved_inr_month: 999999, cigarettes_avoided_day: 99 },
      cautions: ['LLM extra tip'],
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(bogusLLMPlan) }] } }] }),
        { status: 200 }
      )
    ) as typeof fetch;

    const planReq = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: JSON.stringify({ city: 'Delhi', language: 'en', household: SAMPLE_HOUSEHOLD }),
    });
    const planRes = await postPlan(planReq);
    const plan = await planRes.json();
    expect(plan.summary).toBe('Live Gemini Summary');
    expect(plan.impact_summary.exposure_reduction_pct).not.toBe(99);
    expect(plan.cautions.some((c: string) => /inhalers/i.test(c))).toBe(true);
    expect(plan.cautions).toContain('LLM extra tip');

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Gemini chat advice' }] } }] }),
        { status: 200 }
      )
    ) as typeof fetch;

    const chatReq = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'mask?', city: 'Delhi', language: 'en', household: SAMPLE_HOUSEHOLD }),
    });
    const chatRes = await postChat(chatReq);
    const chatData = await chatRes.json();
    expect(chatData.reply).toBe('Gemini chat advice');

    // Graceful fallback when Gemini throws network error
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network down')) as typeof fetch;
    const chatFallbackRes = await postChat(
      new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'mask?', city: 'Delhi', language: 'en' }),
      })
    );
    expect(chatFallbackRes.status).toBe(200);
  });
});
