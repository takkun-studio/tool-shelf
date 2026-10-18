import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('market-go-no-go', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"booth":2000,"travel":800,"parking":500,"supplies":300,"otherFixed":400,"price":1200,"unitCost":400,"expectedQuantity":10,"cashlessRate":50,"paymentRate":4}).rows.map((row) => row.value);
    const expected = [3760,6,12000,240];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
