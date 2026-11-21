import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetAQI } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let city = searchParams.get('city') || 'Delhi';
  city = city.replace(/[^\p{L}\p{M}\p{N}\s()\-.]/gu, '').trim().slice(0, 60) || 'Delhi';
  const data = getCityPresetAQI(city);
  return NextResponse.json(data);
}
