import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'target',
  slug: 'target',
  name: '月次売上目標計算',
  shortDescription: '目標利益から必要な販売数と売上を逆算。',
  route: '/tools/target',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 7,
  fields: fields([["targetProfit","目標利益","円","money"],["profitPerSale","1件あたり利益","円","money"],["price","1件あたり販売価格","円","money"],["fixedCost","月間固定費","円","money"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'target'>;
