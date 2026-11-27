import { AirQualityData, DailyPlan, HouseholdProfile } from './api';
import { calculateCPCB_AQI } from './cpcb';
import { CITY_PRESETS, METRO_CITIES } from './cities';

export function getCityPresetAQI(cityName: string): AirQualityData {
  const key = cityName.toLowerCase().trim();
  let baseData: AirQualityData | null = null;
  
  if (CITY_PRESETS[key]) {
    baseData = JSON.parse(JSON.stringify(CITY_PRESETS[key]));
  } else {
    for (const k in CITY_PRESETS) {
      if (key.includes(k) || k.includes(key)) {
        baseData = JSON.parse(JSON.stringify(CITY_PRESETS[k]));
        break;
      }
    }
  }

  if (baseData) {
    // Dynamic single source of truth: recalculate CPCB AQI strictly from pollutant sub-indices
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
      sub_index: cpcb.dominantPollutant.subIndex
    };
    return baseData;
  }

  // ⚡ Instant dynamic procedural generator for ANY unknown city
  const cleanName = cityName.trim();
  const titleCaseName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const seed = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Deterministic raw concentrations
  const rawPm25 = Math.round((28.0 + (seed % 95)) * 10) / 10;
  const rawPm10 = Math.round((rawPm25 * 1.82) * 10) / 10;
  const rawNo2 = Math.round((24.0 + (seed % 18)) * 10) / 10;
  const rawSo2 = Math.round((7.0 + (seed % 8)) * 10) / 10;
  const rawCo = 0.9;
  const rawO3 = 26.0;
  
  // Strictly compute CPCB AQI across all monitored pollutants from official breakpoints
  const cpcb = calculateCPCB_AQI(rawPm25, rawPm10, rawNo2, rawSo2, rawCo, rawO3);
  const baseAQI = cpcb.aqi;
  const cat = cpcb.category;
  const col = cpcb.color;

  const peakMorningAqi = Math.round(baseAQI * 1.28);
  const peakEveningAqi = Math.round(baseAQI * 1.18);
  const dip = Math.round(baseAQI * 0.72);
  const dipCat = dip <= 50 ? "Good" : dip <= 100 ? "Satisfactory" : dip <= 200 ? "Moderate" : "Poor";

  // Strictly even 2-hour intervals across the 24h cycle
  const forecast = [
    { hour: "00:00", aqi: Math.round(baseAQI * 0.94), pm2_5: Math.round(rawPm25 * 0.94) },
    { hour: "02:00", aqi: Math.round(baseAQI * 0.98), pm2_5: Math.round(rawPm25 * 0.98) },
    { hour: "04:00", aqi: Math.round(baseAQI * 1.06), pm2_5: Math.round(rawPm25 * 1.06) },
    { hour: "06:00", aqi: Math.round(baseAQI * 1.16), pm2_5: Math.round(rawPm25 * 1.16) },
    { hour: "08:00", aqi: peakMorningAqi, pm2_5: Math.round(rawPm25 * 1.28) },
    { hour: "10:00", aqi: Math.round(baseAQI * 1.05), pm2_5: Math.round(rawPm25 * 1.05) },
    { hour: "12:00", aqi: Math.round(baseAQI * 0.88), pm2_5: Math.round(rawPm25 * 0.88) },
    { hour: "14:00", aqi: dip, pm2_5: Math.round(rawPm25 * 0.72) },
    { hour: "16:00", aqi: Math.round(baseAQI * 0.82), pm2_5: Math.round(rawPm25 * 0.82) },
    { hour: "18:00", aqi: Math.round(baseAQI * 1.04), pm2_5: Math.round(rawPm25 * 1.04) },
    { hour: "20:00", aqi: peakEveningAqi, pm2_5: Math.round(rawPm25 * 1.18) },
    { hour: "22:00", aqi: Math.round(baseAQI * 1.02), pm2_5: Math.round(rawPm25 * 1.02) }
  ];

  return {
    location: {
      name: titleCaseName,
      state: "India",
      country: "India",
      lat: 18.0 + (seed % 120) / 10.0,
      lon: 74.0 + (seed % 120) / 10.0
    },
    station: {
      name: "Regional Airshed Model",
      distance_km: 0
    },
    current: {
      aqi: baseAQI,
      category: cat,
      cpcb_color: col,
      pm2_5: rawPm25,
      pm10: rawPm10,
      no2: rawNo2,
      so2: rawSo2,
      co: rawCo,
      o3: rawO3,
      dominant_pollutant: {
        name: cpcb.dominantPollutant.name,
        sub_index: cpcb.dominantPollutant.subIndex
      }
    },
    weather: {
      temp_c: 21 + (seed % 10),
      humidity: 52 + (seed % 26),
      wind_kmh: 7.0 + (seed % 8),
      wind_direction: "NW",
      conditions: baseAQI > 200 ? "Winter Inversion / Smog" : "Partly Sunny / Breeze"
    },
    forecast,
    safe_windows: [
      {
        start: "13:00",
        end: "16:30",
        avg_aqi: dip,
        category: dipCat,
        guidance: `Lowest forecast AQI today (~${dip}) during peak afternoon thermal mixing.`
      }
    ],
    source: "demo_fallback",
    fetched_at: new Date().toISOString(),
    is_stale: false
  };
}



