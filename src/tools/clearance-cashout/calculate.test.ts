import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('clearance-cashout', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"unitCost":500,"currentPrice":1500,"stock":20,"monthlyHoldingCost":1000,"currentSelloutMonths":6,"discountPrice":1300,"discountSelloutMonths":2}).rows.map((row) => row.value);
    const expected = [0,14000,14000,1300];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
