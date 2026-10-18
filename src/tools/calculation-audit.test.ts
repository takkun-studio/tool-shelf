import { describe, expect, it } from 'vitest';
import { calculate } from './index';

const values = (id: Parameters<typeof calculate>[0], input: Record<string, number>) =>
  calculate(id, input).rows.map((row) => row.value);

describe('independent calculation audit vectors', () => {
  it('profit handles decimal fees and break-even rounding', () => {
    const r = values('profit', { price:2570, cost:913, shipping:210, feeRate:7.5, fixedFee:40, other:87 });
    expect(r[0]).toBeCloseTo(1127.25);
    expect(r[2]).toBeCloseTo(1442.75);
    expect(r[3]).toBeCloseTo(232.75);
    expect(r[5]).toBe(1352);
  });

  it('breakeven rounds required units upward', () => {
    const r = values('breakeven', { price:850, variableCost:330, fixedCost:3500 });
    expect(r[0]).toBe(520);
    expect(r[2]).toBe(7);
    expect(r[3]).toBe(5950);
  });

  it('market handles weighted cashless fees', () => {
    const r = values('market', { price:1200, quantity:13, unitCost:420, booth:1800, travel:650, parking:400, supplies:250, otherFixed:100, cashlessRate:60, paymentRate:3.6 });
    expect(r[0]).toBe(15600);
    expect(r[2]).toBeCloseTo(6603.04);
    expect(r[4]).toBeCloseTo(336.96);
    expect(r[6]).toBe(5);
  });

  it('discount uses the discounted selling price as the fee base', () => {
    const r = values('discount', { listPrice:3500, discountRate:12.5, cost:1200, shipping:450, feeRate:8.8, fixedFee:30, other:70 });
    expect(r[0]).toBeCloseTo(3062.5);
    expect(r[1]).toBeCloseTo(1043);
    expect(r[3]).toBeCloseTo(299.5);
    expect(r[4]).toBe(1919);
  });

  it('payout combines percentage fees consistently', () => {
    const r = values('payout', { price:5200, cost:1400, shipping:600, salesFeeRate:6.6, paymentFeeRate:3.6, fixedFee:0, other:150 });
    expect(r[0]).toBeCloseTo(4669.6);
    expect(r[1]).toBeCloseTo(2519.6);
    expect(r[2]).toBeCloseTo(530.4);
  });

  it('service supports fractional hours at the calculation layer', () => {
    const r = values('service', { hourlyRate:2800, hours:2.5, expenses:860 });
    expect(r).toEqual([7860, 7000, 860]);
  });

  it('target uses contribution per sale before fixed costs', () => {
    const r = values('target', { targetProfit:12000, profitPerSale:725, price:1800, fixedCost:4000 });
    expect(r).toEqual([16000, 23, 41400]);
  });

  it('inventory keeps fractional months', () => {
    const r = values('inventory', { stock:17, unitCost:430, monthlySales:6 });
    expect(r[0]).toBe(7310);
    expect(r[2]).toBeCloseTo(17 / 6);
  });

  it('channel compares two decimal fee structures', () => {
    const r = values('channel', { priceA:4800, costA:1500, shippingA:600, salesFeeA:8.8, paymentFeeA:3.6, priceB:4600, costB:1500, shippingB:450, salesFeeB:5.5, paymentFeeB:3.6 });
    expect(r[0]).toBeCloseTo(2104.8);
    expect(r[1]).toBeCloseTo(2231.4);
    expect(r[4]).toBeCloseTo(-126.6);
  });

  it('investment uses whole sale count before converting to months', () => {
    const r = values('investment', { initialCost:125000, profitPerSale:4300, monthlyCount:12 });
    expect(r).toEqual([30, 2.5, 125000, 51600]);
  });
});
