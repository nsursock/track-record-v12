-- Add Stripe-specific columns to ebook_orders
ALTER TABLE ebook_orders 
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Remove Klarna columns if they exist
ALTER TABLE ebook_orders 
  DROP COLUMN IF EXISTS klarna_session_id,
  DROP COLUMN IF EXISTS klarna_order_id;

-- Add indexes for Stripe columns
CREATE INDEX IF NOT EXISTS idx_ebook_orders_stripe_session ON ebook_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_stripe_payment_intent ON ebook_orders(stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_stripe_customer ON ebook_orders(stripe_customer_id); 