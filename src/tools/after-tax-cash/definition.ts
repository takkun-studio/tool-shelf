import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'after-tax-cash',
  slug: 'after-tax-cash',
  name: '税引後ほんまに残る額',
  shortDescription: '売上・経費・税取り置きを引いて残る現金を表示。',
  route: '/tools/after-tax-cash',
  category: '税・経費',
  order: 17,
  fields: fields([["sales","売上","円","money"],["expenses","経費","円","money"],["reserveRate","税金取り置き率","%","percent"]]),
  status: 'draft',
  proIdea: '月別推移と累計。',
  formulaNote: '利益=売上-経費、取り置き=利益×設定率、残額=利益-取り置き。',
} satisfies DraftToolDefinition<'after-tax-cash'>;
