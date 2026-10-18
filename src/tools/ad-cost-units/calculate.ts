import { money, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.profitPerSale<=0) return { status:'1個あたり利益が0円のため回収できません', rows:[quantity('count','広告費回収に必要な販売数',null),money('ad','広告費',v.adSpend)] };
  const count=Math.ceil(v.adSpend/v.profitPerSale);
  return { rows:[quantity('count','広告費回収に必要な販売数',count),money('profitNeeded','回収ラインの利益合計',count*v.profitPerSale),money('ad','広告費',v.adSpend)] };
}
