import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetAQI } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || 'Delhi';
  const data = getCityPresetAQI(city);
  return NextResponse.json(data);
}
