import { money, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const end = v.currentCash + v.incoming - v.outgoing - v.taxReserve;
  return { loss:end<0, summary:end<0?'月末に資金不足となる見込みです。':'月末残高はプラスの見込みです。', rows:[money('end','月末予測残高',end),money('incoming','入金予定',v.incoming),money('outgoing','支払＋取り置き',v.outgoing+v.taxReserve)] };
}
