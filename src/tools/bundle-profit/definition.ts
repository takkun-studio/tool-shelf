import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'bundle-profit',
  slug: 'bundle-profit',
  name: '福袋・セット組み計算',
  shortDescription: '複数商品の合計原価から、セット販売の利益と最低安全価格を確認。',
  route: '/tools/bundle-profit',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 26,
  fields: fields([["itemCostTotal","商品原価合計","円","money"],["packageCost","梱包費","円","money"],["shipping","送料","円","money"],["sellingPrice","セット販売価格","円","money"],["feeRate","販売手数料率","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'bundle-profit'>;
