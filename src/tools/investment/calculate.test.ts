import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('investment tool', () => { it('matches existing result', () => {
  expect(calculate({ initialCost:10000, profitPerSale:500, monthlyCount:8 }).rows.map(row => row.value))
    .toEqual([20, 2.5, 10000, 4000]);
}); });
