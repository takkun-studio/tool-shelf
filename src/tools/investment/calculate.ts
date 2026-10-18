import { money, numberResult, quantity, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const count = values.profitPerSale === 0 ? null : Math.ceil(values.initialCost / values.profitPerSale);
  const months = count === null || values.monthlyCount === 0 ? null : count / values.monthlyCount;
  return {
    status: count === null
      ? '1件あたり利益が0円のため、回収件数は計算不能です'
      : values.monthlyCount === 0
        ? '月間販売・受注数が0件のため、回収月数は計算不能です'
        : undefined,
    rows: [
      quantity('breakEvenCount', '損益分岐件数', count),
      numberResult('recoveryMonths', '回収までの月数', months),
      money('initialCost', '初期費用', values.initialCost),
      money('monthlyProfit', '月間利益見込み', values.profitPerSale * values.monthlyCount),
    ],
  };
}
