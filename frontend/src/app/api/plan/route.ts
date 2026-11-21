import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetPlan } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { city = 'Delhi', household } = body;
    if (typeof city !== 'string') city = 'Delhi';
    city = city.replace(/[^\p{L}\p{M}\p{N}\s()\-.]/gu, '').trim().slice(0, 60) || 'Delhi';
    const plan = getCityPresetPlan(city, household);
    return NextResponse.json(plan);
  } catch (err) {
    const defaultPlan = getCityPresetPlan('Delhi');
    return NextResponse.json(defaultPlan);
  }
}
