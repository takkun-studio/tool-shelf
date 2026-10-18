import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'market',
  slug: 'market',
  name: 'マルシェ出店収支計算',
  shortDescription: 'イベント出店の利益と黒字に必要な販売数を確認。',
  route: '/tools/market',
  access: 'free',
  minimumPlan: 'free',
  category: '出店',
  order: 3,
  fields: fields([["price","平均販売単価","円","money"],["quantity","販売個数","個","quantity"],["unitCost","1個あたり商品原価","円","money"],["booth","出店料","円","money"],["travel","交通費","円","money"],["parking","駐車料金","円","money"],["supplies","消耗品費","円","money"],["otherFixed","その他固定経費","円","money"],["cashlessRate","キャッシュレス売上比率","%","percent"],["paymentRate","キャッシュレス決済手数料率","%","percent"]]),
  status: 'published',
  workerApi: false,
} satisfies ToolDefinition<'market'>;
