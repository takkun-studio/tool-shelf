import { money, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const side = (price: number, cost: number, shipping: number, salesFee: number, paymentFee: number) => {
    const fees = price * (salesFee + paymentFee) / 100;
    const payout = price - fees;
    return { payout, profit: payout - cost - shipping };
  };
  const a = side(values.priceA, values.costA, values.shippingA, values.salesFeeA, values.paymentFeeA);
  const b = side(values.priceB, values.costB, values.shippingB, values.salesFeeB, values.paymentFeeB);
  return {
    loss: a.profit < 0 || b.profit < 0,
    rows: [
      money('profitA', 'チャネルA 利益', a.profit),
      money('profitB', 'チャネルB 利益', b.profit),
      money('payoutA', 'チャネルA 手取り', a.payout),
      money('payoutB', 'チャネルB 手取り', b.payout),
      money('difference', '利益差（A - B）', a.profit - b.profit),
    ],
  };
}
