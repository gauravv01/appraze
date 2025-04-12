import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Clock, FileText, Zap, Shield, Sparkles, Menu, X, CheckCircle, ArrowRight, PenTool, Target, Award, Users, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <Clock className="w-6 h-6 text-primary-600" />,
    title: '5x Faster Reviews',
    description: 'Complete performance reviews in minutes instead of hours with AI assistance.'
  },
  {
    icon: <PenTool className="w-6 h-6 text-primary-600" />,
    title: 'No More Writer\'s Block',
    description: 'Let AI generate the first draft while you focus on personalization.'
  },
  {
    icon: <Target className="w-6 h-6 text-primary-600" />,
    title: 'Consistent & Fair Feedback',
    description: 'Maintain objectivity and fairness across all employee reviews.'
  },
  {
    icon: <Shield className="w-6 h-6 text-primary-600" />,
    title: 'Higher-Quality Feedback',
    description: 'Provide detailed, actionable feedback that helps employees grow.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-primary-600" />,
    title: 'Effortless & Intuitive',
    description: 'Simple interface that anyone can use without training.'
  }
];

const workflowSteps = [
  {
    icon: <FileText className="w-10 h-10 text-primary-600" />,
    title: 'Input Basic Information',
    description: 'Enter employee details, role, and review period - takes less than 30 seconds.'
  },
  {
    icon: <Brain className="w-10 h-10 text-primary-600" />,
    title: 'Generate Review Draft',
    description: 'Our AI creates a comprehensive review draft in under 2 minutes.'
  },
  {
    icon: <PenTool className="w-10 h-10 text-primary-600" />,
    title: 'Review and Customize',
    description: 'Quickly review, edit, and finalize the draft to match your voice.'
  }
];

const testimonials = [
  {
    quote: "PerformAI has transformed our review process. What used to take me 3 hours per employee now takes just 20 minutes, and the quality is better than ever.",
    author: "Sarah Johnson",
    position: "HR Director, TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    quote: "The consistency and fairness across reviews has improved dramatically. Our employees feel more valued with the specific, actionable feedback PerformAI helps us provide.",
    author: "Michael Chen",
    position: "Engineering Manager, Innovate Inc",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    quote: "We've seen a 75% reduction in time spent on reviews, allowing our managers to focus on actual coaching instead of paperwork. The ROI is incredible.",
    author: "Emily Rodriguez",
    position: "COO, GrowFast Solutions",
    image: "https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "£9",
    period: "/month",
    annualPrice: "£90",
    annualPeriod: "/year",
    description: "For individual managers or small teams trying us out",
    features: [
      "3 AI-generated performance reviews/month",
      "Access to tone selection & editable output",
      "Basic dashboard",
      "No team sharing",
      "Great for \"I'll try it and see\" mindset"
    ],
    buttonText: "Start 3-Day Free Trial",
    hasTrial: true,
    highlighted: false
  },
  {
    name: "Growth",
    price: "£29",
    period: "/month",
    annualPrice: "£290",
    annualPeriod: "/year",
    description: "For fast-growing teams that want consistency without wasting time",
    features: [
      "15 reviews/month",
      "Shared dashboard access",
      "Team collaboration",
      "Priority support",
      "Save 2+ hours per review"
    ],
    buttonText: "Get Started",
    hasTrial: false,
    highlighted: true
  },
  {
    name: "Pro",
    price: "£79",
    period: "/month",
    annualPrice: "£790",
    annualPeriod: "/year",
    description: "For ops-minded orgs running regular reviews across departments",
    features: [
      "50 reviews/month",
      "Advanced reporting",
      "Invite managers",
      "CSV export/download",
      "Early access to new features", 
      "Live chat support"
    ],
    buttonText: "Get Started",
    hasTrial: false,
    highlighted: false
  }
];

