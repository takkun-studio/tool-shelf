import { money, numberResult, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const hours=v.productionHours+v.listingHours+v.packingHours+v.shippingHours+v.customerHours;
  if (hours===0) return { status:'作業時間の合計が0時間です', rows:[numberResult('hourly','実質時給',null,'円/時間'),money('profit','最終利益',v.profit)] };
  return { rows:[numberResult('hourly','実質時給',v.profit/hours,'円/時間'),numberResult('hours','総作業時間',hours,'時間'),money('profit','最終利益',v.profit)] };
}
