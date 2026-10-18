import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'payout',
  slug: 'payout',
  name: '手取り売上計算',
  shortDescription: '販売手数料・決済手数料後の受取額を確認。',
  route: '/tools/payout',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 5,
  fields: fields([["price","販売価格","円","money"],["cost","商品原価","円","money"],["shipping","送料","円","money"],["salesFeeRate","販売手数料率","%","percent"],["paymentFeeRate","決済手数料率","%","percent"],["fixedFee","固定手数料","円","money"],["other","その他経費","円","money"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'payout'>;
