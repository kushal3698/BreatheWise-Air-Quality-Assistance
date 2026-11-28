import type { AirQualityData, DailyPlan, HouseholdProfile } from './api';
import { calculateCPCB_AQI } from './cpcb';
import { CITY_PRESETS, METRO_CITIES } from './cities';
import { calculateOverallImpact } from './impactSimulator';

export const STANDARD_DISCLAIMER =
  'Estimates for awareness only. BreatheWise is a decision-support tool, not a medical device. For breathing difficulty, chest pain, or acute symptoms, consult a qualified physician immediately.';

export function getCityPresetAQI(cityName: string): AirQualityData {
  const key = cityName.toLowerCase().trim();
  let baseData: AirQualityData | null = null;

  const direct = CITY_PRESETS[key];
  if (direct) {
    baseData = JSON.parse(JSON.stringify(direct)) as AirQualityData;
  } else {
    for (const k of Object.keys(CITY_PRESETS)) {
      if (key.includes(k) || k.includes(key)) {
        baseData = JSON.parse(JSON.stringify(CITY_PRESETS[k])) as AirQualityData;
        break;
      }
    }
  }

  if (baseData) {
    const cpcb = calculateCPCB_AQI(
      baseData.current.pm2_5,
      baseData.current.pm10,
      baseData.current.no2,
      baseData.current.so2,
      baseData.current.co,
      baseData.current.o3
    );
    baseData.current.aqi = cpcb.aqi;
    baseData.current.category = cpcb.category;
    baseData.current.cpcb_color = cpcb.color;
    baseData.current.dominant_pollutant = {
      name: cpcb.dominantPollutant.name,
      sub_index: cpcb.dominantPollutant.subIndex,
    };
    return baseData;
  }

  const cleanName = cityName.trim();
  const titleCaseName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const seed = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const rawPm25 = Math.round((28.0 + (seed % 95)) * 10) / 10;
  const rawPm10 = Math.round(rawPm25 * 1.82 * 10) / 10;
  const rawNo2 = Math.round((24.0 + (seed % 18)) * 10) / 10;
  const rawSo2 = Math.round((7.0 + (seed % 8)) * 10) / 10;
  const rawCo = 0.9;
  const rawO3 = 26.0;

  const cpcb = calculateCPCB_AQI(rawPm25, rawPm10, rawNo2, rawSo2, rawCo, rawO3);
  const baseAQI = cpcb.aqi;
  const dip = Math.round(baseAQI * 0.72);
  const dipCat = dip <= 50 ? 'Good' : dip <= 100 ? 'Satisfactory' : dip <= 200 ? 'Moderate' : 'Poor';

  const hours = [
    ['00:00', 0.94], ['02:00', 0.98], ['04:00', 1.06], ['06:00', 1.16],
    ['08:00', 1.28], ['10:00', 1.05], ['12:00', 0.88], ['14:00', 0.72],
    ['16:00', 0.82], ['18:00', 1.04], ['20:00', 1.18], ['22:00', 1.02],
  ] as const;

  const forecast = hours.map(([hour, factor]) => ({
    hour,
    aqi: Math.round(baseAQI * factor),
    pm2_5: Math.round(rawPm25 * factor),
  }));

  return {
    location: {
      name: titleCaseName,
      state: 'India',
      country: 'India',
      lat: 18.0 + (seed % 120) / 10.0,
      lon: 74.0 + (seed % 120) / 10.0,
    },
    station: { name: 'Regional Airshed Model', distance_km: 0 },
    current: {
      aqi: baseAQI,
      category: cpcb.category,
      cpcb_color: cpcb.color,
      pm2_5: rawPm25,
      pm10: rawPm10,
      no2: rawNo2,
      so2: rawSo2,
      co: rawCo,
      o3: rawO3,
      dominant_pollutant: {
        name: cpcb.dominantPollutant.name,
        sub_index: cpcb.dominantPollutant.subIndex,
      },
    },
    weather: {
      temp_c: 21 + (seed % 10),
      humidity: 52 + (seed % 26),
      wind_kmh: 7.0 + (seed % 8),
      wind_direction: 'NW',
      conditions: baseAQI > 200 ? 'Winter Inversion / Smog' : 'Partly Sunny / Breeze',
    },
    forecast,
    safe_windows: [
      {
        start: '13:00',
        end: '16:30',
        avg_aqi: dip,
        category: dipCat,
        guidance: `Lowest forecast AQI today (~${dip}) during peak afternoon thermal mixing.`,
      },
    ],
    source: 'demo_fallback',
    fetched_at: new Date().toISOString(),
    is_stale: false,
  };
}

