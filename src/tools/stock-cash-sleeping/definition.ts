import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'stock-cash-sleeping',
  slug: 'stock-cash-sleeping',
  name: '棚に現金いくら寝てる？',
  shortDescription: '在庫個数を仕入原価ベースの拘束資金に変換して表示。',
  route: '/tools/stock-cash-sleeping',
  access: 'free',
  minimumPlan: 'free',
  category: '在庫',
  order: 39,
  fields: fields([["stock","在庫数","個","quantity"],["unitCost","1個あたり仕入原価","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'stock-cash-sleeping'>;
