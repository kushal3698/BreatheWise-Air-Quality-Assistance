import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { calculateOverallImpact, recalculateInteractiveImpact } from '@/lib/impactSimulator';
import { getCityPresetPlan } from '@/lib/presetPlan';
import type { HouseholdProfile } from '@/lib/api';

const FIXTURE_PATH = path.resolve(__dirname, '../../../tests/fixtures/plan_impact_cases.json');

interface ImpactCase {
  description: string;
  outdoor_pm25: number;
  household: HouseholdProfile;
  expected: {
    exposure_reduction_pct: number;
    co2_avoided_kg_week: number;
    cost_saved_inr_month: number;
    cigarettes_avoided_day: number;
    requires_asthma_caution: boolean;
  };
}

describe('Cross-Stack Plan Impact & Simulator Parity', () => {
  it('reads shared plan_impact_cases.json fixture', () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
  });

  const cases = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8')) as ImpactCase[];

  cases.forEach((testCase) => {
    it(`matches Python deterministic impact engine: ${testCase.description}`, () => {
      const impact = calculateOverallImpact(testCase.outdoor_pm25, testCase.household);
      expect(impact.exposure_reduction_pct).toBe(testCase.expected.exposure_reduction_pct);
      expect(impact.co2_avoided_kg_week).toBe(testCase.expected.co2_avoided_kg_week);
      expect(impact.cost_saved_inr_month).toBe(testCase.expected.cost_saved_inr_month);
      expect(impact.cigarettes_avoided_day).toBe(testCase.expected.cigarettes_avoided_day);

      const plan = getCityPresetPlan('Delhi', testCase.household);
      const hasInhalerCaution = plan.cautions.some((c) => c.toLowerCase().includes('inhalers'));
      expect(hasInhalerCaution).toBe(testCase.expected.requires_asthma_caution);
    });
  });

  it('dynamically recalculates Direct Impact metrics when actions are toggled off', () => {
    const firstCase = cases[0];
    expect(firstCase).toBeDefined();
    if (!firstCase) return;

    const plan = getCityPresetPlan('Delhi', firstCase.household);
    const actions = [
      ...plan.sections.low_emission_routines,
      ...plan.sections.indoor_air_hacks,
      ...plan.sections.sustainable_alternatives,
    ];
    const allKeys = new Set(actions.map((item, idx) => `${idx}:${item.action}`));

    const fullImpact = recalculateInteractiveImpact(actions, allKeys, 178.4, plan.impact_summary);
    expect(fullImpact.exposure_reduction_pct).toBe(plan.impact_summary.exposure_reduction_pct);
    expect(fullImpact.cost_saved_inr_month).toBe(plan.impact_summary.cost_saved_inr_month);

    const halfKeys = new Set(Array.from(allKeys).slice(0, 3));
    const partialImpact = recalculateInteractiveImpact(actions, halfKeys, 178.4, plan.impact_summary);
    expect(partialImpact.exposure_reduction_pct).toBeLessThan(fullImpact.exposure_reduction_pct);
    expect(partialImpact.exposure_reduction_pct).toBeGreaterThan(0);

    const zeroImpact = recalculateInteractiveImpact(actions, new Set(), 178.4, plan.impact_summary);
    expect(zeroImpact.exposure_reduction_pct).toBe(0);
    expect(zeroImpact.co2_avoided_kg_week).toBe(0);
    expect(zeroImpact.cost_saved_inr_month).toBe(0);
    expect(zeroImpact.cigarettes_avoided_day).toBe(0);
  });
});
