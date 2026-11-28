import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetAQI, getCityPresetPlan, buildMandatoryCautions, STANDARD_DISCLAIMER } from '@/lib/presetPlan';
import { sanitizeCity } from '@/lib/sanitize';
import type { DailyPlan, HouseholdProfile, PlanActionItem, PlanTimelineItem } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface RawGeminiAction {
  action?: unknown;
  why?: unknown;
  reason?: unknown;
  effort?: unknown;
  cost?: unknown;
  sources?: unknown;
}

function normalizeActionItems(rawItems: unknown[], fallbackItems: PlanActionItem[]): PlanActionItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return fallbackItems;
  }
  const normalized = rawItems
    .map((entry, idx): PlanActionItem | null => {
      const obj = (typeof entry === 'object' && entry !== null ? entry : {}) as RawGeminiAction;
      const fb = fallbackItems[idx] ?? fallbackItems[0];
      const action = typeof obj.action === 'string' && obj.action.trim() ? obj.action.trim() : fb?.action ?? '';
      if (!action) return null;
      const why =
        typeof obj.why === 'string' && obj.why.trim()
          ? obj.why.trim()
          : typeof obj.reason === 'string' && obj.reason.trim()
            ? obj.reason.trim()
            : fb?.why ?? 'Lowers household exposure to ambient fine particulate peaks.';
      const effort = typeof obj.effort === 'string' && obj.effort.trim() ? obj.effort.trim().toLowerCase() : fb?.effort ?? 'low';
      const cost = typeof obj.cost === 'string' && obj.cost.trim() ? obj.cost.trim().toLowerCase() : fb?.cost ?? 'free';
      const sources =
        Array.isArray(obj.sources) && obj.sources.every((s) => typeof s === 'string') && obj.sources.length > 0
          ? (obj.sources as string[])
          : fb?.sources ?? ['kb/indoor_air_quality.md'];
      return {
        action,
        why,
        effort,
        cost,
        // Per-action impact figures ALWAYS stay deterministically grounded
        impact: fb?.impact ?? { exposure_reduction_pct: 15, confidence: 'Modelled estimate' },
        sources,
      };
    })
    .filter((item): item is PlanActionItem => item !== null);
  return normalized.length > 0 ? normalized : fallbackItems;
}

function normalizeTimeline(rawTimeline: unknown[], fallbackTimeline: PlanTimelineItem[]): PlanTimelineItem[] {
  if (!Array.isArray(rawTimeline) || rawTimeline.length === 0) {
    return fallbackTimeline;
  }
  const normalized = rawTimeline
    .map((entry, idx): PlanTimelineItem | null => {
      const obj = (typeof entry === 'object' && entry !== null ? entry : {}) as Record<string, unknown>;
      const fb = fallbackTimeline[idx] ?? fallbackTimeline[0];
      const time = typeof obj.time === 'string' && obj.time.trim() ? obj.time.trim() : fb?.time ?? '';
      const advice = typeof obj.advice === 'string' && obj.advice.trim() ? obj.advice.trim() : fb?.advice ?? '';
      return time && advice ? { time, advice } : null;
    })
    .filter((slot): slot is PlanTimelineItem => slot !== null);
  return normalized.length > 0 ? normalized : fallbackTimeline;
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
    "low_emission_routines": [{"action": str, "why": str, "effort": "low"|"medium"|"high", "cost": "free"|"low"|"moderate", "sources": [str]}],
    "indoor_air_hacks": [{"action": str, "why": str, "effort": "low"|"medium"|"high", "cost": "free"|"low"|"moderate", "sources": [str]}],
    "sustainable_alternatives": [{"action": str, "why": str, "effort": "low"|"medium"|"high", "cost": "free"|"low"|"moderate", "sources": [str]}]
  }
- today_timeline: [{"time": str, "advice": str}]
- cautions: [str]
- disclaimer: str
Do NOT invent impact numbers; keep 2 practical Indian city items per section.
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
                    low_emission_routines: normalizeActionItems(
                      parsed.sections.low_emission_routines,
                      baselinePlan.sections.low_emission_routines
                    ),
                    indoor_air_hacks: normalizeActionItems(
                      parsed.sections.indoor_air_hacks,
                      baselinePlan.sections.indoor_air_hacks
                    ),
                    sustainable_alternatives: normalizeActionItems(
                      parsed.sections.sustainable_alternatives ?? [],
                      baselinePlan.sections.sustainable_alternatives
                    ),
                  },
                  today_timeline: normalizeTimeline(parsed.today_timeline ?? [], baselinePlan.today_timeline),
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
