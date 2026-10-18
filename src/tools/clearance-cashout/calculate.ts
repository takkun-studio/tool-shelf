import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const current=(v.currentPrice-v.unitCost)*v.stock-v.monthlyHoldingCost*v.currentSelloutMonths;
  const discounted=(v.discountPrice-v.unitCost)*v.stock-v.monthlyHoldingCost*v.discountSelloutMonths;
  const savedHolding=v.monthlyHoldingCost*Math.max(0,v.currentSelloutMonths-v.discountSelloutMonths);
  const breakEven=v.stock===0?null:v.currentPrice-savedHolding/v.stock;
  return { summary:discounted>current?'入力条件では値下げ案の方が将来利益が高いです。':discounted<current?'入力条件では現価格維持の方が将来利益が高いです。':'入力条件では同額です。', rows:[money('difference','値下げ案−現価格維持',discounted-current),money('current','現価格維持の将来利益',current),money('discounted','値下げ案の将来利益',discounted),money('breakEven','値下げ案が不利にならない価格目安',breakEven)] };
}
