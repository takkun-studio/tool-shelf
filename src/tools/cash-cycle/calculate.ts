import { money, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.cycles===0) return { rows:[money('ending','終了時残高',v.startingCash),quantity('completed','実行できる回転数',0,'回'),money('change','資金増減',0)] };
  if (v.startingCash<v.purchasePerCycle) return { status:'1回目の仕入資金が足りません', rows:[money('ending','終了時残高',v.startingCash),quantity('completed','実行できる回転数',0,'回'),money('change','資金増減',0)] };
  const delta=v.revenuePerCycle-v.purchasePerCycle;
  let possible=v.cycles;
  if (delta<0) possible=Math.min(v.cycles,Math.floor((v.startingCash-v.purchasePerCycle)/(-delta))+1);
  const ending=v.startingCash+possible*delta;
  return { summary:possible<v.cycles?`${v.cycles}回の予定中、${possible}回まで仕入可能です。`:'指定した回転数を資金ショートせず回せます。', rows:[money('ending','終了時残高',ending),quantity('completed','実行できる回転数',possible,'回'),money('change','資金増減',ending-v.startingCash)] };
}
