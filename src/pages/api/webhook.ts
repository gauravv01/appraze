import express from 'express';
import { Stripe } from 'stripe';
import { SubscriptionService } from '../../lib/subscriptionService';

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
    
    await SubscriptionService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

export default router; 