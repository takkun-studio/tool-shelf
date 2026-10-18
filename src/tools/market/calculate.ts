import { money, percent, quantity, type CalculatorResult } from '../types';

export function calculate(values: Record<string, number>): CalculatorResult {
  const sales = values.price * values.quantity;
  const payment = sales * values.cashlessRate / 100 * values.paymentRate / 100;
  const fixed = values.booth + values.travel + values.parking + values.supplies + values.otherFixed;
  const total = values.unitCost * values.quantity + payment + fixed;
  const profit = sales - total;
  const unitMargin = values.price - (values.unitCost + values.price * values.cashlessRate / 100 * values.paymentRate / 100);
  const impossible = fixed > 0 && unitMargin <= 0;
  const count = fixed === 0 ? 0 : impossible ? null : Math.ceil(fixed / unitMargin);
  return {
    loss: profit < 0,
    status: impossible ? '販売するほど固定費を回収できない状態' : undefined,
    rows: [
      money('sales', '売上', sales),
      money('total', '総コスト', total),
      money('profit', '最終利益', profit),
      percent('profitRate', '利益率', sales === 0 ? null : profit / sales * 100),
      money('payment', 'キャッシュレス決済手数料', payment),
      money('unitMargin', '1個あたり限界利益', unitMargin),
      quantity('breakEvenQuantity', '損益分岐点数量', count),
      money('breakEvenSales', '損益分岐点売上', count === null ? null : count * values.price),
    ],
  };
}
