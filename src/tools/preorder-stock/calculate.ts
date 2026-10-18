import { quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.defectRate>=100) return { status:'不良見込み率は100%未満にしてください', rows:[quantity('order','必要発注数',null)] };
  const goodNeeded=v.reservations*(1+v.bufferRate/100);
  const order=Math.ceil(goodNeeded/(1-v.defectRate/100));
  const expectedGood=order*(1-v.defectRate/100);
  return { rows:[quantity('order','必要発注数',order),quantity('goodNeeded','確保したい良品数',goodNeeded),quantity('expectedGood','期待できる良品数',expectedGood)] };
}
