import { money, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const remaining=Math.max(0,v.fixedCost-v.currentContribution);
  if (remaining>0 && v.unitMargin<=0) return { status:'1個売るごとの限界利益が0円のため回収できません', rows:[quantity('count','あと必要な販売数',null),money('remaining','残り回収額',remaining)] };
  const count=remaining===0?0:Math.ceil(remaining/v.unitMargin);
  return { summary:count===0?'もう固定費を回収できています。':`あと${count}個で固定費回収ラインです。`, rows:[quantity('count','あと必要な販売数',count),money('remaining','残り回収額',remaining)] };
}
