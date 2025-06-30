import { generateUUID } from './utils/uuid.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get order details
    const { data: order, error } = await supabase
      .from('ebook_orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'completed') {
      // Check if download token already exists
      const { data: existingToken } = await supabase
        .from('download_tokens')
        .select('token, downloads_remaining, expires_at')
        .eq('order_id', order_id)
        .gt('expires_at', new Date().toISOString())
        .gt('downloads_remaining', 0)
        .single();

      if (existingToken) {
        return res.json({ 
          success: true, 
          download_token: existingToken.token,
          download_url: `/api/download-ebook?token=${existingToken.token}`,
          downloads_remaining: existingToken.downloads_remaining
        });
      }

      // Generate new download token if none exists or expired
      const downloadToken = generateUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: tokenError } = await supabase
        .from('download_tokens')
        .insert({
          token: downloadToken,
          order_id: order_id,
          expires_at: expiresAt.toISOString(),
          downloads_remaining: 3,
          created_at: new Date().toISOString()
        });

      if (tokenError) {
        console.error('Token creation error:', tokenError);
        return res.status(500).json({ error: 'Failed to create download token' });
      }

      return res.json({ 
        success: true, 
        download_token: downloadToken,
        download_url: `/api/download-ebook?token=${downloadToken}`,
        downloads_remaining: 3
      });
    }

    res.json({ 
      success: false, 
      status: order.status,
      message: order.status === 'pending' ? 'Payment is still processing' : 'Order is not completed'
    });
  } catch (error) {
    console.error('Order validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 