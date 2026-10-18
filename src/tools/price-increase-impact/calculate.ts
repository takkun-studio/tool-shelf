import { money, percent, quantity, type CalculatorResult } from '../types';
export function calculate(v: Record<string, number>): CalculatorResult {
  const f=v.feeRate/100;
  const currentUnit=v.currentPrice*(1-f)-v.unitCost;
  const newUnit=v.newPrice*(1-f)-v.unitCost;
  const newQuantity=v.currentQuantity*(1-v.decreaseRate/100);
  const currentProfit=currentUnit*v.currentQuantity;
  const newProfit=newUnit*newQuantity;
  const breakEvenQuantity=newUnit<=0?null:currentProfit/newUnit;
  const maxDecrease=breakEvenQuantity===null||v.currentQuantity===0?null:(1-breakEvenQuantity/v.currentQuantity)*100;
  return { loss:newProfit<currentProfit, rows:[money('difference','月利益の増減',newProfit-currentProfit),money('current','現在の月利益',currentProfit),money('new','値上げ後の月利益',newProfit),quantity('newQuantity','値上げ後の予想販売数',newQuantity),percent('maxDecrease','利益維持できる販売数減少率',maxDecrease)] };
}
