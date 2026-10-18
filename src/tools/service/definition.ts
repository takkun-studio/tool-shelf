import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'service',
  slug: 'service',
  name: 'サービス料金設計',
  shortDescription: '目標時給と作業時間から必要な料金を確認。',
  route: '/tools/service',
  access: 'free',
  minimumPlan: 'free',
  category: 'サービス',
  order: 6,
  fields: fields([["hourlyRate","目標時給","円","money"],["hours","作業時間","時間","quantity",{"allowDecimal":true}],["expenses","1件あたり経費","円","money"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'service'>;
