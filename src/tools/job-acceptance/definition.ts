import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'job-acceptance',
  slug: 'job-acceptance',
  name: 'この案件受ける？',
  shortDescription: '報酬・工数・移動・経費から実質時給を出す。',
  route: '/tools/job-acceptance',
  category: 'サービス',
  order: 24,
  fields: fields([["fee","報酬","円","money"],["workHours","作業時間","時間","quantity"],["travelHours","移動時間","時間","quantity"],["expenses","経費","円","money"],["reserveRate","税取り置き率","%","percent"]]),
  status: 'draft',
  proIdea: '案件A/B比較と最低受注額逆算。',
  formulaNote: '手取り概算÷総拘束時間で実質時給を出す。',
} satisfies DraftToolDefinition<'job-acceptance'>;
