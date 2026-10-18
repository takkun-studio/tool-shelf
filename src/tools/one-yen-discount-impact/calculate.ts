import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.discountAmount>v.currentPrice) return { status:'値下げ額が現在価格を超えています', rows:[money('profitLoss','月利益の減少額',null)] };
  const salesLoss=v.discountAmount*v.monthlyQuantity;
  const feeSaving=salesLoss*v.feeRate/100;
  return { rows:[money('profitLoss','月利益の減少額',salesLoss-feeSaving),money('salesLoss','月売上の減少額',salesLoss),money('feeSaving','手数料の減少額',feeSaving),money('newPrice','値下げ後価格',v.currentPrice-v.discountAmount)] };
}
