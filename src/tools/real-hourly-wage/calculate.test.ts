import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('real-hourly-wage', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"profit":12000,"productionHours":3.5,"listingHours":1,"packingHours":0.5,"shippingHours":0.5,"customerHours":0.5}).rows.map((row) => row.value);
    const expected = [2000,6,12000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
