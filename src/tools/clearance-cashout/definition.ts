import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'clearance-cashout',
  slug: 'clearance-cashout',
  name: '売れ残り現金化ライン',
  shortDescription: '在庫を値下げして現金化する境目を考える。',
  route: '/tools/clearance-cashout',
  category: '在庫',
  order: 34,
  fields: fields([["unitCost","1個あたり原価","円","money"],["currentPrice","現在価格","円","money"],["stock","在庫数","個","quantity"],["monthlyHoldingCost","月間保管コスト","円","money"],["monthsHeld","保有月数","月","quantity"]]),
  status: 'draft',
  proIdea: '値引率ごとの回収額と在庫圧縮効果を比較。',
  formulaNote: '保管コストと回収額を並べ、値下げ候補を比較する。',
} satisfies DraftToolDefinition<'clearance-cashout'>;