const enterprisePlan = {
  name: "Enterprise / Custom",
  description: "Custom plan for large teams or agencies",
  buttonText: "Contact Sales"
};

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">PerformAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">Dashboard</Link>
              <Link to="/dashboard" className="bg-primary-600 text-white px-8 py-2.5 rounded-full hover:bg-primary-700 transition font-medium">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-primary-600 mr-2" />
                <span className="text-lg font-medium text-gray-700">Apprai.io</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-display-lg font-semibold tracking-tight text-gray-900 mb-6" style={{ lineHeight: '1.1' }}>
                <span className="block">Write Better Reviews</span>
                <span className="block">in 2 Minutes – Not 2 Weeks</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                AI-powered review drafts that save you 5+ hours per employee, eliminate writer's block, and ensure consistent, fair feedback every time.
              </p>
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 md:text-lg transition-colors"
                >
                  Start Your Free Review
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <p className="text-sm text-gray-500">No signup or credit card required for your first review</p>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Performance Review Assistant</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 rounded-full h-10 w-10 bg-primary-100 flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="w-full">
                          <div className="bg-gray-100 rounded-xl p-3 rounded-tl-none">
                            <p className="text-sm">What type of review would you like to create?</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start justify-end">
                        <div className="w-full max-w-md">
                          <div className="bg-primary-50 text-primary-900 rounded-xl p-3 rounded-tr-none">
                            <p className="text-sm">Annual performance review for a software developer</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 rounded-full h-10 w-10 bg-primary-100 flex items-center justify-center ml-3">
                          <Brain className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 rounded-full h-10 w-10 bg-primary-100 flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="w-full">
                          <div className="bg-gray-100 rounded-xl p-3 rounded-tl-none">
                            <p className="text-sm">What are the employee's key strengths?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-medium">Performance Metrics</span>
                      <span className="text-xs text-gray-500">Last updated today</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Code Quality</span>
                        <div className="w-2/3 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Collaboration</span>
                        <div className="w-2/3 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Deadlines</span>
                        <div className="w-2/3 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <span className="text-sm font-medium">70%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete performance reviews in minutes, not hours. Our AI handles the heavy lifting while you maintain full control.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200" style={{ width: 'calc(100% - 5rem)' }}></div>
                  )}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 bg-primary-50 p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">5+</div>
                <p className="text-gray-700">Hours saved per employee review</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">3x</div>
                <p className="text-gray-700">More comprehensive and detailed feedback</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
                <p className="text-gray-700">Manager satisfaction rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Key Benefits & Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to write better performance reviews in less time.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Simple, Flexible Pricing for Teams of All Sizes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with a free trial. Then choose the plan that fits your needs.
            </p>
          </div>
          
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-12">
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl border transition-all duration-300 ${
                  plan.highlighted 
                    ? 'border-primary-500 shadow-lg scale-105 md:scale-110 z-10 relative' 
                    : 'border-gray-200 hover:border-primary-300 hover:shadow'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-primary-500 text-white text-center text-sm font-medium py-1.5 px-4 rounded-t-xl">
                    Most Popular
                  </div>
                )}
                <div className={`p-6 ${plan.highlighted ? 'pt-4' : 'pt-6'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingCycle === 'annually' ? plan.annualPrice : plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">
                      {billingCycle === 'annually' ? plan.annualPeriod : plan.period}
                    </span>
                  </div>
                  
                  {billingCycle === 'annually' && (
                    <div className="bg-green-50 text-green-800 text-sm p-2 rounded-md mb-4">
                      Save with 2 months free
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  {plan.hasTrial && (
                    <div className="bg-primary-50 text-primary-800 text-sm p-2 rounded-md mb-4 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      3-day free trial available
                    </div>
                  )}
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/dashboard"
                    className={`block w-full text-center py-3 rounded-lg font-medium ${
                      plan.highlighted
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-white border border-primary-600 text-primary-600 hover:bg-primary-50'
                    } transition-colors`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enterprise Plan */}
          <div className="mt-12 p-8 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{enterprisePlan.name}</h3>
                <p className="text-gray-600">{enterprisePlan.description}</p>
                <p className="mt-2 text-gray-500">Unlimited reviews • Advanced analytics • Dedicated account manager • Custom integrations</p>
              </div>
              <a
                href="mailto:sales@appraze.io"
                className="mt-6 md:mt-0 px-5 py-3 bg-white border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
              >
                {enterprisePlan.buttonText}
              </a>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-600">
              All plans come with a money-back guarantee. <a href="#" className="text-primary-600 font-medium">Learn more</a>
            </p>
            <p className="text-gray-500 mt-2">
              Annual plans save 2 months free: Starter £90/year • Growth £290/year • Pro £790/year
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from HR leaders and managers who have transformed their review process with PerformAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl relative shadow-sm">
                <div className="absolute top-6 left-6 text-primary-200">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 20H7.5C6.83696 20 6.20107 19.7366 5.73223 19.2678C5.26339 18.7989 5 18.163 5 17.5V15C5 14.337 5.26339 13.7011 5.73223 13.2322C6.20107 12.7634 6.83696 12.5 7.5 12.5H10C10.3315 12.5 10.6495 12.3683 10.8839 12.1339C11.1183 11.8995 11.25 11.5815 11.25 11.25V10C11.25 9.66848 11.1183 9.35054 10.8839 9.11612C10.6495 8.8817 10.3315 8.75 10 8.75H7.5M25 20H20C19.337 20 18.7011 19.7366 18.2322 19.2678C17.7634 18.7989 17.5 18.163 17.5 17.5V15C17.5 14.337 17.7634 13.7011 18.2322 13.2322C18.7011 12.7634 19.337 12.5 20 12.5H22.5C22.8315 12.5 23.1495 12.3683 23.3839 12.1339C23.6183 11.8995 23.75 11.5815 23.75 11.25V10C23.75 9.66848 23.6183 9.35054 23.3839 9.11612C23.1495 8.8817 22.8315 8.75 22.5 8.75H20" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="pt-8">
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.position}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-12">
              Trusted by Leading Companies
            </h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="flex justify-center items-center bg-gray-50 p-8 rounded-xl">
                <Award className="h-12 w-12 text-gray-400" />
              </div>
              <div className="flex justify-center items-center bg-gray-50 p-8 rounded-xl">
                <BarChart3 className="h-12 w-12 text-gray-400" />
              </div>
              <div className="flex justify-center items-center bg-gray-50 p-8 rounded-xl">
                <Shield className="h-12 w-12 text-gray-400" />
              </div>
              <div className="flex justify-center items-center bg-gray-50 p-8 rounded-xl">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center flex-col md:flex-row space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">PerformAI</span>
            </div>
            <p className="text-gray-500">© 2025 PerformAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;