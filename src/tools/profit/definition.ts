import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'profit',
  slug: 'profit',
  name: '原価・利益計算',
  shortDescription: '売価から実際に残る利益と損益ゼロ売価を確認。',
  route: '/tools/profit',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 1,
  fields: fields([["price","売価","円","money"],["cost","商品原価","円","money"],["shipping","送料","円","money"],["feeRate","販売手数料率","%","percent"],["fixedFee","固定手数料","円","money"],["other","その他経費","円","money"]]),
  status: 'published',
  workerApi: false,
} satisfies ToolDefinition<'profit'>;
