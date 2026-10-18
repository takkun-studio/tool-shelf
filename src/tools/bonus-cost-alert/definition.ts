import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'bonus-cost-alert',
  slug: 'bonus-cost-alert',
  name: 'おまけ付けすぎ警報',
  shortDescription: '袋・シール・サンプルなど、1注文ごとの隠れ原価を合計。',
  route: '/tools/bonus-cost-alert',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 33,
  fields: fields([["orders","注文数","件","quantity"],["bagCost","袋1件分","円","money"],["stickerCost","シール1件分","円","money"],["sampleCost","サンプル1件分","円","money"],["otherCost","その他1件分","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'bonus-cost-alert'>;
