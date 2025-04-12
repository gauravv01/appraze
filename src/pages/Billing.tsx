import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, CreditCard, AlertCircle, Calendar, Clock } from 'lucide-react';

const plans = [
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
  }
];

function Billing() {
  const [currentPlan, setCurrentPlan] = useState('growth');
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription plan and payment information</p>
        </div>

        {/* Current Plan Summary */}
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
              <button className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

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
            <button className="text-primary-600 hover:text-primary-700 font-medium">
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
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Mar 15, 2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Growth Plan
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £29.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-primary-600 hover:text-primary-700">
                      Download
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Feb 15, 2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Growth Plan
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £29.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-primary-600 hover:text-primary-700">
                      Download
                    </a>
                  </td>
                </tr>
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
                      className="w-full bg-white border border-primary-600 text-primary-600 py-2 rounded-lg hover:bg-primary-50"
                      onClick={() => setCurrentPlan(plan.id)}
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
      </div>
    </DashboardLayout>
  );
}

export default Billing;