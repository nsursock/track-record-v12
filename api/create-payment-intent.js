import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount, currency = 'usd', donor } = req.body;

    // Validate required fields
    if (!amount || amount < 50) { // Minimum $0.50
      return res.status(400).json({ error: 'Invalid amount. Minimum donation is $0.50' });
    }

    if (!donor || !donor.email || !donor.firstName || !donor.lastName) {
      return res.status(400).json({ error: 'Donor information is required' });
    }

    // Create customer in Stripe for better tracking
    const customer = await stripe.customers.create({
      email: donor.email,
      name: `${donor.firstName} ${donor.lastName}`,
      metadata: {
        firstName: donor.firstName,
        lastName: donor.lastName,
        donationType: 'one-time'
      }
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      description: `One-time donation from ${donor.firstName} ${donor.lastName}`,
      metadata: {
        donorEmail: donor.email,
        donorName: `${donor.firstName} ${donor.lastName}`,
        donationType: 'one-time'
      },
      receipt_email: donor.email,
      // Enable automatic payment methods for better user experience
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Log successful payment intent creation
    console.log(`Payment intent created: ${paymentIntent.id} for $${amount/100}`);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      res.status(400).json({ error: error.message });
    } else if (error.type === 'StripeRateLimitError') {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Invalid request parameters.' });
    } else if (error.type === 'StripeAPIError') {
      res.status(500).json({ error: 'Stripe API error. Please try again.' });
    } else if (error.type === 'StripeConnectionError') {
      res.status(500).json({ error: 'Connection error. Please try again.' });
    } else if (error.type === 'StripeAuthenticationError') {
      res.status(500).json({ error: 'Authentication error.' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
} 