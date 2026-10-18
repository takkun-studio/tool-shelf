import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('price-one-shot', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"cost":1000,"shipping":300,"feeRate":10,"reserveRate":20,"targetProfit":800}).rows.map((row) => row.value);
    const expected = [2556,800.32,255.6,200.08];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
