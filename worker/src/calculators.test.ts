import { describe, expect, it } from 'vitest';
import { calculatePaid, readPaidInputs, type PaidToolId } from './calculators';
const cases: [PaidToolId, Record<string, number>, (number | null)[]][] = [
  ['discount', { listPrice: 1000, discountRate: 20, cost: 400, shipping: 100, feeRate: 10, fixedFee: 0, other: 0 }, [800, 220, 27.5, 80, 556]],
  ['payout', { price: 1000, cost: 400, shipping: 100, salesFeeRate: 10, paymentFeeRate: 3, fixedFee: 0, other: 0 }, [870, 370, 130, 37]],
  ['service', { hourlyRate: 2000, hours: 3, expenses: 500 }, [6500, 6000, 500]],
  ['target', { targetProfit: 10000, profitPerSale: 500, price: 2000, fixedCost: 5000 }, [15000, 30, 60000]],
  ['inventory', { stock: 20, unitCost: 300, monthlySales: 8 }, [6000, 20, 2.5, 8]],
  ['channel', { priceA: 1000, costA: 400, shippingA: 100, salesFeeA: 10, paymentFeeA: 3, priceB: 1000, costB: 400, shippingB: 100, salesFeeB: 5, paymentFeeB: 0 }, [370, 450, 870, 950, -80]],
  ['investment', { initialCost: 10000, profitPerSale: 500, monthlyCount: 8 }, [20, 2.5, 10000, 4000]],
];
describe('paid worker calculators', () => {
  it.each(cases)('%s matches the existing calculation result', (toolId, inputs, expected) => { const actual = calculatePaid(toolId, inputs).rows.map((row) => row.value); actual.forEach((value, index) => typeof value === 'number' && typeof expected[index] === 'number' ? expect(value).toBeCloseTo(expected[index] as number) : expect(value).toBe(expected[index])); });
  it.each(cases)('%s rejects invalid input and ignores forged plan fields', (toolId, inputs) => { expect(readPaidInputs(toolId, { ...inputs, plan: 'standard', role: 'admin' })).toEqual(inputs); expect(readPaidInputs(toolId, { ...inputs, [Object.keys(inputs)[0]]: -1 })).toBeNull(); expect(readPaidInputs(toolId, { ...inputs, [Object.keys(inputs)[0]]: 1.5 })).toBeNull(); });
  it('rejects a percent over 100', () => expect(readPaidInputs('payout', { price: 1, cost: 0, shipping: 0, salesFeeRate: 101, paymentFeeRate: 0, fixedFee: 0, other: 0 })).toBeNull());
});
