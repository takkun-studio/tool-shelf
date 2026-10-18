import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'market-go-no-go',
  slug: 'market-go-no-go',
  name: 'マルシェGO / NO-GO',
  shortDescription: '出店前に、予想販売数で黒字になるかと必要販売数を確認。',
  route: '/tools/market-go-no-go',
  access: 'free',
  minimumPlan: 'free',
  category: '出店',
  order: 23,
  fields: fields([["booth","出店料","円","money"],["travel","交通費","円","money"],["parking","駐車料金","円","money"],["supplies","消耗品費","円","money"],["otherFixed","その他固定経費","円","money"],["price","平均販売単価","円","money"],["unitCost","平均原価","円","money"],["expectedQuantity","予想販売数","個","quantity"],["cashlessRate","キャッシュレス売上比率","%","percent"],["paymentRate","決済手数料率","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'market-go-no-go'>;
