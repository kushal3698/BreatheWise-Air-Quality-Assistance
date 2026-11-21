import { NextResponse } from 'next/server';
import { DEFAULT_COMMUNITY_LEADERBOARD } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(DEFAULT_COMMUNITY_LEADERBOARD);
}
