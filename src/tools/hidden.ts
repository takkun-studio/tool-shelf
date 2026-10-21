import { tool as tax_reserve } from './tax-reserve';
import { tool as tax_inclusive_exclusive } from './tax-inclusive-exclusive';
import { tool as withholding_net } from './withholding-net';
import { tool as home_business_apportionment } from './home-business-apportionment';
import { tool as expense_effective_cost } from './expense-effective-cost';
import { tool as fixed_asset_comparison } from './fixed-asset-comparison';
import { tool as after_tax_cash } from './after-tax-cash';
import { tool as invoice_impact } from './invoice-impact';
import { tool as expense_ratio_alert } from './expense-ratio-alert';
import { tool as month_end_cash_forecast } from './month-end-cash-forecast';
import { tool as price_one_shot } from './price-one-shot';
import { tool as purchase_go_no_go } from './purchase-go-no-go';
import { tool as market_go_no_go } from './market-go-no-go';
import { tool as job_acceptance } from './job-acceptance';
import { tool as price_increase_impact } from './price-increase-impact';
import { tool as bundle_profit } from './bundle-profit';
import { tool as free_shipping_threshold } from './free-shipping-threshold';
import { tool as coupon_safety } from './coupon-safety';
import { tool as preorder_stock } from './preorder-stock';
import { tool as cash_cycle } from './cash-cycle';
import { tool as real_hourly_wage } from './real-hourly-wage';
import { tool as sell_to_go_home } from './sell-to-go-home';
import { tool as bonus_cost_alert } from './bonus-cost-alert';
import { tool as clearance_cashout } from './clearance-cashout';
import { tool as points_vs_discount } from './points-vs-discount';
import { tool as cashless_payback } from './cashless-payback';
import { tool as ad_cost_units } from './ad-cost-units';
import { tool as open_or_close } from './open-or-close';
import { tool as stock_cash_sleeping } from './stock-cash-sleeping';
import { tool as one_yen_discount_impact } from './one-yen-discount-impact';

export const hiddenToolModules = [
  tax_reserve,
  tax_inclusive_exclusive,
  withholding_net,
  home_business_apportionment,
  expense_effective_cost,
  fixed_asset_comparison,
  after_tax_cash,
  invoice_impact,
  expense_ratio_alert,
  month_end_cash_forecast,
  price_one_shot,
  purchase_go_no_go,
  market_go_no_go,
  job_acceptance,
  price_increase_impact,
  bundle_profit,
  free_shipping_threshold,
  coupon_safety,
  preorder_stock,
  cash_cycle,
  real_hourly_wage,
  sell_to_go_home,
  bonus_cost_alert,
  clearance_cashout,
  points_vs_discount,
  cashless_payback,
  ad_cost_units,
  open_or_close,
  stock_cash_sleeping,
  one_yen_discount_impact,
] as const;

export const hiddenTools = hiddenToolModules.map((module) => module.definition);
