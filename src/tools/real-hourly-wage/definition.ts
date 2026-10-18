import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'real-hourly-wage',
  slug: 'real-hourly-wage',
  name: '実質時給を見て泣く計算機',
  shortDescription: '制作・撮影・梱包・発送・接客まで含めた本当の時給を出す。',
  route: '/tools/real-hourly-wage',
  access: 'free',
  minimumPlan: 'free',
  category: 'サービス',
  order: 31,
  fields: fields([["profit","最終利益","円","money"],["productionHours","制作時間","時間","quantity",{"allowDecimal":true}],["listingHours","撮影・出品時間","時間","quantity",{"allowDecimal":true}],["packingHours","梱包時間","時間","quantity",{"allowDecimal":true}],["shippingHours","発送時間","時間","quantity",{"allowDecimal":true}],["customerHours","接客・連絡時間","時間","quantity",{"allowDecimal":true}]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'real-hourly-wage'>;
