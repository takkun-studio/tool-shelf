import { money, percent, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.sales === 0) return { status:'売上が0円のため経費率を計算できません', rows:[percent('ratio','経費率',null),money('expenses','経費',v.expenses)] };
  const ratio = v.expenses / v.sales * 100;
  return { summary:ratio>v.alertRate?'設定した警戒ラインを超えています。':'設定した警戒ライン以内です。', rows:[percent('ratio','経費率',ratio),money('expenses','経費',v.expenses),percent('alert','警戒ライン',v.alertRate)] };
}
