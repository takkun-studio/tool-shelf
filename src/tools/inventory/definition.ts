import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'inventory',
  slug: 'inventory',
  name: '在庫回転・仕入れ資金計算',
  shortDescription: '在庫金額と販売ペースから在庫の持ち月数を確認。',
  route: '/tools/inventory',
  access: 'free',
  minimumPlan: 'free',
  category: '在庫',
  order: 8,
  fields: fields([["stock","現在庫数","個","quantity"],["unitCost","1個あたり仕入原価","円","money"],["monthlySales","月間販売数","個","quantity"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'inventory'>;
