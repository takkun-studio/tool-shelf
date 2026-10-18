import { money, percent, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const cost=v.itemCostTotal+v.packageCost+v.shipping;
  const fee=v.sellingPrice*v.feeRate/100;
  const profit=v.sellingPrice-fee-cost;
  const min=v.feeRate>=100?null:Math.ceil(cost/(1-v.feeRate/100));
  return { loss:profit<0, rows:[money('profit','セット利益',profit),percent('profitRate','利益率',v.sellingPrice===0?null:profit/v.sellingPrice*100),money('fee','販売手数料',fee),money('minimum','赤字にならないセット価格',min)] };
}
