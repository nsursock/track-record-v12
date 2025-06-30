import { generateUUID } from './utils/uuid.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from auth header if available (for logged-in users)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.log('No valid auth token provided, proceeding with guest purchase');
      }
    }

    const { email, firstName, lastName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create order in our database first
    const orderId = generateUUID();
    const { error: dbError } = await supabase
      .from('ebook_orders')
      .insert({
        id: orderId,
        user_id: userId, // Link to user account if logged in
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        status: 'pending',
        amount: 2900, // $29.00 in cents
        currency: 'USD',
        product: '6-life-principles-ebook',
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Create Stripe Checkout session
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Use SITE_URL for local development, VERCEL_URL for production
    const baseUrl = process.env.VERCEL_URL?.startsWith('http') 
      ? process.env.VERCEL_URL 
      : process.env.SITE_URL;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '6 Life Principles for Maximum Impact - PDF Ebook',
              description: 'Complete guide with battle-tested wisdom for navigating life\'s complexities. 30+ pages with case studies and implementation strategies.',
              images: [`${baseUrl}/assets/images/ebook-cover.png`],
            },
            unit_amount: 2900, // $29.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      client_reference_id: orderId, // This is how we'll link the payment to our order
      metadata: {
        order_id: orderId,
        customer_email: email,
        first_name: firstName || '',
        last_name: lastName || '',
      },
      success_url: `${baseUrl}/ebook/success/?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/ebook/purchase/?canceled=true`,
      automatic_tax: { enabled: false },
      billing_address_collection: 'auto',
    });

    // Update order with Stripe session ID
    await supabase
      .from('ebook_orders')
      .update({ 
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent 
      })
      .eq('id', orderId);

    res.json({
      checkout_url: session.url,
      session_id: session.id,
      order_id: orderId
    });

  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 