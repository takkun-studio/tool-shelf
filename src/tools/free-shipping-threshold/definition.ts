import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'free-shipping-threshold',
  slug: 'free-shipping-threshold',
  name: '送料無料ライン決定',
  shortDescription: '平均原価率・手数料率・送料・欲しい利益から、安全な送料無料ラインを逆算。',
  route: '/tools/free-shipping-threshold',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 27,
  fields: fields([["averageCostRate","平均原価率","%","percent"],["feeRate","販売手数料率","%","percent"],["shipping","平均送料","円","money"],["targetProfit","1注文あたり欲しい利益","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'free-shipping-threshold'>;
