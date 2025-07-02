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
    const { amount, donor } = req.body;

    // Validate required fields
    if (!amount || amount < 100) { // Minimum $1.00 for subscriptions
      return res.status(400).json({ error: 'Invalid amount. Minimum monthly donation is $1.00' });
    }

    if (!donor || !donor.email || !donor.firstName || !donor.lastName) {
      return res.status(400).json({ error: 'Donor information is required' });
    }

    // Check if customer already exists
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: donor.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      
      // Update customer information
      customer = await stripe.customers.update(customer.id, {
        name: `${donor.firstName} ${donor.lastName}`,
        metadata: {
          firstName: donor.firstName,
          lastName: donor.lastName,
          donationType: 'subscription'
        }
      });
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: donor.email,
        name: `${donor.firstName} ${donor.lastName}`,
        metadata: {
          firstName: donor.firstName,
          lastName: donor.lastName,
          donationType: 'subscription'
        }
      });
    }

    // Create or retrieve price for the donation amount
    const priceId = await getOrCreatePrice(amount);

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        donorEmail: donor.email,
        donorName: `${donor.firstName} ${donor.lastName}`,
        donationType: 'subscription'
      }
    });

    // Log successful subscription creation
    console.log(`Subscription created: ${subscription.id} for $${amount/100}/month`);

    // Get the latest invoice
    let invoice;
    let paymentIntent;
    
    if (subscription.latest_invoice && typeof subscription.latest_invoice === 'string') {
      // If latest_invoice is just an ID, fetch the full invoice
      invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
    } else if (subscription.latest_invoice && subscription.latest_invoice.id) {
      // If we have the invoice object, use it
      invoice = subscription.latest_invoice;
    }

    console.log('Invoice details:', {
      invoice_id: invoice?.id,
      invoice_status: invoice?.status,
      invoice_amount: invoice?.amount_due,
      has_payment_intent: !!invoice?.payment_intent
    });

    // If the invoice doesn't have a payment intent, create one
    if (invoice && !invoice.payment_intent) {
      console.log('Creating payment intent for invoice...');
      
      // Create a payment intent for the invoice amount
      paymentIntent = await stripe.paymentIntents.create({
        amount: invoice.amount_due,
        currency: 'usd',
        customer: customer.id,
        description: `Monthly donation from ${donor.firstName} ${donor.lastName}`,
        setup_future_usage: 'off_session', // For future subscription payments
        metadata: {
          subscription_id: subscription.id,
          invoice_id: invoice.id,
          donor_email: donor.email,
          donor_name: `${donor.firstName} ${donor.lastName}`
        }
      });

      console.log('Payment intent created:', {
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret ? 'present' : 'missing'
      });
    } else if (invoice && invoice.payment_intent) {
      // Retrieve the existing payment intent
      if (typeof invoice.payment_intent === 'string') {
        paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
      } else {
        paymentIntent = invoice.payment_intent;
      }
      
      // Update the existing payment intent with custom description
      if (paymentIntent && paymentIntent.id) {
        try {
          paymentIntent = await stripe.paymentIntents.update(paymentIntent.id, {
            description: `Monthly donation from ${donor.firstName} ${donor.lastName}`,
            metadata: {
              ...paymentIntent.metadata,
              donor_email: donor.email,
              donor_name: `${donor.firstName} ${donor.lastName}`,
              subscription_id: subscription.id
            }
          });
        } catch (updateError) {
          console.log('Could not update payment intent description:', updateError.message);
        }
      }
    }

    // Check if we have the required payment intent data
    if (!paymentIntent || !paymentIntent.client_secret) {
      console.error('Unable to create or retrieve payment intent');
      return res.status(500).json({ 
        error: 'Payment setup failed. Please try again or contact support.' 
      });
    }

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    
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

// Helper function to get or create a price for the donation amount
async function getOrCreatePrice(amount) {
  try {
    // First, try to find an existing price for this amount
    const prices = await stripe.prices.list({
      lookup_keys: [`monthly_donation_${amount}`],
      active: true
    });

    if (prices.data.length > 0) {
      return prices.data[0].id;
    }

    // If no existing price, create a new one
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      lookup_key: `monthly_donation_${amount}`,
      metadata: {
        type: 'monthly_donation',
        amount: amount.toString()
      },
      // Create a generic product for donations if it doesn't exist
      product_data: {
        name: 'Monthly Donation - Emergency Metaphysics Fund'
      }
    });

    return price.id;
  } catch (error) {
    console.error('Error creating/retrieving price:', error);
    throw error;
  }
} 