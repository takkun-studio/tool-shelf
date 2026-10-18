import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'sell-to-go-home',
  slug: 'sell-to-go-home',
  name: '今日あと何個売れば帰れる？',
  shortDescription: '今日の固定費を回収するまで、あと何個売ればいいかを計算。',
  route: '/tools/sell-to-go-home',
  access: 'free',
  minimumPlan: 'free',
  category: '出店',
  order: 32,
  fields: fields([["fixedCost","今日の固定費","円","money"],["currentContribution","現在までの限界利益","円","money"],["unitMargin","1個売るごとの限界利益","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'sell-to-go-home'>;
