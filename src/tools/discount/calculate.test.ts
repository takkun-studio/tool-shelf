import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('discount tool', () => { it('matches existing result', () => {
  expect(calculate({ listPrice:1000, discountRate:20, cost:400, shipping:100, feeRate:10, fixedFee:0, other:0 }).rows.map(row => row.value))
    .toEqual([800, 220, 27.5, 80, 556]);
}); });
