import { money, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const price = values.hourlyRate * values.hours + values.expenses;
  return { rows: [
    money('price', '必要なサービス料金', price),
    money('labor', '作業報酬', values.hourlyRate * values.hours),
    money('expenses', '経費', values.expenses),
  ] };
}
