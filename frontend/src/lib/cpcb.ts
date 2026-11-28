export const CPCB_BREAKPOINTS: Record<string, Array<{ c_low: number; c_high: number; i_low: number; i_high: number }>> = {
  pm2_5: [
    { c_low: 0, c_high: 30, i_low: 0, i_high: 50 },
    { c_low: 31, c_high: 60, i_low: 51, i_high: 100 },
    { c_low: 61, c_high: 90, i_low: 101, i_high: 200 },
    { c_low: 91, c_high: 120, i_low: 201, i_high: 300 },
    { c_low: 121, c_high: 250, i_low: 301, i_high: 400 },
    { c_low: 250.1, c_high: 380, i_low: 401, i_high: 500 },
  ],
  pm10: [
    { c_low: 0, c_high: 50, i_low: 0, i_high: 50 },
    { c_low: 51, c_high: 100, i_low: 51, i_high: 100 },
    { c_low: 101, c_high: 250, i_low: 101, i_high: 200 },
    { c_low: 251, c_high: 350, i_low: 201, i_high: 300 },
    { c_low: 351, c_high: 430, i_low: 301, i_high: 400 },
    { c_low: 430.1, c_high: 600, i_low: 401, i_high: 500 },
  ],
  no2: [
    { c_low: 0, c_high: 40, i_low: 0, i_high: 50 },
    { c_low: 41, c_high: 80, i_low: 51, i_high: 100 },
    { c_low: 81, c_high: 180, i_low: 101, i_high: 200 },
    { c_low: 181, c_high: 280, i_low: 201, i_high: 300 },
    { c_low: 281, c_high: 400, i_low: 301, i_high: 400 },
    { c_low: 401, c_high: 600, i_low: 401, i_high: 500 },
  ],
  so2: [
    { c_low: 0, c_high: 40, i_low: 0, i_high: 50 },
    { c_low: 41, c_high: 80, i_low: 51, i_high: 100 },
    { c_low: 81, c_high: 380, i_low: 101, i_high: 200 },
    { c_low: 381, c_high: 800, i_low: 201, i_high: 300 },
    { c_low: 801, c_high: 1600, i_low: 301, i_high: 400 },
    { c_low: 1601, c_high: 2000, i_low: 401, i_high: 500 },
  ],
  co: [
    { c_low: 0, c_high: 1.0, i_low: 0, i_high: 50 },
    { c_low: 1.1, c_high: 2.0, i_low: 51, i_high: 100 },
    { c_low: 2.1, c_high: 10.0, i_low: 101, i_high: 200 },
    { c_low: 10.1, c_high: 17.0, i_low: 201, i_high: 300 },
    { c_low: 17.1, c_high: 34.0, i_low: 301, i_high: 400 },
    { c_low: 34.1, c_high: 50.0, i_low: 401, i_high: 500 },
  ],
  o3: [
    { c_low: 0, c_high: 50, i_low: 0, i_high: 50 },
    { c_low: 51, c_high: 100, i_low: 51, i_high: 100 },
    { c_low: 101, c_high: 168, i_low: 101, i_high: 200 },
    { c_low: 169, c_high: 208, i_low: 201, i_high: 300 },
    { c_low: 209, c_high: 748, i_low: 301, i_high: 400 },
    { c_low: 749, c_high: 1000, i_low: 401, i_high: 500 },
  ],
};

export const POLLUTANT_NAMES: Record<string, string> = {
  pm2_5: "PM2.5",
  pm10: "PM10",
  no2: "NO₂",
  so2: "SO₂",
  co: "CO",
  o3: "O₃",
};

export const CPCB_BANDS = [
  { name: 'Good', min: 0, max: 50, color: '#2ecc71', bg: 'bg-emerald-500', range: '0–50' },
  { name: 'Satisfactory', min: 51, max: 100, color: '#27ae60', bg: 'bg-green-600', range: '51–100' },
  { name: 'Moderate', min: 101, max: 200, color: '#f39c12', bg: 'bg-amber-500', range: '101–200' },
  { name: 'Poor', min: 201, max: 300, color: '#e67e22', bg: 'bg-orange-500', range: '201–300' },
  { name: 'Very Poor', min: 301, max: 400, color: '#e74c3c', bg: 'bg-red-500', range: '301–400' },
  { name: 'Severe', min: 401, max: 500, color: '#8e44ad', bg: 'bg-purple-600', range: '401–500' },
];

