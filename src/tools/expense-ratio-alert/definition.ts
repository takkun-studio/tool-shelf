import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'expense-ratio-alert',
  slug: 'expense-ratio-alert',
  name: '経費使いすぎ警報',
  shortDescription: '売上に対する経費率を見える化し、自分で決めた警戒ラインと比較。',
  route: '/tools/expense-ratio-alert',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 19,
  fields: fields([["sales","売上","円","money"],["expenses","経費","円","money"],["alertRate","警戒ライン","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'expense-ratio-alert'>;
