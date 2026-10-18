import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('purchase-go-no-go', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"purchaseCost":50000,"expectedSales":90000,"feeRate":10,"shippingTotal":5000,"otherCosts":3000,"expectedMonths":2,"availableCash":120000}).rows.map((row) => row.value);
    const expected = [23000,46,70000,11500];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
