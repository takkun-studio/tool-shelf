import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const profit = v.sales - v.expenses;
  const reserve = Math.max(0, profit) * v.reserveRate / 100;
  return { loss:profit<0, rows:[money('remaining','取り置き後に残る額',profit-reserve),money('profit','売上−経費',profit),money('reserve','税金取り置き目安',reserve)] };
}
