import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('payout tool', () => { it('matches existing result', () => {
  expect(calculate({ price:1000, cost:400, shipping:100, salesFeeRate:10, paymentFeeRate:3, fixedFee:0, other:0 }).rows.map(row => row.value))
    .toEqual([870, 370, 130, 37]);
}); });
