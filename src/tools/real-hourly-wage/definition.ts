import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'real-hourly-wage',
  slug: 'real-hourly-wage',
  name: '実質時給を見て泣く計算機',
  shortDescription: '制作・撮影・梱包・発送・接客まで含めた本当の時給を出す。',
  route: '/tools/real-hourly-wage',
  category: 'サービス',
  order: 31,
  fields: fields([["profit","最終利益","円","money"],["productionHours","制作時間","時間","quantity"],["listingHours","撮影・出品時間","時間","quantity"],["packingHours","梱包時間","時間","quantity"],["shippingHours","発送時間","時間","quantity"],["customerHours","接客・連絡時間","時間","quantity"]]),
  status: 'draft',
  proIdea: '工程別に時間を保存し、商品ごとの実質時給を比較。',
  formulaNote: '利益÷総作業時間。隠れ作業時間を可視化する。',
} satisfies DraftToolDefinition<'real-hourly-wage'>;
