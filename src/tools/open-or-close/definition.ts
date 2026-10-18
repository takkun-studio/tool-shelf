import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'open-or-close',
  slug: 'open-or-close',
  name: '今日、店開ける意味ある？',
  shortDescription: '営業した時だけ増える売上・費用から、開店する日の増分利益を計算。',
  route: '/tools/open-or-close',
  access: 'free',
  minimumPlan: 'free',
  category: '出店',
  order: 38,
  fields: fields([["expectedSales","予想売上","円","money"],["variableCostRate","変動費率","%","percent"],["travel","移動費","円","money"],["staffing","人件費","円","money"],["otherOpenCost","その他営業費","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'open-or-close'>;
