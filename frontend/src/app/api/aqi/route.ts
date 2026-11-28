import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetAQI } from '@/lib/initialData';
import { calculateCPCB_AQI, getAQIBand } from '@/lib/cpcb';
import { sanitizeCity } from '@/lib/sanitize';
import type { AirQualityData, HourlyForecast, SafeWindow } from '@/lib/api';

export const dynamic = 'force-dynamic';

function buildSafeWindowsFromHourly(forecast: HourlyForecast[]): SafeWindow[] {
  if (forecast.length < 4) return [];
  const daylight = forecast.filter((item) => {
    const h = Number.parseInt(item.hour.split(':')[0] ?? '0', 10);
    return h >= 7 && h <= 20;
  });
  const pool = daylight.length >= 3 ? daylight : forecast;
  const candidates: Array<{ start: string; end: string; avg_aqi: number }> = [];
  for (let i = 0; i <= pool.length - 3; i += 1) {
    const slice = pool.slice(i, i + 3);
    const first = slice[0];
    const last = slice[slice.length - 1];
    if (!first || !last) continue;
    const avg = Math.round(slice.reduce((acc, s) => acc + s.aqi, 0) / 3);
    candidates.push({ start: first.hour, end: last.hour, avg_aqi: avg });
  }
  candidates.sort((a, b) => a.avg_aqi - b.avg_aqi);
  const best = candidates[0];
  if (!best) return [];
  const band = getAQIBand(best.avg_aqi);
  return [
    {
      start: best.start,
      end: best.end,
      avg_aqi: best.avg_aqi,
      category: band.name,
      guidance: `Lowest forecast AQI today (~${best.avg_aqi}) from Open-Meteo atmospheric dispersion forecast.`,
    },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCity = searchParams.get('city') || 'Delhi';
  const city = sanitizeCity(rawCity);
  const preset = getCityPresetAQI(city);

  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.json(preset);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const { lat, lon } = preset.location;
    const [aqRes, wRes] = await Promise.all([
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&forecast_days=1&timezone=auto`,
        { signal: controller.signal }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`,
        { signal: controller.signal }
      ),
    ]);
    if (!aqRes.ok || !wRes.ok) {
      return NextResponse.json(preset);
    }

    const aq = (await aqRes.json()) as {
      current?: Record<string, number | null>;
      hourly?: Record<string, Array<string | number | null>>;
    };
    const weather = (await wRes.json()) as { current?: Record<string, number> };

    const curr = aq.current ?? {};
    const pm25 = Number(curr.pm2_5 ?? preset.current.pm2_5);
    const pm10 = Number(curr.pm10 ?? preset.current.pm10);
    const no2 = curr.nitrogen_dioxide ?? undefined;
    const so2 = curr.sulphur_dioxide ?? undefined;
    const coRaw = curr.carbon_monoxide;
    const co = typeof coRaw === 'number' ? Math.round((coRaw / 1000) * 100) / 100 : undefined;
    const o3 = curr.ozone ?? undefined;

    const cpcb = calculateCPCB_AQI(pm25, pm10, no2 ?? undefined, so2 ?? undefined, co, o3 ?? undefined);
    const hourly = aq.hourly ?? {};
    const times = (hourly.time ?? []) as string[];
    const hPm25 = (hourly.pm2_5 ?? []) as Array<number | null>;
    const hPm10 = (hourly.pm10 ?? []) as Array<number | null>;
    const hNo2 = (hourly.nitrogen_dioxide ?? []) as Array<number | null>;
    const hSo2 = (hourly.sulphur_dioxide ?? []) as Array<number | null>;
    const hCo = (hourly.carbon_monoxide ?? []) as Array<number | null>;
    const hO3 = (hourly.ozone ?? []) as Array<number | null>;

    const forecast: HourlyForecast[] = [];
    for (let i = 0; i < Math.min(times.length, 24); i += 2) {
      const tStr = String(times[i] ?? '');
      const hourLabel = tStr.includes('T') ? (tStr.split('T')[1] ?? '').slice(0, 5) : `${String(i).padStart(2, '0')}:00`;
      const p25 = Number(hPm25[i] ?? pm25);
      const p10 = Number(hPm10[i] ?? pm10);
      const slotNo2 = hNo2[i] ?? undefined;
      const slotSo2 = hSo2[i] ?? undefined;
      const slotCoRaw = hCo[i];
      const slotCo = typeof slotCoRaw === 'number' ? Math.round((slotCoRaw / 1000) * 100) / 100 : undefined;
      const slotO3 = hO3[i] ?? undefined;
      const hAqi = calculateCPCB_AQI(p25, p10, slotNo2 ?? undefined, slotSo2 ?? undefined, slotCo, slotO3 ?? undefined);
      forecast.push({ hour: hourLabel, aqi: hAqi.aqi, pm2_5: Math.round(p25 * 10) / 10 });
    }

    const livePayload: AirQualityData = {
      ...preset,
      current: {
        aqi: cpcb.aqi,
        category: cpcb.category,
        cpcb_color: cpcb.color,
        pm2_5: Math.round(pm25 * 10) / 10,
        pm10: Math.round(pm10 * 10) / 10,
        no2: no2 !== undefined && no2 !== null ? Math.round(no2 * 10) / 10 : preset.current.no2,
        so2: so2 !== undefined && so2 !== null ? Math.round(so2 * 10) / 10 : preset.current.so2,
        co: co ?? preset.current.co,
        o3: o3 !== undefined && o3 !== null ? Math.round(o3 * 10) / 10 : preset.current.o3,
        dominant_pollutant: {
          name: cpcb.dominantPollutant.name,
          sub_index: cpcb.dominantPollutant.subIndex,
        },
      },
      weather: {
        temp_c: Math.round(Number(weather.current?.temperature_2m ?? preset.weather.temp_c) * 10) / 10,
        humidity: Math.round(Number(weather.current?.relative_humidity_2m ?? preset.weather.humidity)),
        wind_kmh: Math.round(Number(weather.current?.wind_speed_10m ?? preset.weather.wind_kmh) * 10) / 10,
        wind_direction: preset.weather.wind_direction,
        conditions: cpcb.aqi > 250 ? 'Inversion Smog' : 'Haze / Clear',
      },
      forecast: forecast.length > 0 ? forecast : preset.forecast,
      safe_windows: forecast.length >= 4 ? buildSafeWindowsFromHourly(forecast) : preset.safe_windows,
      source: 'open-meteo / CPCB',
      fetched_at: new Date().toISOString(),
      is_stale: false,
    };

    return NextResponse.json(livePayload);
  } catch {
    return NextResponse.json(preset);
  } finally {
    clearTimeout(timer);
  }
}
