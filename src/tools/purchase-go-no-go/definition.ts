import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'purchase-go-no-go',
  slug: 'purchase-go-no-go',
  name: 'この仕入れ、買ってええ？',
  shortDescription: '利益率・在庫期間・資金から仕入れ判断材料をまとめる。',
  route: '/tools/purchase-go-no-go',
  category: '仕入れ',
  order: 22,
  fields: fields([["purchaseCost","仕入総額","円","money"],["expectedSales","見込売上","円","money"],["expectedMonths","売り切り見込月数","月","quantity"],["availableCash","現在使える資金","円","money"]]),
  status: 'draft',
  proIdea: '複数仕入れ候補ランキング。',
  formulaNote: 'GO/注意は設定閾値による補助表示。断定的な投資判断にはしない。',
} satisfies DraftToolDefinition<'purchase-go-no-go'>;
