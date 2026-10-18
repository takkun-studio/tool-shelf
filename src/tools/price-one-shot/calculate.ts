import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.feeRate >= 100 || v.reserveRate >= 100) return { status:'手数料率と取り置き率は100%未満にしてください', rows:[money('price','必要販売価格',null)] };
  const requiredBeforeReserve = v.targetProfit / (1 - v.reserveRate / 100);
  const price = Math.ceil((v.cost + v.shipping + requiredBeforeReserve) / (1 - v.feeRate / 100));
  const fee = price * v.feeRate / 100;
  const beforeReserve = price - fee - v.cost - v.shipping;
  const reserve = Math.max(0,beforeReserve) * v.reserveRate / 100;
  return { rows:[money('price','必要販売価格',price),money('profitAfterReserve','取り置き後利益',beforeReserve-reserve),money('fee','販売手数料',fee),money('reserve','税取り置き目安',reserve)] };
}
