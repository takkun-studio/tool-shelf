import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const business = v.totalCost * v.businessRate / 100;
  return { rows:[money('business','事業分',business),money('private','家事分',v.totalCost-business)] };
}
