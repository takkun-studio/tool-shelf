import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('channel tool', () => { it('matches existing result', () => {
  expect(calculate({ priceA:1000, costA:400, shippingA:100, salesFeeA:10, paymentFeeA:3, priceB:1000, costB:400, shippingB:100, salesFeeB:5, paymentFeeB:0 }).rows.map(row => row.value))
    .toEqual([370, 450, 870, 950, -80]);
}); });
