import { money, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  return { rows:[money('cash','在庫に寝ている仕入資金',v.stock*v.unitCost),quantity('stock','在庫数',v.stock),money('unit','1個あたり仕入原価',v.unitCost)] };
}
