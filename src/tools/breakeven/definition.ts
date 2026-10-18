import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'breakeven',
  slug: 'breakeven',
  name: '損益分岐点計算',
  shortDescription: '固定費を回収するための最低販売数を確認。',
  route: '/tools/breakeven',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 2,
  fields: fields([["price","1個あたり販売価格","円","money"],["variableCost","1個あたり変動費","円","money"],["fixedCost","固定費","円","money"]]),
  status: 'published',
  workerApi: false,
} satisfies ToolDefinition<'breakeven'>;
