import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'job-acceptance',
  slug: 'job-acceptance',
  name: 'この案件受ける？',
  shortDescription: '報酬・工数・移動・経費・取り置きから実質時給を確認。',
  route: '/tools/job-acceptance',
  access: 'free',
  minimumPlan: 'free',
  category: 'サービス',
  order: 24,
  fields: fields([["fee","報酬","円","money"],["workHours","作業時間","時間","quantity",{"allowDecimal":true}],["travelHours","移動時間","時間","quantity",{"allowDecimal":true}],["expenses","経費","円","money"],["reserveRate","税取り置き率","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'job-acceptance'>;
