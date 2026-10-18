import { money, percent, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const reserve = v.profit * v.reserveRate / 100;
  return { rows: [money('reserve','取り置き目安',reserve), money('remaining','取り置き後に残る額',v.profit-reserve), percent('rate','設定した取り置き率',v.reserveRate)] };
}
