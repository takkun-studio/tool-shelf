import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'discount',
  slug: 'discount',
  name: '値引き・セール利益計算',
  shortDescription: '値引き後の利益と赤字にならない目安を確認。',
  route: '/tools/discount',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 4,
  fields: fields([["listPrice","通常価格","円","money"],["discountRate","値引率","%","percent"],["cost","商品原価","円","money"],["shipping","送料","円","money"],["feeRate","販売手数料率","%","percent"],["fixedFee","固定手数料","円","money"],["other","その他経費","円","money"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'discount'>;
