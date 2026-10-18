import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('target tool', () => { it('matches existing result', () => {
  expect(calculate({ targetProfit:10000, profitPerSale:500, price:2000, fixedCost:5000 }).rows.map(row => row.value))
    .toEqual([15000, 30, 60000]);
}); });
