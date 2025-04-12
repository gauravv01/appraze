import express from 'express';
import { Stripe } from 'stripe';
import { StripeAPI } from '../../lib/stripe-api';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    
    await StripeAPI.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error('Webhook Error:', error.message);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

export default router; 