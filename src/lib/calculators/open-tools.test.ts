import { describe, expect, it } from 'vitest';
import { calculate } from './index';
import { calculatePaid, type PaidToolId } from '../../../worker/src/calculators';
import { tools } from '../tools';

const cases: Record<PaidToolId, Record<string, number>> = {
  discount: { listPrice: 1000, discountRate: 20, cost: 400, shipping: 100, feeRate: 10, fixedFee: 0, other: 0 },
  payout: { price: 1000, cost: 400, shipping: 100, salesFeeRate: 10, paymentFeeRate: 3, fixedFee: 0, other: 0 },
  service: { hourlyRate: 2000, hours: 3, expenses: 500 },
  target: { targetProfit: 10000, profitPerSale: 500, price: 2000, fixedCost: 5000 },
  inventory: { stock: 20, unitCost: 300, monthlySales: 8 },
  channel: { priceA: 1000, costA: 400, shippingA: 100, salesFeeA: 10, paymentFeeA: 3, priceB: 1000, costB: 400, shippingB: 100, salesFeeB: 5, paymentFeeB: 0 },
  investment: { initialCost: 10000, profitPerSale: 500, monthlyCount: 8 },
};

describe('all tools are accessible to unauthenticated visitors', () => {
  it('makes all ten tools free in the catalog', () => {
    expect(tools).toHaveLength(10);
    expect(tools.every((tool) => tool.access === 'free' && tool.minimumPlan === 'free')).toBe(true);
  });
  it.each(Object.entries(cases) as [PaidToolId, Record<string, number>][])('%s uses the same tested math without any account or token', (id, values) => {
    expect(calculate(id, values)).toEqual(calculatePaid(id, values));
  });
});
