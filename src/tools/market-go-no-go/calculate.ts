import { money, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const sales = v.price * v.expectedQuantity;
  const payment = sales * v.cashlessRate/100 * v.paymentRate/100;
  const fixed = v.booth+v.travel+v.parking+v.supplies+v.otherFixed;
  const profit = sales - v.unitCost*v.expectedQuantity - payment - fixed;
  const unitMargin = v.price - v.unitCost - v.price*v.cashlessRate/100*v.paymentRate/100;
  const breakEven = fixed===0?0:unitMargin<=0?null:Math.ceil(fixed/unitMargin);
  return { loss:profit<0, summary:profit>=0?'予想販売数では黒字見込みです。':'予想販売数では赤字見込みです。', rows:[money('profit','予想利益',profit),quantity('breakEven','黒字化に必要な販売数',breakEven),money('sales','予想売上',sales),money('payment','決済手数料',payment)] };
}
