import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const deductible = v.purchase * v.businessRate / 100;
  const reduction = deductible * v.estimatedTaxRate / 100;
  return { rows:[money('effective','税負担軽減を考えた実質負担の概算',v.purchase-reduction),money('deductible','経費算入対象額の想定',deductible),money('reduction','税負担軽減額の概算',reduction)] };
}
