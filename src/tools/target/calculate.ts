import { money, quantity, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const required = values.targetProfit + values.fixedCost;
  if (values.profitPerSale === 0) {
    return {
      status: '1件あたり利益が0円のため、必要販売数は計算不能です',
      rows: [
        money('requiredProfit', '必要利益', required),
        quantity('requiredCount', '必要販売数', null),
        money('requiredSales', '必要売上', null),
      ],
    };
  }
  const count = Math.ceil(required / values.profitPerSale);
  return { rows: [
    money('requiredProfit', '必要利益', required),
    quantity('requiredCount', '必要販売数', count),
    money('requiredSales', '必要売上', count * values.price),
  ] };
}
