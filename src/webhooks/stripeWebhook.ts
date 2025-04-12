import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
    
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
};

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('stripe_customer_id', customerId)
    .single();

  await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_plan: subscription.items.data[0].price.lookup_key,
      subscription_period_end: new Date(subscription.current_period_end * 1000)
    })
    .eq('id', profile.id);
}