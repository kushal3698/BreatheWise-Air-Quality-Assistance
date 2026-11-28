import emissionFactors from '../data/emissionFactors.json';
import type { HouseholdProfile, PlanActionItem } from './api';

export interface DeterministicImpactSummary {
  exposure_reduction_pct: number;
  co2_avoided_kg_week: number;
  cost_saved_inr_month: number;
  cigarettes_avoided_day: number;
  confidence: string;
}

const CO2_MAP: Record<string, number> = emissionFactors.emission_factors_kg_co2_per_km;
const COST_MAP: Record<string, number> = emissionFactors.cost_inr_per_km;
const PM25_PER_CIG: number = emissionFactors.pm25_cigarette_equivalent_ugm3;

/**
 * Deterministic overall impact calculator synchronized 1:1 with backend/app/services/impact.py.
 */
export function calculateOverallImpact(
  outdoorPm25: number,
  household?: HouseholdProfile
): DeterministicImpactSummary {
  const mode = household?.transport?.mode ?? 'petrol_car';
  const commuteKm = household?.transport?.commute_km ?? 15.0;
  const schoolKm = household?.transport?.school_run_km ?? 4.0;
  const wfhDays = household?.work_from_home_days ?? 2;
  const hasPurifier = household?.home?.has_purifier ?? false;

  const efMode = CO2_MAP[mode] ?? 0.17;
  const efMetro = CO2_MAP['metro'] ?? 0.014;
  const efBus = CO2_MAP['bus'] ?? 0.022;
  const costMode = COST_MAP[mode] ?? 9.5;
  const costTransit = COST_MAP['metro'] ?? 2.2;

  const wfhKmSaved = wfhDays * (commuteKm * 2);
  const modalShiftKm = 2 * (commuteKm * 2);
  const schoolKmSaved = 5 * (schoolKm * 2) * 0.7;

  const co2SavedWeek =
    wfhKmSaved * efMode +
    modalShiftKm * Math.max(0.0, efMode - efMetro) +
    schoolKmSaved * Math.max(0.0, efMode - efBus);

  const costSavedMonth =
    wfhKmSaved * costMode * 4.2 +
    modalShiftKm * Math.max(0.0, costMode - costTransit) * 4.2;

  let baseExposureReduc = 25.0;
  if (outdoorPm25 > 150) {
    baseExposureReduc += 15.0;
  }
  baseExposureReduc += hasPurifier ? 8.0 : 12.0;
  const exposurePct = Math.min(68.0, Math.round(baseExposureReduc * 10) / 10);

  const pm25Avoided = outdoorPm25 * (exposurePct / 100.0);
  const cigEquiv = Math.round((pm25Avoided / PM25_PER_CIG) * 10) / 10;

  return {
    exposure_reduction_pct: exposurePct,
    co2_avoided_kg_week: Math.round(co2SavedWeek * 10) / 10,
    cost_saved_inr_month: Math.round(costSavedMonth),
    cigarettes_avoided_day: Math.max(0.1, cigEquiv),
    confidence: 'Modelled estimate',
  };
}

/**
 * Interactive Direct Impact simulator: recalculates household savings dynamically
 * as users check or uncheck individual recommended daily actions.
 */
export function recalculateInteractiveImpact(
  allActions: PlanActionItem[],
  enabledKeys: Set<string>,
  outdoorPm25: number,
  baseline: DeterministicImpactSummary
): DeterministicImpactSummary {
  if (allActions.length === 0) return baseline;

  let checkedCount = 0;
  let totalExpWeight = 0;
  let checkedExpWeight = 0;
  let totalCo2Weight = 0;
  let checkedCo2Weight = 0;
  let totalCostWeight = 0;
  let checkedCostWeight = 0;

  allActions.forEach((item, idx) => {
    const key = `${idx}:${item?.action ?? ''}`;
    const impact = item?.impact as Partial<NonNullable<PlanActionItem['impact']>> | undefined;
    const expW = impact?.exposure_reduction_pct ?? 10;
    const co2W = impact?.co2_saved_kg ?? 0;
    const costW = impact?.cost_saved_inr ?? 0;

    totalExpWeight += expW;
    totalCo2Weight += co2W;
    totalCostWeight += costW;

    if (enabledKeys.has(key)) {
      checkedCount += 1;
      checkedExpWeight += expW;
      checkedCo2Weight += co2W;
      checkedCostWeight += costW;
    }
  });

  if (checkedCount === 0) {
    return {
      exposure_reduction_pct: 0,
      co2_avoided_kg_week: 0,
      cost_saved_inr_month: 0,
      cigarettes_avoided_day: 0,
      confidence: baseline.confidence,
    };
  }

  if (checkedCount === allActions.length) {
    return baseline;
  }

  const expRatio = totalExpWeight > 0 ? checkedExpWeight / totalExpWeight : checkedCount / allActions.length;
  const co2Ratio = totalCo2Weight > 0 ? checkedCo2Weight / totalCo2Weight : checkedCount / allActions.length;
  const costRatio = totalCostWeight > 0 ? checkedCostWeight / totalCostWeight : checkedCount / allActions.length;

  const expPct = Math.round(baseline.exposure_reduction_pct * expRatio * 10) / 10;
  const pm25Avoided = outdoorPm25 * (expPct / 100);
  const cigs = Math.round((pm25Avoided / PM25_PER_CIG) * 10) / 10;

  return {
    exposure_reduction_pct: expPct,
    co2_avoided_kg_week: Math.round(baseline.co2_avoided_kg_week * co2Ratio * 10) / 10,
    cost_saved_inr_month: Math.round(baseline.cost_saved_inr_month * costRatio),
    cigarettes_avoided_day: expPct > 0 ? Math.max(0.1, cigs) : 0,
    confidence: baseline.confidence,
  };
}
