import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'ad-cost-units',
  slug: 'ad-cost-units',
  name: 'その広告、商品何個分？',
  shortDescription: '広告費を回収するのに必要な販売個数へ変換。',
  route: '/tools/ad-cost-units',
  access: 'free',
  minimumPlan: 'free',
  category: '広告',
  order: 37,
  fields: fields([["adSpend","広告費","円","money"],["profitPerSale","1個あたり利益","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'ad-cost-units'>;