export function getCityPresetPlan(cityName: string, household?: HouseholdProfile): DailyPlan {
  const aqi = getCityPresetAQI(cityName);
  const val = aqi.current.aqi;
  const name = aqi.location.name;
  const pm25 = aqi.current.pm2_5;

  const hasAsthma = household?.members?.some(m => 
    m.sensitivities?.some(s => s.toLowerCase().includes('asthma') || s.toLowerCase().includes('copd') || s.toLowerCase().includes('respiratory'))
  ) ?? false;
  const hasPurifier = household?.home?.has_purifier ?? false;
  const isMetro = METRO_CITIES.has(cityName.toLowerCase().trim()) || METRO_CITIES.has(name.toLowerCase().trim());

  const safeWin = aqi.safe_windows && aqi.safe_windows.length > 0 ? aqi.safe_windows[0] : null;
  const safeStart = safeWin ? safeWin.start : "13:00";
  const safeEnd = safeWin ? safeWin.end : "16:30";
  const safeAqi = safeWin ? safeWin.avg_aqi : Math.round(val * 0.72);
  const safeWindowStr = `${safeStart} – ${safeEnd}`;

  // Forecast peaks
  const peakMorning = aqi.forecast.find(f => f.hour === "08:00")?.aqi || Math.round(val * 1.28);
  const peakEvening = aqi.forecast.find(f => f.hour === "20:00")?.aqi || Math.round(val * 1.18);

  // Derive headline
  let summary = "";
  if (hasAsthma) {
    summary = `Air in ${name} is ${aqi.current.category} (AQI ${val}), peaking at ~${peakMorning} during morning rush hours. Asthma caution: keep intense cardio indoors and schedule outdoor recreation during the afternoon safe window (${safeWindowStr}).`;
  } else if (val > 250) {
    summary = `Elevated ${aqi.current.category} smog today in ${name} (AQI ${val}). Ground inversion traps morning emissions (~${peakMorning}); shift cardio indoors and use the afternoon safe window (${safeWindowStr}).`;
  } else if (val > 100) {
    summary = `Moderate air quality in ${name} (AQI ${val}) with morning peak ~${peakMorning}. Keep intense cardio indoors and schedule outdoor recreation during the afternoon safe window (${safeWindowStr}).`;
  } else {
    summary = `Satisfactory air quality in ${name} (AQI ${val}). Favorable conditions across most hours; optimal outdoor window is ${safeWindowStr} during peak thermal dispersion.`;
  }

  // Derive schedule timeline from the same forecast data
  const morningAdvice = peakMorning > 200
    ? `Severe morning peak (AQI ~${peakMorning}). Ground inversion traps traffic exhaust; keep all exercise indoors.`
    : peakMorning > 100
    ? `Morning peak (AQI up to ~${peakMorning}): keep intense cardio indoors and reschedule morning walks.`
    : `Mild morning peak (AQI ~${peakMorning}). Light morning walks acceptable; sensitive groups monitor symptoms.`;

  const eveningAdvice = peakEvening > 150
    ? `Evening peak (AQI rises to ~${peakEvening}). Nocturnal cooling traps rush-hour particulate. Seal living spaces.`
    : peakEvening > 100
    ? `Moderate evening peak (AQI ~${peakEvening}). Keep windows closed along busy roads; asthma members stay indoors.`
    : `Pleasant evening hours (AQI ~${peakEvening}). Safe for normal evening routines.`;

  const today_timeline = [
    { time: "06:00 - 09:30", advice: morningAdvice },
    { time: "09:30 - 13:00", advice: "Commute window: keep car AC on recirculation mode and seal roadside windows." },
    { time: safeWindowStr, advice: `Optimal safe window today (AQI drops to ~${safeAqi}). Afternoon solar convection disperses surface pollutants. Best window for outdoor errands, exercise, and home ventilation.` },
    { time: "18:00 - 22:00", advice: eveningAdvice }
  ];

  // Derive low emission routines
  const commuteAction = isMetro
    ? "Shift peak commute (8–10 AM) to Metro or carpool"
    : "Shift peak commute (8–10 AM) to public bus, shared transit, or carpool";

  const low_emission_routines = [
    {
      action: `Schedule outdoor exercise during the afternoon safe window (${safeWindowStr})`,
      why: `Between 06:00 and 09:30 AM, AQI peaks at ~${peakMorning}. Deep breathing during morning cardio increases fine particle alveolar intake.`,
      effort: "low",
      cost: "free",
      impact: { exposure_reduction_pct: val > 200 ? 55 : 30, confidence: "Modelled estimate" },
      sources: ["kb/exercise_and_aqi.md"]
    },
    {
      action: commuteAction,
      why: "Avoids concentrated tailpipe exhaust in traffic congestion and cuts personal transport emissions by ~70%.",
      effort: "medium",
      cost: "free",
      impact: { exposure_reduction_pct: 35, co2_saved_kg: 2.3, cost_saved_inr: 110, confidence: "Modelled estimate" },
      sources: ["kb/sustainable_transport.md"]
    }
  ];

  // Derive indoor air hacks (NEVER EMPTY!)
  const purifierAction = hasPurifier
    ? "Run bedroom HEPA air purifier on medium/high during morning and evening peaks"
    : "Set up a HEPA purifier or assemble a DIY Corsi-Rosenthal filter box fan";
  const purifierWhy = hasPurifier
    ? "Filters >75% of fine particulate from indoor air during peak ambient inversion hours."
    : "A DIY Corsi-Rosenthal box (4x MERV-13 filters + box fan) achieves 350+ CFM CADR at ~₹3,500 INR, cutting indoor PM2.5 by over 70%.";

  const indoor_air_hacks = [
    {
      action: `Keep windows shut during morning peak; cross-ventilate during ${safeWindowStr}`,
      why: `Afternoon solar convection breaks the inversion layer, dropping PM2.5 to the daily low (~${safeAqi}).`,
      effort: "low",
      cost: "free",
      impact: { exposure_reduction_pct: 35, confidence: "Modelled estimate" },
      sources: ["kb/indoor_air_quality.md"]
    },
    {
      action: purifierAction,
      why: purifierWhy,
      effort: "medium",
      cost: hasPurifier ? "free" : "low",
      impact: { exposure_reduction_pct: 70, confidence: "Modelled estimate" },
      sources: ["kb/indoor_air_quality.md"]
    },
    {
      action: "Run kitchen exhaust for all cooking and avoid burning incense (agarbatti)",
      why: "Cooking fumes and burning incense raise indoor PM2.5 above 400 µg/m³ in enclosed living spaces.",
      effort: "low",
      cost: "free",
      impact: { exposure_reduction_pct: 25, confidence: "Modelled estimate" },
      sources: ["kb/clean_cooking_and_heating.md"]
    }
  ];

  // Sustainable alternatives
  const sustainable_alternatives = [
    {
      action: `Batch grocery and errand trips across ${name} during the safe window`,
      why: "Consolidating trips into 1 outing avoids cold engine starts and cuts local trip emissions by 60–70%.",
      effort: "low",
      cost: "free",
      impact: { exposure_reduction_pct: 15, co2_saved_kg: 2.1, cost_saved_inr: 120, confidence: "Modelled estimate" },
      sources: ["kb/sustainable_transport.md"]
    },
    {
      action: "Pool school runs or enroll in neighborhood school bus",
      why: "Reduces localized tailpipe emissions right at school gates where children assemble.",
      effort: "medium",
      cost: "free",
      impact: { exposure_reduction_pct: 20, co2_saved_kg: 1.8, cost_saved_inr: 45, confidence: "Modelled estimate" },
      sources: ["kb/school_and_community.md"]
    }
  ];

  // Cautions (always includes asthma if present!)
  const cautions: string[] = [];
  if (hasAsthma) {
    cautions.push(`⚠️ Respiratory Sensitivity Alert (Asthma/COPD in household): Keep fast-acting reliever inhalers easily accessible. Limit vigorous morning cardio during the morning peak (AQI ~${peakMorning}).`);
  }
  if (val > 250) {
    cautions.push(`High particulate alert in ${name}: Ambient PM2.5 is elevated. Wear certified N95 masks for essential outdoor travel.`);
  } else if (val > 150) {
    cautions.push(`Sensitive individuals in ${name}: Children and elderly members should limit prolonged outdoor physical exertion.`);
  }

  // Impact calculations (using the exact 22 ug/m3 rule)
  const expReduc = val > 250 ? 45 : val > 100 ? 32 : 20;
  const avoidedCigs = Math.max(0.1, Math.round(((pm25 * (expReduc / 100)) / 22) * 10) / 10);

  return {
    summary,
    risk_level: aqi.current.category.toLowerCase().replace(" ", "_"),
    sections: {
      low_emission_routines,
      indoor_air_hacks,
      sustainable_alternatives
    },
    today_timeline,
    impact_summary: {
      exposure_reduction_pct: expReduc,
      co2_avoided_kg_week: val > 200 ? 8.5 : 5.4,
      cost_saved_inr_month: val > 200 ? 1850 : 1250,
      cigarettes_avoided_day: avoidedCigs,
      confidence: "Modelled estimate"
    },
    cautions,
    disclaimer: "Estimates for awareness only. BreatheWise is a decision-support tool, not a medical device."
  };
}



export const DEFAULT_PLAN_DATA: DailyPlan = getCityPresetPlan("Delhi");
