import { sanitizeChatMessage, sanitizeCity } from './sanitize';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export type { SupportedLanguage } from './i18n';

export interface AirQualityLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export interface AirQualityStation {
  name: string;
  distance_km: number;
}

export interface CurrentAQI {
  aqi: number;
  category: string;
  cpcb_color: string;
  pm2_5: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  dominant_pollutant?: {
    name: string;
    sub_index: number;
  };
}

export interface WeatherInfo {
  temp_c: number;
  humidity: number;
  wind_kmh: number;
  wind_direction?: string;
  conditions?: string;
}

export interface HourlyForecast {
  hour: string;
  aqi: number;
  pm2_5: number;
}

export interface SafeWindow {
  start: string;
  end: string;
  avg_aqi: number;
  category: string;
  guidance: string;
}

export interface AirQualityData {
  location: AirQualityLocation;
  station: AirQualityStation;
  current: CurrentAQI;
  weather: WeatherInfo;
  forecast: HourlyForecast[];
  safe_windows: SafeWindow[];
  source: string;
  fetched_at: string;
  is_stale: boolean;
}

export interface HouseholdMember {
  id?: string;
  role: string;
  age: number;
  sensitivities: string[];
}

export interface TransportProfile {
  mode: string;
  vehicles: number;
  school_run_km: number;
  commute_km: number;
}

export interface HomeProfile {
  type: string;
  floor: number;
  has_purifier: boolean;
  cooking_fuel: string;
}

export interface HouseholdProfile {
  members: HouseholdMember[];
  transport: TransportProfile;
  home: HomeProfile;
  work_from_home_days: number;
}

export interface ActionImpact {
  exposure_reduction_pct?: number;
  co2_saved_kg?: number;
  cost_saved_inr?: number;
  confidence: string;
}

export interface PlanActionItem {
  action: string;
  why: string;
  effort: string;
  cost: string;
  impact: ActionImpact;
  sources: string[];
}

export interface PlanTimelineItem {
  time: string;
  advice: string;
}

export interface DailyPlan {
  summary: string;
  risk_level: string;
  sections: {
    low_emission_routines: PlanActionItem[];
    indoor_air_hacks: PlanActionItem[];
    sustainable_alternatives: PlanActionItem[];
  };
  today_timeline: PlanTimelineItem[];
  impact_summary: {
    exposure_reduction_pct: number;
    co2_avoided_kg_week: number;
    cost_saved_inr_month: number;
    cigarettes_avoided_day: number;
    confidence: string;
  };
  cautions: string[];
  disclaimer: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatResponse {
  reply: string;
  grounded_sources: string[];
  suggested_questions: string[];
  safe_window_summary?: string;
  disclaimer: string;
}

export interface CommunityLeaderboardEntry {
  neighbourhood: string;
  city: string;
  participants: number;
  co2_avoided_kg: number;
  car_free_trips: number;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participants_count: number;
  total_co2_saved_kg: number;
  target_date: string;
  completed: boolean;
}

export interface SchoolGuidance {
  aqi: number;
  category: string;
  city: string;
  assembly_guideline: string;
  sports_guideline: string;
  recess_guideline: string;
  classroom_guideline: string;
  precautions_for_asthmatic_students: string[];
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function fetchAQI(city: string = 'Delhi'): Promise<AirQualityData> {
  const safeCity = sanitizeCity(city);
  const res = await fetchWithTimeout(`${API_BASE}/api/aqi?city=${encodeURIComponent(safeCity)}`, {}, 6000);
  if (!res.ok) throw new Error('Failed to fetch air quality data');
  return res.json();
}

export async function fetchDailyPlan(city: string, language: string, household?: HouseholdProfile): Promise<DailyPlan> {
  const safeCity = sanitizeCity(city);
  const res = await fetchWithTimeout(
    `${API_BASE}/api/plan`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: safeCity, language, household }),
    },
    32000
  );
  if (!res.ok) throw new Error('Failed to generate daily plan');
  return res.json();
}

export async function sendChatMessage(
  message: string,
  city: string,
  language: string,
  household?: HouseholdProfile,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const safeCity = sanitizeCity(city);
  const safeMessage = sanitizeChatMessage(message);
  const res = await fetchWithTimeout(
    `${API_BASE}/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: safeMessage, city: safeCity, language, household, history }),
    },
    32000
  );
  if (!res.ok) throw new Error('Failed to communicate with BreatheWise assistant');
  return res.json();
}

export async function fetchSchoolGuidance(city: string = 'Delhi'): Promise<SchoolGuidance> {
  const safeCity = sanitizeCity(city);
  const res = await fetchWithTimeout(`${API_BASE}/api/school/guidance?city=${encodeURIComponent(safeCity)}`);
  if (!res.ok) throw new Error('Failed to fetch school guidance');
  return res.json();
}

export async function fetchCommunityLeaderboard(): Promise<CommunityLeaderboardEntry[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/community/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch community leaderboard');
  return res.json();
}

export async function fetchCommunityChallenges(): Promise<CommunityChallenge[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/community/challenges`);
  if (!res.ok) throw new Error('Failed to fetch community challenges');
  return res.json();
}
