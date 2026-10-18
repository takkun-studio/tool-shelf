import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'invoice-impact',
  slug: 'invoice-impact',
  name: 'インボイス影響ざっくり計算',
  shortDescription: '設定条件から手取り差を概算比較。',
  route: '/tools/invoice-impact',
  category: '税・経費',
  order: 18,
  fields: fields([["sales","対象売上","円","money"],["taxableRate","対象割合","%","percent"],["taxRate","消費税率","%","percent"]]),
  status: 'draft',
  proIdea: '条件A/B比較と年度別設定保存。',
  formulaNote: '制度条件は固定せず入力式。正式な税額計算ではなく差額概算。',
} satisfies DraftToolDefinition<'invoice-impact'>;
