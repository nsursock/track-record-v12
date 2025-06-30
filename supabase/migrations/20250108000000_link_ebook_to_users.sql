-- Migration to link ebook purchases to user accounts
-- Add user_id column and update existing structure

-- Add user_id column to ebook_orders (nullable for existing orders)
ALTER TABLE ebook_orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Stripe columns should already exist from previous migration, but let's make sure
-- These were added in 20250107000001_update_for_stripe.sql
ALTER TABLE ebook_orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE ebook_orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Drop Klarna columns that are no longer needed (if they exist)
ALTER TABLE ebook_orders DROP COLUMN IF EXISTS klarna_session_id;
ALTER TABLE ebook_orders DROP COLUMN IF EXISTS klarna_order_id;

-- Update indexes
DROP INDEX IF EXISTS idx_ebook_orders_klarna_session;
DROP INDEX IF EXISTS idx_ebook_orders_klarna_order;
CREATE INDEX IF NOT EXISTS idx_ebook_orders_user_id ON ebook_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_stripe_session ON ebook_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_stripe_payment_intent ON ebook_orders(stripe_payment_intent_id);

-- Update policies for user access (PostgreSQL doesn't support IF NOT EXISTS for policies)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'ebook_orders' 
        AND policyname = 'Users can view their own ebook orders'
    ) THEN
        CREATE POLICY "Users can view their own ebook orders" ON ebook_orders
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create a helper function to check if a user has purchased the ebook
CREATE OR REPLACE FUNCTION user_has_ebook_access(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM ebook_orders 
        WHERE user_id = check_user_id 
        AND status = 'completed'
        AND product = '6-life-principles-ebook'
    );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION user_has_ebook_access TO authenticated, anon; 