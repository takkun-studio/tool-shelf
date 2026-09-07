ALTER TABLE entitlements ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE entitlements ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE entitlements ADD COLUMN stripe_price_id TEXT;
ALTER TABLE entitlements ADD COLUMN subscription_status TEXT;
ALTER TABLE entitlements ADD COLUMN current_period_end INTEGER;
ALTER TABLE entitlements ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_stripe_customer_id_unique ON entitlements (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_stripe_subscription_id_unique ON entitlements (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
