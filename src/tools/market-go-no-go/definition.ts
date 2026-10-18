import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'market-go-no-go',
  slug: 'market-go-no-go',
  name: 'マルシェGO / NO-GO',
  shortDescription: '出店費と予想販売から出店判断材料をまとめる。',
  route: '/tools/market-go-no-go',
  category: '出店',
  order: 23,
  fields: fields([["booth","出店料","円","money"],["travel","交通費","円","money"],["parking","駐車料金","円","money"],["price","平均販売単価","円","money"],["unitCost","平均原価","円","money"],["expectedQuantity","予想販売数","個","quantity"]]),
  status: 'draft',
  proIdea: '雨天・客数・販売数の3シナリオ比較。',
  formulaNote: '既存マルシェ計算より事前判断に特化し、損益と必要販売数をまとめる。',
} satisfies DraftToolDefinition<'market-go-no-go'>;
