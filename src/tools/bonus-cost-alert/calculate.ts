import { money, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const per=v.bagCost+v.stickerCost+v.sampleCost+v.otherCost;
  return { rows:[money('total','おまけ・資材の総額',per*v.orders),money('per','1注文あたり隠れ原価',per),quantity('orders','注文数',v.orders,'件')] };
}
