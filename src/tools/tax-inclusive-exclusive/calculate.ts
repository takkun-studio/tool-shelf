import { money, type CalculatorResult } from '../types';
const roundBy = (value: number, mode: number) => mode === 1 ? Math.floor(value) : mode === 2 ? Math.ceil(value) : Math.round(value);
export function calculate(v: Record<string, number>): CalculatorResult {
  const rate = v.taxRate / 100;
  const raw = v.direction === 0 ? v.amount * (1 + rate) : v.amount / (1 + rate);
  const converted = roundBy(raw, v.rounding);
  const tax = v.direction === 0 ? converted - v.amount : v.amount - converted;
  return { rows: [money('converted', v.direction === 0 ? '税込金額' : '税抜金額', converted), money('tax','税額差',tax)] };
}
