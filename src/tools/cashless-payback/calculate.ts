import { money, percent, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const g=v.grossMarginRate/100,f=v.feeRate/100,s=v.cashlessShare/100,x=v.salesIncreaseRate/100;
  const newSales=v.monthlySales*(1+x);
  const incrementalGross=v.monthlySales*x*g;
  const fees=newSales*s*f+v.fixedCost;
  const impact=incrementalGross-fees;
  const denom=v.monthlySales*(g-s*f);
  const breakEven=denom<=0?null:(v.monthlySales*s*f+v.fixedCost)/denom*100;
  return { loss:impact<0, summary:impact>=0?'入力条件では導入効果が決済コストを上回ります。':'入力条件では決済コストの方が大きいです。', rows:[money('impact','月利益への増減',impact),money('incrementalGross','売上増による粗利増',incrementalGross),money('fees','決済コスト',fees),percent('breakEven','損益分岐の売上増加率',breakEven)] };
}
