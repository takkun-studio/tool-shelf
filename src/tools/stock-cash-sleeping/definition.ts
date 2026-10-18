import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'stock-cash-sleeping',
  slug: 'stock-cash-sleeping',
  name: '棚に現金いくら寝てる？',
  shortDescription: '在庫個数を仕入額ベースの現金に変換して表示。',
  route: '/tools/stock-cash-sleeping',
  category: '在庫',
  order: 39,
  fields: fields([["stock","在庫数","個","quantity"],["unitCost","1個あたり仕入原価","円","money"]]),
  status: 'draft',
  proIdea: 'カテゴリ別・商品別の在庫資金ランキング。',
  formulaNote: '在庫数×仕入原価で拘束資金を可視化する。',
} satisfies DraftToolDefinition<'stock-cash-sleeping'>;
