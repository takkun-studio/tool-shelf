export const plans=['free','basic','standard','unlimited'] as const;
export type Plan=typeof plans[number];
export const planRank:Record<Plan,number>={free:0,basic:1,standard:2,unlimited:3};
export const isPlan=(value:unknown):value is Plan=>typeof value==='string'&&plans.includes(value as Plan);
