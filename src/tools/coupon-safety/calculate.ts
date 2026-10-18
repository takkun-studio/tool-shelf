import { money, percent, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const sale=v.price*(1-v.couponRate/100);
  const fee=sale*v.feeRate/100+v.fixedFee;
  const profit=sale-fee-v.cost-v.shipping-v.other;
  const min=v.feeRate>=100?null:(v.cost+v.shipping+v.fixedFee+v.other)/(1-v.feeRate/100);
  const maxDiscount=min===null||v.price===0?null:Math.max(0,(1-min/v.price)*100);
  return { loss:profit<0, rows:[money('profit','クーポン後利益',profit),money('sale','クーポン後価格',sale),percent('maxDiscount','赤字にならない最大値引率',maxDiscount),money('minimum','赤字にならない販売価格',min)] };
}