export function buildMandatoryCautions(
  aqiVal: number,
  cityName: string,
  peakMorning: number,
  hasAsthma: boolean
): string[] {
  const cautions: string[] = [];
  if (hasAsthma) {
    cautions.push(
      `One or more household members have respiratory sensitivities (asthma/COPD): Keep prescribed fast-acting reliever inhalers within immediate reach. Limit vigorous morning cardio during the peak (AQI ~${peakMorning}).`
    );
  }
  if (aqiVal > 400) {
    cautions.push(`CRITICAL: Severe smog episode in ${cityName}. Suspend all outdoor activity.`);
  } else if (aqiVal > 300) {
    cautions.push(`Very Poor air today in ${cityName}. Keep doors and windows closed during peak smog.`);
  } else if (aqiVal > 200) {
    cautions.push(`Poor air quality in ${cityName}: Strenuous outdoor cardio is not recommended; wear a fitted N95 mask outdoors.`);
  }
  return cautions;
}

export function getCityPresetPlan(cityName: string, household?: HouseholdProfile): DailyPlan {
  const aqi = getCityPresetAQI(cityName);
  const val = aqi.current.aqi;
  const name = aqi.location.name;
  const pm25 = aqi.current.pm2_5;

  const hasAsthma =
    household?.members?.some((m) =>
      m.sensitivities?.some((s) => /asthma|copd|respiratory/i.test(s))
    ) ?? false;
  const hasPurifier = household?.home?.has_purifier ?? false;
  const isMetro =
    METRO_CITIES.has(cityName.toLowerCase().trim()) || METRO_CITIES.has(name.toLowerCase().trim());

  const safeWin = aqi.safe_windows[0] ?? null;
  const safeStart = safeWin ? safeWin.start : '13:00';
  const safeEnd = safeWin ? safeWin.end : '16:30';
  const safeAqi = safeWin ? safeWin.avg_aqi : Math.round(val * 0.72);
  const safeWindowStr = `${safeStart} – ${safeEnd}`;

  const peakMorning = aqi.forecast.find((f) => f.hour === '08:00')?.aqi ?? Math.round(val * 1.28);
  const peakEvening = aqi.forecast.find((f) => f.hour === '20:00')?.aqi ?? Math.round(val * 1.18);

  let summary = '';
  if (hasAsthma) {
    summary = `Air in ${name} is ${aqi.current.category} (AQI ${val}), peaking at ~${peakMorning} during morning rush hours. Asthma caution: keep intense cardio indoors and schedule outdoor recreation during the afternoon safe window (${safeWindowStr}).`;
  } else if (val > 250) {
    summary = `Elevated ${aqi.current.category} smog today in ${name} (AQI ${val}). Ground inversion traps morning emissions (~${peakMorning}); shift cardio indoors and use the afternoon safe window (${safeWindowStr}).`;
  } else if (val > 100) {
    summary = `Moderate air quality in ${name} (AQI ${val}) with morning peak ~${peakMorning}. Keep intense cardio indoors and schedule outdoor recreation during the afternoon safe window (${safeWindowStr}).`;
  } else {
    summary = `Satisfactory air quality in ${name} (AQI ${val}). Favorable conditions across most hours; optimal outdoor window is ${safeWindowStr} during peak thermal dispersion.`;
  }

  const morningAdvice =
    peakMorning > 200
      ? `Severe morning peak (AQI ~${peakMorning}). Ground inversion traps traffic exhaust; keep all exercise indoors.`
      : peakMorning > 100
        ? `Morning peak (AQI up to ~${peakMorning}): keep intense cardio indoors and reschedule morning walks.`
        : `Mild morning peak (AQI ~${peakMorning}). Light morning walks acceptable; sensitive groups monitor symptoms.`;

  const eveningAdvice =
    peakEvening > 150
      ? `Evening peak (AQI rises to ~${peakEvening}). Nocturnal cooling traps rush-hour particulate. Seal living spaces.`
      : peakEvening > 100
        ? `Moderate evening peak (AQI ~${peakEvening}). Keep windows closed along busy roads; asthma members stay indoors.`
        : `Pleasant evening hours (AQI ~${peakEvening}). Safe for normal evening routines.`;

  const commuteAction = isMetro
    ? 'Shift peak commute (8–10 AM) to Metro or carpool'
    : 'Shift peak commute (8–10 AM) to public bus, shared transit, or carpool';

  const purifierAction = hasPurifier
    ? 'Run bedroom HEPA air purifier on medium/high during morning and evening peaks'
    : 'Set up a HEPA purifier or assemble a DIY Corsi-Rosenthal filter box fan';
  const purifierWhy = hasPurifier
    ? 'Filters >75% of fine particulate from indoor air during peak ambient inversion hours.'
    : 'A DIY Corsi-Rosenthal box (4x MERV-13 filters + box fan) achieves 350+ CFM CADR at ~₹3,500 INR, cutting indoor PM2.5 by over 70%.';

  return {
    summary,
    risk_level: aqi.current.category.toLowerCase().replace(' ', '_'),
    sections: {
      low_emission_routines: [
        {
          action: `Schedule outdoor cardio during the afternoon safe window (${safeWindowStr})`,
          why: `Between 06:00 and 09:30 AM, AQI peaks at ~${peakMorning}. Deep breathing during morning cardio increases fine particle alveolar intake.`,
          effort: 'low',
          cost: 'free',
          impact: { exposure_reduction_pct: val > 200 ? 55 : 30, confidence: 'Modelled estimate' },
          sources: ['kb/exercise_and_aqi.md'],
        },
        {
          action: commuteAction,
          why: 'Avoids concentrated tailpipe exhaust in traffic congestion and cuts personal transport emissions by ~70%.',
          effort: 'medium',
          cost: 'free',
          impact: { exposure_reduction_pct: 35, co2_saved_kg: 2.3, cost_saved_inr: 110, confidence: 'Modelled estimate' },
          sources: ['kb/sustainable_transport.md'],
        },
      ],
      indoor_air_hacks: [
        {
          action: `Keep windows shut during morning peak; cross-ventilate during ${safeWindowStr}`,
          why: `Afternoon solar convection breaks the inversion layer, dropping PM2.5 to the daily low (~${safeAqi}).`,
          effort: 'low',
          cost: 'free',
          impact: { exposure_reduction_pct: 35, confidence: 'Modelled estimate' },
          sources: ['kb/indoor_air_quality.md'],
        },
        {
          action: purifierAction,
          why: purifierWhy,
          effort: 'medium',
          cost: hasPurifier ? 'free' : 'low',
          impact: { exposure_reduction_pct: 70, confidence: 'Modelled estimate' },
          sources: ['kb/indoor_air_quality.md'],
        },
        {
          action: 'Run kitchen exhaust for all cooking and avoid burning incense (agarbatti)',
          why: 'Cooking fumes and burning incense raise indoor PM2.5 above 400 µg/m³ in enclosed living spaces.',
          effort: 'low',
          cost: 'free',
          impact: { exposure_reduction_pct: 25, confidence: 'Modelled estimate' },
          sources: ['kb/clean_cooking_and_heating.md'],
        },
      ],
      sustainable_alternatives: [
        {
          action: `Batch grocery and errand trips across ${name} during the safe window`,
          why: 'Consolidating trips into 1 outing avoids cold engine starts and cuts local trip emissions by 60–70%.',
          effort: 'low',
          cost: 'free',
          impact: { exposure_reduction_pct: 15, co2_saved_kg: 2.1, cost_saved_inr: 120, confidence: 'Modelled estimate' },
          sources: ['kb/sustainable_transport.md'],
        },
        {
          action: 'Pool school runs or enroll in neighborhood school bus',
          why: 'Reduces localized tailpipe emissions right at school gates where children assemble.',
          effort: 'medium',
          cost: 'free',
          impact: { exposure_reduction_pct: 20, co2_saved_kg: 1.8, cost_saved_inr: 45, confidence: 'Modelled estimate' },
          sources: ['kb/school_and_community.md'],
        },
      ],
    },
    today_timeline: [
      { time: '06:00 - 09:30', advice: morningAdvice },
      { time: '09:30 - 13:00', advice: 'Commute window: keep car AC on recirculation mode and seal roadside windows.' },
      {
        time: safeWindowStr,
        advice: `Optimal safe window today (AQI drops to ~${safeAqi}). Afternoon solar convection disperses surface pollutants. Best window for outdoor errands, exercise, and home ventilation.`,
      },
      { time: '18:00 - 22:00', advice: eveningAdvice },
    ],
    impact_summary: calculateOverallImpact(pm25, household),
    cautions: buildMandatoryCautions(val, name, peakMorning, hasAsthma),
    disclaimer: STANDARD_DISCLAIMER,
  };
}

export const DEFAULT_PLAN_DATA: DailyPlan = getCityPresetPlan('Delhi');
