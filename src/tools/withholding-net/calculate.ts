import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  if (v.lowRate >= 100 || v.highRate >= 100) return { status:'源泉率は100%未満で指定してください', rows:[money('gross','必要請求額',null),money('withholding','源泉徴収額の概算',null)] };
  const low = v.lowRate / 100, high = v.highRate / 100;
  const netAtThreshold = v.threshold * (1 - low);
  const rawGross = v.desiredNet <= netAtThreshold
    ? v.desiredNet / (1 - low)
    : v.threshold + (v.desiredNet - netAtThreshold) / (1 - high);
  const gross = Math.ceil(rawGross);
  return { rows:[money('gross','必要請求額の概算',gross),money('withholding','源泉徴収額の概算',gross-v.desiredNet),money('netAtThreshold','境界額までの手取り',netAtThreshold)] };
}
