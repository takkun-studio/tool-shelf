import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'sell-to-go-home',
  slug: 'sell-to-go-home',
  name: '今日あと何個売れば帰れる？',
  shortDescription: '現在の利益から黒字化まで残り何個かを表示。',
  route: '/tools/sell-to-go-home',
  category: '出店',
  order: 32,
  fields: fields([["fixedCost","今日の固定費","円","money"],["currentContribution","現在までの限界利益","円","money"],["unitMargin","1個売るごとの利益","円","money"]]),
  status: 'draft',
  proIdea: '売上入力ごとに残り個数をライブ更新。',
  formulaNote: '残固定費を1個あたり利益で割って切り上げる。',
} satisfies DraftToolDefinition<'sell-to-go-home'>;
