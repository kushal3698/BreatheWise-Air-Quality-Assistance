import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetAQI, getCityPresetPlan, buildMandatoryCautions, STANDARD_DISCLAIMER } from '@/lib/presetPlan';
import { sanitizeCity } from '@/lib/sanitize';
import type { DailyPlan, HouseholdProfile } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { city?: unknown; language?: unknown; household?: HouseholdProfile };
    const city = sanitizeCity(body?.city);
    const rawLang = typeof body?.language === 'string' ? body.language : 'en';
    const language = ['en', 'hi', 'te', 'ta'].includes(rawLang) ? rawLang : 'en';
    const household = body?.household;

    const baselinePlan = getCityPresetPlan(city, household);
    const aqi = getCityPresetAQI(city);
    const hasAsthma =
      household?.members?.some((m) =>
        m.sensitivities?.some((s) => /asthma|copd|respiratory/i.test(s))
      ) ?? false;

    const apiKey = process.env.GEMINI_API_KEY;
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const demoMode = process.env.DEMO_MODE === 'true';

    if (!demoMode && apiKey && apiKey !== 'demo') {
      const candidateModels = Array.from(
        new Set([primaryModel, 'gemini-3.5-flash-lite', 'gemini-3.8-flash'])
      );
      const prompt = `You are BreatheWise, a non-medical urban air quality planner.
Respond ONLY with valid JSON matching:
- summary: string
- risk_level: "good" | "moderate" | "poor" | "very_poor" | "severe"
- sections: {
    "low_emission_routines": [{"action": str, "reason": str, "impact_tag": str}],
    "indoor_air_hacks": [{"action": str, "reason": str, "impact_tag": str}],
    "sustainable_alternatives": [{"action": str, "reason": str, "impact_tag": str}]
  }
- today_timeline: [{"time": str, "window": str, "advice": str}]
- cautions: [str]
- disclaimer: str
Do NOT invent impact numbers; keep 2-3 practical Indian city items per section.
City: ${city}
Language: ${language}
AQI Current: ${JSON.stringify(aqi.current)}
Safe Windows: ${JSON.stringify(aqi.safe_windows)}
Household: ${JSON.stringify(household || {})}`;

      for (const candidateModel of candidateModels) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 16000);
        try {
          const generationConfig: Record<string, unknown> = {
            responseMimeType: 'application/json',
            temperature: 0.3,
          };
          if (candidateModel.includes('3.5-flash') && !candidateModel.includes('lite')) {
            generationConfig.thinkingConfig = { thinkingBudget: 128 };
          }
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig,
              }),
              signal: controller.signal,
            }
          );
          if (geminiRes.ok) {
            const geminiData = (await geminiRes.json()) as {
              candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
            };
            const parts = geminiData.candidates?.[0]?.content?.parts ?? [];
            const rawText = parts
              .filter((p) => !p.thought && typeof p.text === 'string')
              .map((p) => p.text)
              .join('')
              .trim();
            if (rawText) {
              const parsed = JSON.parse(rawText) as Partial<DailyPlan>;
              const validSections =
                Array.isArray(parsed.sections?.low_emission_routines) &&
                Array.isArray(parsed.sections?.indoor_air_hacks);
              if (parsed.summary && validSections && parsed.sections) {
                const mandatory = buildMandatoryCautions(aqi.current.aqi, city, aqi.current.aqi, hasAsthma);
                const mergedCautions = [...mandatory];
                for (const item of parsed.cautions ?? []) {
                  if (typeof item === 'string' && !mergedCautions.includes(item)) mergedCautions.push(item);
                }
                return NextResponse.json({
                  summary: parsed.summary,
                  risk_level: parsed.risk_level ?? baselinePlan.risk_level,
                  sections: {
                    low_emission_routines:
                      parsed.sections.low_emission_routines.length > 0
                        ? parsed.sections.low_emission_routines
                        : baselinePlan.sections.low_emission_routines,
                    indoor_air_hacks:
                      parsed.sections.indoor_air_hacks.length > 0
                        ? parsed.sections.indoor_air_hacks
                        : baselinePlan.sections.indoor_air_hacks,
                    sustainable_alternatives:
                      Array.isArray(parsed.sections.sustainable_alternatives) &&
                      parsed.sections.sustainable_alternatives.length > 0
                        ? parsed.sections.sustainable_alternatives
                        : baselinePlan.sections.sustainable_alternatives,
                  },
                  today_timeline:
                    Array.isArray(parsed.today_timeline) && parsed.today_timeline.length > 0
                      ? parsed.today_timeline
                      : baselinePlan.today_timeline,
                  // Deterministic engine figures ALWAYS override LLM estimates
                  impact_summary: baselinePlan.impact_summary,
                  cautions: mergedCautions,
                  disclaimer: parsed.disclaimer || STANDARD_DISCLAIMER,
                });
              }
            }
          }
          if (![429, 404, 503].includes(geminiRes.status)) {
            break;
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            break;
          }
        } finally {
          clearTimeout(timer);
        }
      }
    }

    return NextResponse.json(baselinePlan);
  } catch {
    return NextResponse.json(getCityPresetPlan('Delhi'));
  }
}
