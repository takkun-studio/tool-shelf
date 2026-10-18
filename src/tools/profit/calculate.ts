import { money, percent, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const fee = values.price * values.feeRate / 100 + values.fixedFee;
  const total = values.cost + values.shipping + fee + values.other;
  const profit = values.price - total;
  return {
    loss: profit < 0,
    status: values.feeRate === 100 ? '販売手数料率が100%のため、損益ゼロ売価は計算不能です' : undefined,
    rows: [
      money('profit', '利益', profit),
      percent('profitRate', '利益率', values.price === 0 ? null : profit / values.price * 100),
      money('total', '総コスト', total),
      money('fee', '販売手数料', fee),
      percent('costRate', '原価率', values.price === 0 ? null : total / values.price * 100),
      money('breakEvenPrice', '損益ゼロ売価', values.feeRate >= 100 ? null : Math.ceil((values.cost + values.shipping + values.fixedFee + values.other) / (1 - values.feeRate / 100))),
    ],
  };
}
