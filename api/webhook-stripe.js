import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here');

// The webhook secret from your Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  console.log('Received Stripe webhook event:', event.type);

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Handle successful one-time payment
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    customer: paymentIntent.customer,
    metadata: paymentIntent.metadata
  });

  // Check if this is a subscription-related payment intent that needs description update
  if (paymentIntent.metadata?.subscription_id && paymentIntent.metadata?.donor_name && !paymentIntent.description) {
    try {
      await stripe.paymentIntents.update(paymentIntent.id, {
        description: `Monthly donation from ${paymentIntent.metadata.donor_name}`
      });
      console.log(`Updated subscription payment intent ${paymentIntent.id} with custom description`);
    } catch (updateError) {
      console.log('Could not update payment intent description:', updateError.message);
    }
  }

  // Here you can:
  // 1. Send confirmation email to donor
  // 2. Update your database with donation record
  // 3. Send thank you notifications
  // 4. Add donor to newsletter if they opted in

  try {
    // Example: Log to your database (implement based on your database choice)
    await logDonation({
      stripePaymentIntentId: paymentIntent.id,
      type: paymentIntent.metadata?.subscription_id ? 'recurring' : 'one-time',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      donorEmail: paymentIntent.metadata?.donorEmail || paymentIntent.metadata?.donor_email,
      donorName: paymentIntent.metadata?.donorName || paymentIntent.metadata?.donor_name,
      status: 'completed',
      createdAt: new Date()
    });

    // Send thank you email (implement based on your email service)
    const donorEmail = paymentIntent.metadata?.donorEmail || paymentIntent.metadata?.donor_email;
    const donorName = paymentIntent.metadata?.donorName || paymentIntent.metadata?.donor_name;
    
    if (donorEmail) {
      await sendThankYouEmail({
        email: donorEmail,
        name: donorName,
        amount: paymentIntent.amount / 100,
        type: paymentIntent.metadata?.subscription_id ? 'recurring' : 'one-time'
      });
    }
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

// Handle failed one-time payment
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    customer: paymentIntent.customer,
    last_payment_error: paymentIntent.last_payment_error
  });

  // Here you can:
  // 1. Send payment failure notification
  // 2. Log the failed attempt
  // 3. Offer assistance or alternative payment methods
}

// Handle successful subscription payment
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Subscription payment succeeded:', {
    id: invoice.id,
    amount_paid: invoice.amount_paid,
    customer: invoice.customer,
    subscription: invoice.subscription
  });

  // For recurring payments:
  // 1. Send receipt email
  // 2. Update subscription status in your database
  // 3. Thank the subscriber

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update payment intent description if it exists and donor name is available
    if (invoice.payment_intent && subscription.metadata?.donorName) {
      try {
        await stripe.paymentIntents.update(invoice.payment_intent, {
          description: `Monthly donation from ${subscription.metadata.donorName}`,
          metadata: {
            donor_email: subscription.metadata.donorEmail,
            donor_name: subscription.metadata.donorName,
            subscription_id: subscription.id,
            invoice_id: invoice.id
          }
        });
        console.log(`Updated payment intent ${invoice.payment_intent} with custom description`);
      } catch (updateError) {
        console.log('Could not update payment intent description:', updateError.message);
      }
    }
    
    await logDonation({
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: invoice.subscription,
      type: 'recurring',
      amount: invoice.amount_paid,
      currency: invoice.currency,
      donorEmail: subscription.metadata?.donorEmail,
      donorName: subscription.metadata?.donorName,
      status: 'completed',
      createdAt: new Date()
    });

    // Send receipt email
    if (subscription.metadata?.donorEmail) {
      await sendReceiptEmail({
        email: subscription.metadata.donorEmail,
        name: subscription.metadata.donorName,
        amount: invoice.amount_paid / 100,
        type: 'recurring',
        invoiceUrl: invoice.hosted_invoice_url
      });
    }
  } catch (error) {
    console.error('Error processing successful subscription payment:', error);
  }
}

// Handle failed subscription payment
async function handleInvoicePaymentFailed(invoice) {
  console.log('Subscription payment failed:', {
    id: invoice.id,
    amount_due: invoice.amount_due,
    customer: invoice.customer,
    subscription: invoice.subscription
  });

  // For failed recurring payments:
  // 1. Send payment failure notification
  // 2. Provide instructions to update payment method
  // 3. Set up retry logic if needed
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status
  });

  // 1. Welcome the new subscriber
  // 2. Log subscription in your database
}

// Handle subscription updates (e.g., plan changes, status changes)
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status
  });

  // Handle subscription status changes:
  // - active: subscription is working
  // - past_due: payment failed, retrying
  // - canceled: subscription was canceled
  // - unpaid: payment failed, no retry
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', {
    id: subscription.id,
    customer: subscription.customer,
    canceled_at: subscription.canceled_at
  });

  // 1. Send cancellation confirmation
  // 2. Update database
  // 3. Optional: Send feedback survey
}

// Handle setup intent success (for setting up payment method for subscriptions)
async function handleSetupIntentSucceeded(setupIntent) {
  console.log('Setup intent succeeded:', {
    id: setupIntent.id,
    customer: setupIntent.customer,
    payment_method: setupIntent.payment_method
  });

  // Payment method successfully set up for future payments
}

// Placeholder functions - implement based on your infrastructure
async function logDonation(donationData) {
  // Implement database logging here
  // Example: Insert into your database
  console.log('Would log donation:', donationData);
}

async function sendThankYouEmail(emailData) {
  // Implement email sending here
  // Example: Use your email service (SendGrid, Mailgun, etc.)
  console.log('Would send thank you email:', emailData);
}

async function sendReceiptEmail(emailData) {
  // Implement receipt email sending here
  console.log('Would send receipt email:', emailData);
} 