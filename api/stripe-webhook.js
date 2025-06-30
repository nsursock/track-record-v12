import { generateUUID } from './utils/uuid.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// For local development, we'll disable signature verification
// In production, use Stripe CLI or proper webhook setup
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  let event;

  try {
    // For local development, we'll use the event data directly
    // Check if we're in development by looking for localhost or missing signature
    const isLocalDevelopment = req.headers.host?.includes('localhost') || !req.headers['stripe-signature'];
    
    if (isLocalDevelopment) {
      // For local testing, assume the body is the event
      event = req.body;
      console.log('Local development mode: Using event data directly');
    } else {
      // Production: verify signature (requires proper webhook setup)
      const sig = req.headers['stripe-signature'];
      
      // This would need proper raw body handling in production
      event = stripe.webhooks.constructEvent(
        JSON.stringify(req.body), 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Get the order ID from metadata
        const orderId = session.client_reference_id || session.metadata.order_id;
        
        if (!orderId) {
          console.error('No order ID found in session:', session.id);
          return res.status(400).json({ error: 'Order ID not found' });
        }

        // Update order status to completed
        const { error: updateError } = await supabase
          .from('ebook_orders')
          .update({ 
            status: 'completed',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            completed_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Failed to update order status:', updateError);
          return res.status(500).json({ error: 'Failed to update order' });
        }

        // Generate download token
        const downloadToken = generateUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

        const { error: tokenError } = await supabase
          .from('download_tokens')
          .insert({
            token: downloadToken,
            order_id: orderId,
            expires_at: expiresAt.toISOString(),
            downloads_remaining: 3,
            created_at: new Date().toISOString()
          });

        if (tokenError) {
          console.error('Failed to create download token:', tokenError);
          // Don't return error here as order is already completed
        }

        console.log('Order completed and download token created:', {
          order_id: orderId,
          session_id: session.id,
          download_token: downloadToken
        });
        
        break;

      case 'checkout.session.expired':
        // Mark order as failed if checkout session expires
        const expiredSession = event.data.object;
        const expiredOrderId = expiredSession.client_reference_id || expiredSession.metadata.order_id;
        
        if (expiredOrderId) {
          await supabase
            .from('ebook_orders')
            .update({ status: 'failed' })
            .eq('id', expiredOrderId);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
} 