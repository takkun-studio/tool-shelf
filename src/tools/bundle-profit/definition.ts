import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'bundle-profit',
  slug: 'bundle-profit',
  name: '福袋・セット組み計算',
  shortDescription: '複数商品の合計原価から安全なセット価格を探す。',
  route: '/tools/bundle-profit',
  category: '販売',
  order: 26,
  fields: fields([["itemCostTotal","商品原価合計","円","money"],["packageCost","梱包費","円","money"],["shipping","送料","円","money"],["sellingPrice","セット販売価格","円","money"],["feeRate","販売手数料率","%","percent"]]),
  status: 'draft',
  proIdea: '組み合わせ候補を複数保存して利益順に比較。',
  formulaNote: 'セット全体の利益・利益率・最低安全価格を出す。',
} satisfies DraftToolDefinition<'bundle-profit'>;
