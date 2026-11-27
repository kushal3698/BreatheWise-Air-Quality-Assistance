import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { calculateCPCB_AQI } from '@/lib/cpcb';

const FIXTURE_PATH = path.resolve(__dirname, '../../../tests/fixtures/cpcb_cases.json');

describe('CPCB Cross-Stack Parity with Python Engine', () => {
  it('reads shared test fixture json', () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
  });

  const cases = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));

  cases.forEach((testCase: {
    description: string;
    inputs: { pm2_5?: number; pm10?: number; no2?: number; so2?: number; co?: number; o3?: number };
    expected: { aqi: number; category: string; dominant_pollutant?: string };
  }) => {
    it(`satisfies benchmark: ${testCase.description}`, () => {
      const res = calculateCPCB_AQI(
        testCase.inputs.pm2_5,
        testCase.inputs.pm10,
        testCase.inputs.no2,
        testCase.inputs.so2,
        testCase.inputs.co,
        testCase.inputs.o3,
        true
      );

      expect(res.aqi).toBe(testCase.expected.aqi);
      expect(res.category).toBe(testCase.expected.category);
      if (testCase.expected.dominant_pollutant) {
        expect(res.dominantPollutant.name).toBe(testCase.expected.dominant_pollutant);
      }
    });
  });
});
