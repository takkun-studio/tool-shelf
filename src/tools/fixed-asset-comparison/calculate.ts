import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.years === 0) return { status:'比較年数は1年以上にしてください', rows:[money('cashOut','購入時の資金流出',v.purchase),money('annual','年あたり配分イメージ',null),money('monthly','月あたり配分イメージ',null)] };
  const business = v.purchase * v.businessRate / 100;
  const annual = business / v.years;
  return { summary:'年割額は資金繰り比較用の参考値です。税務上の減価償却額ではありません。', rows:[money('cashOut','購入時の資金流出',v.purchase),money('business','事業利用分の購入額',business),money('annual','年あたり配分イメージ',annual),money('monthly','月あたり配分イメージ',annual/12)] };
}
