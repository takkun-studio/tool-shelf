import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'price-increase-impact',
  slug: 'price-increase-impact',
  name: '値上げしたらどうなる？',
  shortDescription: '値上げ幅と販売数減少予想から、月利益の増減を比較。',
  route: '/tools/price-increase-impact',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 25,
  fields: fields([["currentPrice","現在価格","円","money"],["newPrice","値上げ後価格","円","money"],["currentQuantity","現在月販数","個","quantity"],["decreaseRate","販売数減少予想","%","percent"],["unitCost","1個あたり原価","円","money"],["feeRate","販売手数料率","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'price-increase-impact'>;
