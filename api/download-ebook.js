import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Download token required' });
    }

    // Check if this is a status check request
    if (req.query.status === 'true') {
      return handleStatusCheck(token, res);
    }

    // Validate download token
    const { data: downloadToken, error } = await supabase
      .from('download_tokens')
      .select(`
        *,
        ebook_orders (
          email,
          first_name,
          last_name,
          status
        )
      `)
      .eq('token', token)
      .single();

    if (error || !downloadToken) {
      return res.status(404).json({ error: 'Invalid or expired download token' });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(downloadToken.expires_at);
    
    if (now > expiresAt) {
      return res.status(410).json({ error: 'Download token has expired' });
    }

    // Check if downloads remaining
    if (downloadToken.downloads_remaining <= 0) {
      return res.status(410).json({ error: 'Download limit exceeded' });
    }

    // Check if associated order is completed
    if (downloadToken.ebook_orders.status !== 'completed') {
      return res.status(403).json({ error: 'Order not completed' });
    }

    // Update download count
    await supabase
      .from('download_tokens')
      .update({ 
        downloads_remaining: downloadToken.downloads_remaining - 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('token', token);

    // Log download
    await supabase
      .from('download_logs')
      .insert({
        token,
        order_id: downloadToken.order_id,
        ip_address: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || '',
        downloaded_at: new Date().toISOString()
      });

    // Redirect to the actual PDF file
    const baseUrl = process.env.VERCEL_URL?.startsWith('http') 
      ? process.env.VERCEL_URL 
      : process.env.SITE_URL;
    const downloadUrl = `${baseUrl}/assets/pdfs/life-principles-ebook.pdf`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="life-principles-ebook.pdf"');
    
    // Redirect to the PDF file
    return res.redirect(302, downloadUrl);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function for status checks
async function handleStatusCheck(token, res) {
  try {
    const { data: downloadToken, error } = await supabase
      .from('download_tokens')
      .select('downloads_remaining, expires_at')
      .eq('token', token)
      .single();

    if (error || !downloadToken) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    const now = new Date();
    const expiresAt = new Date(downloadToken.expires_at);
    const isExpired = now > expiresAt;

    res.json({
      downloads_remaining: downloadToken.downloads_remaining,
      expires_at: downloadToken.expires_at,
      is_expired: isExpired,
      is_valid: !isExpired && downloadToken.downloads_remaining > 0
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 