import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'cash-cycle',
  slug: 'cash-cycle',
  name: '仕入れ→販売→再発注シミュレーター',
  shortDescription: '固定ロットの仕入れと回収を繰り返した時の現金推移を確認。',
  route: '/tools/cash-cycle',
  access: 'free',
  minimumPlan: 'free',
  category: '資金',
  order: 30,
  fields: fields([["startingCash","開始資金","円","money"],["purchasePerCycle","1周あたり仕入額","円","money"],["revenuePerCycle","1周あたり回収額","円","money"],["cycles","回転数","回","quantity"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'cash-cycle'>;
