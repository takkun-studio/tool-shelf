import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'month-end-cash-forecast',
  slug: 'month-end-cash-forecast',
  name: '月末残高予報',
  shortDescription: '現在残高と入出金予定から月末現金を予測。',
  route: '/tools/month-end-cash-forecast',
  access: 'free',
  minimumPlan: 'free',
  category: '資金',
  order: 20,
  fields: fields([["currentCash","現在残高","円","money"],["incoming","入金予定","円","money"],["outgoing","支払予定","円","money"],["taxReserve","税金取り置き","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'month-end-cash-forecast'>;
