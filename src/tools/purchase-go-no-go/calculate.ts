import { money, percent, numberResult, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const fee = v.expectedSales * v.feeRate / 100;
  const profit = v.expectedSales - fee - v.purchaseCost - v.shippingTotal - v.otherCosts;
  const roi = v.purchaseCost === 0 ? null : profit / v.purchaseCost * 100;
  const monthly = v.expectedMonths === 0 ? null : profit / v.expectedMonths;
  const affordable = v.purchaseCost <= v.availableCash;
  return { loss:profit<0 || !affordable, summary:!affordable?'手元資金だけでは仕入総額に届きません。':profit<=0?'見込み利益が0円以下です。':'入力条件では黒字見込みです。', rows:[money('profit','見込み利益',profit),percent('roi','仕入額に対する利益率',roi),money('cashAfter','仕入直後の残資金',v.availableCash-v.purchaseCost),numberResult('monthly','月あたり利益目安',monthly,'円/月')] };
}
