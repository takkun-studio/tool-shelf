import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'open-or-close',
  slug: 'open-or-close',
  name: '今日、店開ける意味ある？',
  shortDescription: '予想売上と営業コストから営業日の損益を見る。',
  route: '/tools/open-or-close',
  category: '出店',
  order: 38,
  fields: fields([["expectedSales","予想売上","円","money"],["variableCostRate","変動費率","%","percent"],["travel","移動費","円","money"],["staffing","人件費","円","money"],["otherOpenCost","その他営業費","円","money"]]),
  status: 'draft',
  proIdea: '天候・客数別の3シナリオ比較。',
  formulaNote: '開店した場合の予想利益を出し、休業時との差を比較する。',
} satisfies DraftToolDefinition<'open-or-close'>;
