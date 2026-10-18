import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'tax-inclusive-exclusive',
  slug: 'tax-inclusive-exclusive',
  name: '税込・税抜まとめ変換',
  shortDescription: '複数金額の税込・税抜をまとめて変換。',
  route: '/tools/tax-inclusive-exclusive',
  category: '税・経費',
  order: 12,
  fields: fields([["amount","金額","円","money"],["taxRate","税率","%","percent"]]),
  status: 'draft',
  proIdea: '複数行一括変換とCSV。',
  formulaNote: '税込→税抜 / 税抜→税込、端数処理はUI選択式を追加する。',
} satisfies DraftToolDefinition<'tax-inclusive-exclusive'>;
