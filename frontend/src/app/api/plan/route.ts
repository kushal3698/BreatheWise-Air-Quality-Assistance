import { NextRequest, NextResponse } from 'next/server';
import { getCityPresetPlan } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city = 'Delhi', household } = body;
    const plan = getCityPresetPlan(city, household);
    return NextResponse.json(plan);
  } catch (err) {
    const defaultPlan = getCityPresetPlan('Delhi');
    return NextResponse.json(defaultPlan);
  }
}
