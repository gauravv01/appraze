import { Stripe } from 'stripe';
import { APIClient } from './api-client';
import { supabase } from './supabase';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export class StripeAPI extends APIClient {
  static async createCustomer(userId: string, email: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId
        }
      });

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);

      return customer;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

      return subscription;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });

      return session;
    } catch (error) {
      this.handleError(error);
    }
  }
} 