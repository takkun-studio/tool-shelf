import { money, percent, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const rate = v.taxRate / 100;
  const includedTax = rate === 0 ? 0 : v.purchaseTaxIncluded * rate / (1 + rate);
  const credit = includedTax * v.creditRate / 100;
  return { rows:[money('lostCredit','全額控除との差額',includedTax-credit),money('includedTax','対象仕入に含まれる消費税の概算',includedTax),money('credit','控除できる額の概算',credit),percent('creditRate','設定した控除割合',v.creditRate)] };
}
