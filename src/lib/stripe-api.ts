import { Stripe } from 'stripe';
import { APIClient } from './api-client';
import { supabase } from './supabase';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: 'month' | 'year';
  };
}

export class StripeAPI extends APIClient {
  // Create or update customer
  static async createOrUpdateCustomer(userId: string, email: string, paymentMethodId?: string) {
    try {
      // Check if customer already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      let customerId = profile?.stripe_customer_id;

      if (customerId) {
        // Update existing customer
        const customer = await stripe.customers.update(customerId, {
          email,
          ...(paymentMethodId && { source: paymentMethodId })
        });
        return customer;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email,
          metadata: { user_id: userId },
          ...(paymentMethodId && { source: paymentMethodId })
        });

        // Update profile with customer ID
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId);

        return customer;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create checkout session
 

  // Create subscription
  static async createSubscription(customerId: string, priceId: string, paymentMethodId: string) {
    try {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Cancel subscription
  

  // Update subscription
  static async updateSubscription(subscriptionId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
      });
    } catch (error) {
      this.handleError(error);
    }
  }

 

  // List all prices
  static async listPrices() {
    try {
      const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product']
      });
      return prices.data;
    } catch (error) {
      return super.handleError(error);
    }
  }

  // Get customer's subscription
  static async getCustomerSubscription(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        expand: ['data.default_payment_method'],
      });
      return subscriptions.data[0];
    } catch (error) {
      this.handleError(error);
    }
  }

  // Handle webhook events
  static async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.updateSubscriptionInDatabase(subscription);
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleSuccessfulPayment(invoice);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleFailedPayment(invoice);
          break;
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  // Private helper methods
  private static async updateSubscriptionInDatabase(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          subscription_period_end: new Date(subscription.current_period_end * 1000),
          updated_at: new Date(),
        })
        .eq('id', profile.id);
    }
  }

  private static async handleSuccessfulPayment(invoice: Stripe.Invoice) {
    // Update payment status in your database
    const customerId = invoice.customer as string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          last_payment_status: 'succeeded',
          last_payment_date: new Date(),
          updated_at: new Date(),
        })
        .eq('id', profile.id);
    }
  }

  private static async handleFailedPayment(invoice: Stripe.Invoice) {
    // Handle failed payment
    const customerId = invoice.customer as string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          last_payment_status: 'failed',
          updated_at: new Date(),
        })
        .eq('id', profile.id);
    }
  }

  static async getSubscription(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'active',
        expand: ['data.plan']
      });
      return subscriptions.data[0];
    } catch (error) {
      return super.handleError(error);
    }
  }

  static async getBillingHistory(customerId: string) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 12
      });
      return invoices.data;
    } catch (error) {
      return super.handleError(error);
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      return super.handleError(error);
    }
  }

  static async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    console.log('Creating checkout session for user:', userId, 'with price ID:', priceId);
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId
        }
      });
      return session;
    } catch (error) {
      return super.handleError(error);
    }
  }

  static async createPortalSession(customerId: string, returnUrl: string) {
    try {
      return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });
    } catch (error) {
      return super.handleError(error);
    }
  }

  static async getPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      return paymentMethods.data[0];
    } catch (error) {
      return super.handleError(error);
    }
  }
} 