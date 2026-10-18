import { money, percent, quantity, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const margin = values.price - values.variableCost;
  if (values.fixedCost === 0) {
    return { rows: [
      money('margin', '1個あたり限界利益', margin),
      percent('marginRate', '限界利益率', values.price === 0 ? null : margin / values.price * 100),
      quantity('breakEvenQuantity', '損益分岐点数量', 0),
      money('breakEvenSales', '損益分岐点売上', 0),
    ] };
  }
  if (margin <= 0) {
    return {
      status: '販売するほど固定費を回収できない状態',
      rows: [
        money('margin', '1個あたり限界利益', margin),
        percent('marginRate', '限界利益率', values.price === 0 ? null : margin / values.price * 100),
        quantity('breakEvenQuantity', '損益分岐点数量', null),
        money('breakEvenSales', '損益分岐点売上', null),
      ],
    };
  }
  const count = Math.ceil(values.fixedCost / margin);
  return { rows: [
    money('margin', '1個あたり限界利益', margin),
    percent('marginRate', '限界利益率', margin / values.price * 100),
    quantity('breakEvenQuantity', '損益分岐点数量', count),
    money('breakEvenSales', '損益分岐点売上', count * values.price),
  ] };
}
