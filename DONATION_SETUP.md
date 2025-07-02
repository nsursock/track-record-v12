# Donation System Setup Guide

This guide will help you set up the Stripe-powered donation system for your site.

## Overview

The donation system supports:
- ✅ One-time donations
- ✅ Monthly recurring donations  
- ✅ Secure payment processing via Stripe
- ✅ Embedded payment forms
- ✅ Webhook handling for payment events
- ✅ Thank you pages and receipts
- ✅ Mobile-responsive design

## Prerequisites

1. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
2. **Node.js**: Ensure you have Node.js installed for the API endpoints

## Setup Instructions

### 1. Install Dependencies

The required Stripe dependencies have already been installed:
```bash
npm install stripe @stripe/stripe-js
```

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret_here
```

**Where to find these:**
- **Publishable Key**: Stripe Dashboard > Developers > API keys
- **Secret Key**: Stripe Dashboard > Developers > API keys  
- **Webhook Secret**: Stripe Dashboard > Developers > Webhooks (after creating endpoint)

### 3. Set Up Stripe Webhooks

1. Go to your [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/webhook-stripe`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `setup_intent.succeeded`
5. Save and copy the webhook secret

### 4. Test the Integration

1. Use Stripe's test card numbers:
   - **Successful payment**: `4242 4242 4242 4242`
   - **Failed payment**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0000 0000 3220`

2. Test scenarios:
   - One-time donations of various amounts
   - Monthly subscription setup
   - Payment failures
   - Webhook events

## File Structure

```
src/
├── donate.njk                 # Main donation page
├── donate/
│   └── thank-you.njk         # Thank you page after donation
├── assets/
│   └── js/
│       └── donation.js       # Frontend donation logic
api/
├── create-payment-intent.js  # One-time payment API
├── create-subscription.js    # Subscription API
└── webhook-stripe.js         # Webhook handler
```

## Customization

### Preset Donation Amounts

Edit the `presetAmounts` array in `src/assets/js/donation.js`:

```javascript
presetAmounts: [10, 25, 50, 100], // Change these values
```

### Styling

The donation form uses the existing theme system. Customize colors and fonts through your theme files in `src/assets/css/themes/`.

### Minimum Amounts

- **One-time donations**: $0.50 minimum (can be changed in API)
- **Monthly subscriptions**: $1.00 minimum (can be changed in API)

### Form Fields

You can modify the donor information fields in `src/donate.njk`. Currently collects:
- First Name
- Last Name  
- Email Address

## Production Deployment

### 1. Switch to Live Keys

Replace test keys with live keys from your Stripe Dashboard:
- `pk_live_...` for publishable key
- `sk_live_...` for secret key

### 2. Update Webhook Endpoint

Create a new webhook endpoint pointing to your production domain.

### 3. SSL Certificate

Ensure your site has a valid SSL certificate (required for Stripe).

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Validate webhook signatures** (already implemented)
3. **Use HTTPS** in production
4. **Sanitize user inputs** (already implemented)
5. **Log events** for debugging and compliance

## Monitoring & Analytics

The system logs key events:
- Payment intents created
- Successful/failed payments
- Subscription events
- Webhook processing

Check your server logs and Stripe Dashboard for monitoring.

## Support & Troubleshooting

### Common Issues

1. **"Stripe not loaded" error**: Check that `STRIPE_PUBLISHABLE_KEY` is set correctly
2. **Payment fails silently**: Check webhook configuration and server logs
3. **CORS errors**: Ensure API endpoints have proper CORS headers (already configured)

### Testing Webhooks Locally

Use Stripe CLI to forward webhooks to your local development server:

```bash
stripe listen --forward-to localhost:3000/api/webhook-stripe
```

### Debugging

Enable console logging by setting your environment to development mode. All Stripe events and API calls will be logged.

## Email Integration (Optional)

To send receipt emails, implement email service integration in the webhook handler:

1. Choose an email service (SendGrid, Mailgun, AWS SES)
2. Update the placeholder functions in `api/webhook-stripe.js`
3. Add email templates for receipts and confirmations

## Database Integration (Optional)

To track donations in your database:

1. Create a donations table with appropriate fields
2. Update the `logDonation` function in `api/webhook-stripe.js`
3. Connect to your database of choice (PostgreSQL, MySQL, MongoDB, etc.)

## Going Live Checklist

- [ ] Test all payment flows
- [ ] Switch to live Stripe keys
- [ ] Set up production webhook endpoint
- [ ] Test webhook events in production
- [ ] Configure email notifications (if desired)
- [ ] Set up donation tracking (if desired)
- [ ] Update donation page copy and amounts
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Monitor initial donations

## Support

For Stripe-specific issues, refer to the [Stripe Documentation](https://stripe.com/docs) or contact Stripe Support.

For implementation questions, check the code comments in the donation files. 