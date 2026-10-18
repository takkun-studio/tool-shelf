import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'month-end-cash-forecast',
  slug: 'month-end-cash-forecast',
  name: '月末残高予報',
  shortDescription: '現在残高と入出金予定から月末現金を予測。',
  route: '/tools/month-end-cash-forecast',
  category: '資金',
  order: 20,
  fields: fields([["currentCash","現在残高","円","money"],["incoming","入金予定","円","money"],["outgoing","支払予定","円","money"],["taxReserve","税金取り置き","円","money"]]),
  status: 'draft',
  proIdea: '日付付き入出金と資金ショート警告。',
  formulaNote: '月末残高=現在残高+入金予定-支払予定-取り置き。',
} satisfies DraftToolDefinition<'month-end-cash-forecast'>;
