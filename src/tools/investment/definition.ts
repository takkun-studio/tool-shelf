import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'investment',
  slug: 'investment',
  name: '初期投資回収計算',
  shortDescription: '初期費用を回収する件数と目安月数を確認。',
  route: '/tools/investment',
  access: 'free',
  minimumPlan: 'free',
  category: '事業',
  order: 10,
  fields: fields([["initialCost","初期費用","円","money"],["profitPerSale","1件あたり利益","円","money"],["monthlyCount","月間販売・受注数","件","quantity"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'investment'>;
