import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetAQI } from '@/lib/initialData';
import { sanitizeCity } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCity = searchParams.get('city') || 'Delhi';
  const city = sanitizeCity(rawCity);
  const data = getCityPresetAQI(city);
  return NextResponse.json(data);
}
