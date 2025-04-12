import { createClient } from '@supabase/supabase-js';
import { Stripe } from 'stripe';
import { supabase } from './supabase';
import type { Team, SubscriptionPlan, UsageLog } from '../types';
import { APIClient } from './APIClient';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export class SubscriptionService extends APIClient {
  // Create checkout session
  static async createCheckoutSession(teamId: string, priceId: string) {
    const { data: team } = await supabase
      .from('teams')
      .select()
      .eq('id', teamId)
      .single();

    if (!team) throw new Error('Team not found');

    const session = await stripe.checkout.sessions.create({
      customer: team.stripe_customer_id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${import.meta.env.VITE_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${import.meta.env.VITE_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        teamId
      }
    });

    return session;
  }

  // Handle webhook
  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionStatus(subscription);
        break;
      }
    }
  }

  // Update subscription status
  private static async updateSubscriptionStatus(subscription: Stripe.Subscription) {
    const { metadata } = subscription;
    if (!metadata?.teamId) return;

    const priceId = subscription.items.data[0]?.price.lookup_key;
    if (!priceId) return;

    await supabase
      .from('teams')
      .update({
        subscription_status: subscription.status,
        subscription_period_end: new Date(subscription.current_period_end * 1000),
        plan_id: priceId
      })
      .eq('id', metadata.teamId);
  }

  // Track usage
  static async trackUsage(teamId: string, feature: string, quantity: number = 1) {
    await supabase
      .from('usage_logs')
      .insert([{
        team_id: teamId,
        feature,
        quantity
      }]);
  }

  // Check usage limits
  static async checkUsageLimit(teamId: string, feature: string): Promise<boolean> {
    try {
      const { data: team } = await supabase
        .from('teams')
        .select(`
          *,
          plan:subscription_plans!inner(*)
        `)
        .eq('id', teamId)
        .single();

      if (!team?.plan?.limits) return false;

      const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('quantity')
        .eq('team_id', teamId)
        .eq('feature', feature)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      if (!usageLogs) return false;

      const planLimits = team.plan.limits as Record<string, number>;
      const limit = planLimits[feature];
      if (limit === -1) return true; // Unlimited

      const currentUsage = usageLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);
      return currentUsage < limit;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }
} 