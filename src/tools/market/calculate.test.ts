import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('market tool', () => {
  it('calculates event profit and break-even', () => {
    expect(calculate({ price:1000, quantity:10, unitCost:400, booth:1000, travel:500, parking:0, supplies:0, otherFixed:0, cashlessRate:50, paymentRate:10 }).rows.map(row => row.value))
      .toEqual([10000, 6000, 4000, 40, 500, 550, 3, 3000]);
  });
});