export function getAQIBand(aqi: number) {
  if (aqi <= 50) {
    return {
      idx: 0,
      name: 'Good',
      color: '#2ecc71',
      bg: 'bg-emerald-500',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      range: '0–50',
    };
  }
  if (aqi <= 100) {
    return {
      idx: 1,
      name: 'Satisfactory',
      color: '#27ae60',
      bg: 'bg-green-600',
      badgeClass: 'text-green-700 bg-green-50 border-green-200',
      range: '51–100',
    };
  }
  if (aqi <= 200) {
    return {
      idx: 2,
      name: 'Moderate',
      color: '#f39c12',
      bg: 'bg-amber-500',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
      range: '101–200',
    };
  }
  if (aqi <= 300) {
    return {
      idx: 3,
      name: 'Poor',
      color: '#e67e22',
      bg: 'bg-orange-500',
      badgeClass: 'text-orange-800 bg-orange-50 border-orange-200',
      range: '201–300',
    };
  }
  if (aqi <= 400) {
    return {
      idx: 4,
      name: 'Very Poor',
      color: '#e74c3c',
      bg: 'bg-red-500',
      badgeClass: 'text-red-800 bg-red-50 border-red-200',
      range: '301–400',
    };
  }
  return {
    idx: 5,
    name: 'Severe',
    color: '#8e44ad',
    bg: 'bg-purple-600',
    badgeClass: 'text-purple-900 bg-purple-50 border-purple-200',
    range: '401–500',
  };
}

export function calculateCPCB_SubIndex(
  conc: number,
  breakpoints: Array<{ c_low: number; c_high: number; i_low: number; i_high: number }>,
  roundConc: boolean = true
): number {
  if (conc <= 0 || breakpoints.length === 0) return 0;
  const c_eval = roundConc ? Math.round(conc) : conc;
  let matched_bp: { c_low: number; c_high: number; i_low: number; i_high: number } | null = null;
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (!bp) continue;
    const prev_bp = i > 0 ? breakpoints[i - 1] : undefined;
    const prev_high = prev_bp ? prev_bp.c_high : 0;
    if (c_eval >= bp.c_low && c_eval <= bp.c_high) {
      matched_bp = bp;
      break;
    } else if (prev_high < c_eval && c_eval < bp.c_low) {
      matched_bp = bp;
      break;
    }
  }
  if (!matched_bp) {
    const lastBp = breakpoints[breakpoints.length - 1];
    if (lastBp && c_eval > lastBp.c_high) {
      return lastBp.i_high;
    }
    return 0;
  }
  const { c_low, c_high, i_low, i_high } = matched_bp;
  if (c_high === c_low) return i_low;
  return Math.min(500, Math.max(0, Math.round(((i_high - i_low) / (c_high - c_low)) * (c_eval - c_low) + i_low)));
}

export function calculateCPCB_AQI(
  pm2_5?: number,
  pm10?: number,
  no2?: number,
  so2?: number,
  co?: number,
  o3?: number,
  roundConc: boolean = true
): {
  aqi: number;
  category: string;
  color: string;
  dominantPollutant: {
    key: string;
    name: string;
    subIndex: number;
  };
  subIndices: Record<string, number>;
} {
  const pollutants: Record<string, number | undefined> = { pm2_5, pm10, no2, so2, co, o3 };
  const subIndices: Record<string, number> = {};

  for (const [key, val] of Object.entries(pollutants)) {
    const bps = CPCB_BREAKPOINTS[key];
    if (val !== undefined && val !== null && bps) {
      subIndices[key] = calculateCPCB_SubIndex(val, bps, roundConc);
    }
  }

  let dominantKey = "pm2_5";
  let maxSubIndex = 0;
  for (const [key, val] of Object.entries(subIndices)) {
    if (val > maxSubIndex) {
      maxSubIndex = val;
      dominantKey = key;
    }
  }

  const aqi = maxSubIndex;
  const dominantPollutant = {
    key: dominantKey,
    name: POLLUTANT_NAMES[dominantKey] || dominantKey.toUpperCase(),
    subIndex: maxSubIndex,
  };

  const band = getAQIBand(aqi);

  return {
    aqi,
    category: band.name,
    color: band.color,
    dominantPollutant,
    subIndices,
  };
}
