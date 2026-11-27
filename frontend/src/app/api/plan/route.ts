import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetPlan } from '@/lib/initialData';
import { sanitizeCity } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const city = sanitizeCity(body?.city);
    const plan = getCityPresetPlan(city, body?.household);
    return NextResponse.json(plan);
  } catch {
    const defaultPlan = getCityPresetPlan('Delhi');
    return NextResponse.json(defaultPlan);
  }
}
