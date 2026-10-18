import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'points-vs-discount',
  slug: 'points-vs-discount',
  name: 'ポイント還元 vs 値引き',
  shortDescription: '値引きの即時負担と、ポイントの期待負担を比較。',
  route: '/tools/points-vs-discount',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 35,
  fields: fields([["price","販売価格","円","money"],["discountRate","値引率","%","percent"],["pointRate","ポイント還元率","%","percent"],["pointUseRate","ポイント利用率","%","percent"],["pointCostRate","利用ポイントの店負担率","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: 'ポイント負担は、発行率・利用率・利用時の店負担率を掛けた期待値です。',
} satisfies ToolDefinition<'points-vs-discount'>;
