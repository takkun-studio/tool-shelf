import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const margin=1-v.averageCostRate/100-v.feeRate/100;
  if (margin<=0) return { status:'原価率と手数料率の合計が100%以上です', rows:[money('threshold','送料無料にできる最低注文額',null)] };
  const threshold=Math.ceil((v.shipping+v.targetProfit)/margin);
  return { rows:[money('threshold','送料無料にできる最低注文額',threshold),money('shipping','想定送料',v.shipping),money('target','確保したい利益',v.targetProfit)] };
}
