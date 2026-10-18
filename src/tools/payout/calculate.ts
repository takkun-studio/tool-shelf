import { money, percent, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const fee = values.price * (values.salesFeeRate + values.paymentFeeRate) / 100 + values.fixedFee;
  const payout = values.price - fee;
  const profit = payout - values.cost - values.shipping - values.other;
  return {
    loss: profit < 0,
    rows: [
      money('payout', '手取り売上', payout),
      money('profit', '利益', profit),
      money('fees', '手数料合計', fee),
      percent('profitRate', '利益率', values.price === 0 ? null : profit / values.price * 100),
    ],
  };
}
