import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const discount=v.price*v.discountRate/100;
  const points=v.price*v.pointRate/100*v.pointUseRate/100*v.pointCostRate/100;
  return { summary:discount<points?'値引きの方が期待負担は小さいです。':discount>points?'ポイント還元の方が期待負担は小さいです。':'期待負担は同額です。', rows:[money('difference','値引き負担−ポイント期待負担',discount-points),money('discount','値引きの即時負担',discount),money('points','ポイントの期待負担',points)] };
}
