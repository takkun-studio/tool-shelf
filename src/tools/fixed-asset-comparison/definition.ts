import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'fixed-asset-comparison',
  slug: 'fixed-asset-comparison',
  name: '固定資産ざっくり比較',
  shortDescription: '高額購入を一括負担と年分割で比較。',
  route: '/tools/fixed-asset-comparison',
  category: '税・経費',
  order: 16,
  fields: fields([["purchase","購入額","円","money"],["years","分割年数","個","quantity"]]),
  status: 'draft',
  proIdea: '年別キャッシュ負担表。',
  formulaNote: '税制上の可否を自動断定せず、資金負担の比較に限定する。',
} satisfies DraftToolDefinition<'fixed-asset-comparison'>;
