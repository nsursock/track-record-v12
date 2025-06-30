-- Create ebook orders table
CREATE TABLE IF NOT EXISTS ebook_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    amount INTEGER NOT NULL, -- amount in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    product TEXT NOT NULL,
    klarna_session_id TEXT,
    klarna_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create download tokens table
CREATE TABLE IF NOT EXISTS download_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES ebook_orders(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    downloads_remaining INTEGER NOT NULL DEFAULT 3,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create download logs table
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL REFERENCES download_tokens(token) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES ebook_orders(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ebook_orders_email ON ebook_orders(email);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_status ON ebook_orders(status);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_klarna_session ON ebook_orders(klarna_session_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_klarna_order ON ebook_orders(klarna_order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires ON download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_token ON download_logs(token);
CREATE INDEX IF NOT EXISTS idx_download_logs_order_id ON download_logs(order_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for ebook_orders updated_at
CREATE TRIGGER update_ebook_orders_updated_at
    BEFORE UPDATE ON ebook_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ebook_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (API endpoints will use service role)
-- These policies allow the service role to do anything
CREATE POLICY "Service role has full access to ebook_orders" ON ebook_orders
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to download_tokens" ON download_tokens
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to download_logs" ON download_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for authenticated users (if needed later for admin interface)
CREATE POLICY "Authenticated users can view their own orders" ON ebook_orders
    FOR SELECT USING (auth.uid() IS NOT NULL AND email = auth.email());

-- Grant necessary permissions
GRANT ALL ON ebook_orders TO service_role;
GRANT ALL ON download_tokens TO service_role;
GRANT ALL ON download_logs TO service_role; 