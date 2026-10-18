import { money, percent, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const price = values.listPrice * (1 - values.discountRate / 100);
  const fee = price * values.feeRate / 100 + values.fixedFee;
  const total = values.cost + values.shipping + fee + values.other;
  const profit = price - total;
  return {
    loss: profit < 0,
    status: values.feeRate === 100 ? '販売手数料率が100%のため、赤字にならない価格は計算不能です' : undefined,
    rows: [
      money('salePrice', 'セール販売価格', price),
      money('profit', 'セール後利益', profit),
      percent('profitRate', '利益率', price === 0 ? null : profit / price * 100),
      money('fee', '販売手数料', fee),
      money('minimumPrice', '赤字にならない価格', values.feeRate >= 100 ? null : Math.ceil((values.cost + values.shipping + values.fixedFee + values.other) / (1 - values.feeRate / 100))),
    ],
  };
}
