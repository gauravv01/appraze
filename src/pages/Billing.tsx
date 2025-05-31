import  { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, CreditCard, Clock } from 'lucide-react';
import { StripeAPI } from '../lib/stripe-api';
import { supabase } from '../lib/supabase';


const keys = {

  VITE_STRIPE_PRICE_ID_STARTER_MONTHLY:'price_1RD83rQ63n5UyUEvydF1jJBg',
  VITE_STRIPE_PRICE_ID_STARTER_YEARLY:'price_1RD85qQ63n5UyUEvfWDzu4fu',
  VITE_STRIPE_PRICE_ID_GROWTH_MONTHLY:'price_1RD874Q63n5UyUEvKDZ1sqWD',
  VITE_STRIPE_PRICE_ID_GROWTH_YEARLY  :'price_1RD88cQ63n5UyUEvC71S4QP1',
    VITE_STRIPE_PRICE_ID_PRO_MONTHLY:'price_1RD89VQ63n5UyUEvs89qbpqr',
  VITE_STRIPE_PRICE_ID_PRO_YEARLY:'price_1RD8AIQ63n5UyUEvpYubbLIV'
};


interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  annualPrice: string;
  annualPeriod: string;
  description: string;
  features: string[];
  recommended: boolean;
  hasTrial: boolean;
  stripePriceId: {
    monthly: string;
    annual: string;
  };
}

interface BillingHistoryItem {
  id: string;
  created: number;
  amount: number;
  description: string;
  status: string;
  receipt_url?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '£9',
    period: 'per month',
    annualPrice: '£90',
    annualPeriod: 'per year',
    description: 'For individual managers or small teams trying us out',
    features: [
      '3 AI-generated performance reviews/month',
      'Access to tone selection & editable output',
      'Basic dashboard',
      'No team sharing',
      'Great for "I\'ll try it and see" mindset'
    ],
    recommended: false,
    hasTrial: true,
    stripePriceId: {
      monthly: keys.VITE_STRIPE_PRICE_ID_STARTER_MONTHLY || '',
      annual: keys.VITE_STRIPE_PRICE_ID_STARTER_YEARLY || ''
    }
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '£29',
    period: 'per month',
    annualPrice: '£290',
    annualPeriod: 'per year',
    description: 'For fast-growing teams that want consistency without wasting time',
    features: [
      '15 reviews/month',
      'Shared dashboard access',
      'Team collaboration',
      'Priority support',
      'Save 2+ hours per review'
    ],
    recommended: true,
    hasTrial: false,
    stripePriceId: {
      monthly: keys.VITE_STRIPE_PRICE_ID_GROWTH_MONTHLY || '',
      annual: keys.VITE_STRIPE_PRICE_ID_GROWTH_YEARLY || ''
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£79',
    period: 'per month',
    annualPrice: '£790',
    annualPeriod: 'per year',
    description: 'For ops-minded orgs running regular reviews across departments',
    features: [
      '50 reviews/month',
      'Advanced reporting',
      'Invite managers',
      'CSV export/download',
      'Early access to new features',
      'Live chat support'
    ],
    recommended: false,
    hasTrial: false,
    stripePriceId: {
      monthly: keys.VITE_STRIPE_PRICE_ID_PRO_MONTHLY || '',
          annual: keys.VITE_STRIPE_PRICE_ID_PRO_YEARLY || ''
    }
  }
];

function Billing() {
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, subscription_status, subscription_period_end')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.stripe_customer_id) {
        // Load subscription details
        const subscriptionData :any= await StripeAPI.getSubscription(profile.stripe_customer_id);
        setSubscription(subscriptionData);
        setCurrentPlan(subscriptionData?.plan?.id || '');

        // Load billing history
        const history = await StripeAPI.getBillingHistory(profile.stripe_customer_id);
        setBillingHistory(history as BillingHistoryItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get or create customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) throw new Error('Profile not found');

      // Create/update customer if needed
      let customerId = profile.stripe_customer_id;
      if (!customerId) {
        const customer = await StripeAPI.createOrUpdateCustomer(user.id, profile.email);
        customerId = customer?.id;
        if (!customerId) throw new Error('Failed to create customer');
      }

      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) throw new Error('Invalid plan selected');

      const priceId = billingCycle === 'monthly' 
        ? selectedPlan.stripePriceId.monthly 
        : selectedPlan.stripePriceId.annual;

      const session:any = await StripeAPI.createCheckoutSession(
        user.id,
        priceId,
        `${window.location.origin}/dashboard/billing?success=true`,
        `${window.location.origin}/dashboard/billing?canceled=true`
      );

      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await StripeAPI.cancelSubscription(subscription.id);
      await loadSubscriptionData(); // Reload subscription data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.stripe_customer_id) throw new Error('No customer ID found');

      const session:any = await StripeAPI.createPortalSession(
        profile.stripe_customer_id,
        `${window.location.origin}/dashboard/billing`
      );

      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment method');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {/* Current Plan Summary */}
      {subscription && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Current Plan</h2>
              <div className="flex items-center">
                <span className="text-xl font-semibold text-primary-600 mr-2">Growth Plan</span>
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-gray-600 mt-1">Billing cycle: Monthly</p>
              <p className="text-gray-600">Next billing date: April 15, 2025</p>
            </div>
            <div className="mt-4 md:mt-0 space-y-2">
              <button 
                onClick={handleCancelSubscription}
                className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-lg mr-4">
              <CreditCard className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/2026</p>
            </div>
          </div>
          <button 
            onClick={handleUpdatePaymentMethod}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {billingHistory.map((history) => (
                <tr key={history.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(history.created * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {history.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {history.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {history.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={history.receipt_url} className="text-primary-600 hover:text-primary-700">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Available Plans</h2>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingCycle === 'annually'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annually <span className="text-primary-600 font-semibold">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border rounded-xl p-6 flex flex-col ${
                plan.id === currentPlan 
                  ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
              } transition-all duration-200`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {billingCycle === 'annually' ? plan.annualPrice : plan.price}
                    </span>
                    <span className="ml-1 text-gray-500">
                      {billingCycle === 'annually' ? plan.annualPeriod : plan.period}
                    </span>
                  </div>
                </div>
                {plan.recommended && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              {billingCycle === 'annually' && (
                <div className="bg-green-50 text-green-800 text-sm p-2 rounded-md mb-4">
                  Save with 2 months free
                </div>
              )}
              <p className="text-gray-600 mb-4">{plan.description}</p>
              {plan.hasTrial && (
                <div className="bg-primary-50 text-primary-800 text-sm p-2 rounded-md mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  3-day free trial available
                </div>
              )}
              <div className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                {plan.id === currentPlan ? (
                  <button 
                    className="w-full bg-primary-600 text-white py-2 rounded-lg cursor-not-allowed opacity-70"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePlanChange(plan.id)}
                    className="w-full bg-white border border-primary-600 text-primary-600 py-2 rounded-lg hover:bg-primary-50"
                  >
                    {plan.hasTrial ? 'Start Free Trial' : 'Switch to ' + plan.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise / Custom</h3>
              <p className="text-gray-600">Custom plan for large teams or agencies</p>
              <p className="mt-2 text-gray-500">Unlimited reviews • Advanced analytics • Dedicated account manager</p>
            </div>
            <a 
              href="mailto:sales@appraze.io" 
              className="mt-4 md:mt-0 px-5 py-2 bg-white border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
            >
              Contact Sales
            </a>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500">
            Annual plans save 2 months free: Starter £90/year • Growth £290/year • Pro £790/year
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Billing;