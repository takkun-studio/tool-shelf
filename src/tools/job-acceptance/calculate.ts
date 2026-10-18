import { money, numberResult, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const hours = v.workHours + v.travelHours;
  const profit = v.fee - v.expenses;
  const reserve = Math.max(0,profit)*v.reserveRate/100;
  const net = profit-reserve;
  if (hours===0) return { status:'作業時間と移動時間の合計が0時間です', rows:[money('net','取り置き後の手残り',net),numberResult('hourly','実質時給',null,'円/時間')] };
  return { rows:[numberResult('hourly','実質時給',net/hours,'円/時間'),money('net','取り置き後の手残り',net),money('reserve','税取り置き目安',reserve),numberResult('hours','総拘束時間',hours,'時間')] };
}
