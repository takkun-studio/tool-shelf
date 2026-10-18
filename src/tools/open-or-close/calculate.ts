import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const fixed=v.travel+v.staffing+v.otherOpenCost;
  const margin=1-v.variableCostRate/100;
  const profit=v.expectedSales*margin-fixed;
  const required=margin<=0?null:Math.ceil(fixed/margin);
  return { loss:profit<0, summary:profit>=0?'営業することで増分利益が出る見込みです。':'営業すると増分赤字になる見込みです。', rows:[money('profit','営業日の増分利益',profit),money('required','黒字化に必要な売上',required),money('openCost','営業する日に増える固定費',fixed)] };
}
