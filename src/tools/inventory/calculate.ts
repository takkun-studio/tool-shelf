import { money, numberResult, quantity, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const value = values.stock * values.unitCost;
  const months = values.monthlySales === 0 ? null : values.stock / values.monthlySales;
  return {
    status: values.monthlySales === 0 ? '月間販売数が0件のため、在庫の持ち月数は計算不能です' : undefined,
    rows: [
      money('stockValue', '在庫金額', value),
      quantity('stock', '現在庫数', values.stock),
      numberResult('months', '在庫の持ち月数', months),
      quantity('monthlySales', '月間販売数', values.monthlySales),
    ],
  };
}
