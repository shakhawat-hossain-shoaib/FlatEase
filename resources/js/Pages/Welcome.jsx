import { Link, Head } from '@inertiajs/react';
import {
  Building2,
  Shield,
  FileText,
  Bell,
  CreditCard,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Welcome({ auth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Apartment Management',
      description: 'Efficiently manage multiple properties, units, and tenants from a single dashboard.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Documents',
      description: 'Store and share documents with bank-grade encryption and secure access controls.'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Lease Tracking',
      description: 'Track lease agreements with automated expiry alerts and renewal reminders.'
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Notifications',
      description: 'Stay informed with real-time alerts for payments, complaints, and important updates.'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Payment Management',
      description: 'Track rent payments, manage invoices, and monitor payment history effortlessly.'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Complaint Resolution',
      description: 'Streamline maintenance requests and complaints with a visual timeline tracker.'
    }
  ];

  const benefits = [
    {
      title: 'Save Time',
      description: 'Automate repetitive tasks and reduce manual work by up to 70%.',
      icon: <Clock className="w-8 h-8" />
    },
    {
      title: 'Reduce Costs',
      description: 'Lower operational costs with efficient property management workflows.',
      icon: <BarChart3 className="w-8 h-8" />
    },
    {
      title: 'Improve Satisfaction',
      description: 'Enhance tenant experience with responsive communication and transparency.',
      icon: <CheckCircle2 className="w-8 h-8" />
    }
  ];

  return (
    <>
      <Head title="Welcome" />
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">FlatEase</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </a>
                <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Benefits
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </a>
                {!auth.user && (
                  <>
                    <Link
                      href={route('login')}
                      className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={route('register')}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <div className="flex flex-col gap-4">
                  <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Features
                  </a>
                  <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Benefits
                  </a>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </a>
                  {!auth.user && (
                    <>
                      <Link
                        href={route('login')}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors text-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        href={route('register')}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm mb-6">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Modern Property Management Platform
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Simplify Your Apartment Management
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                  FlatEase is the all-in-one platform for property managers and tenants.
                  Manage leases, track payments, handle complaints, and store documents securely—all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={route('register')}
                    className="px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="px-8 py-4 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors text-lg">
                    View Demo
                  </button>
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>

              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1559329146-807aff9ff1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MDg3Mzc5NHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Modern apartment building"
                    className="w-full h-auto"
                  />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">500+</p>
                      <p className="text-sm text-gray-600">Properties Managed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Manage Properties
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to streamline your property management workflow and improve tenant satisfaction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1738168246881-40f35f8aba0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzcwODE5NTE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Luxury apartment interior"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose FlatEase?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Join thousands of property managers who have transformed their workflow with FlatEase.
                </p>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">500+</p>
                <p className="text-blue-100">Properties</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">2,000+</p>
                <p className="text-blue-100">Active Tenants</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">98%</p>
                <p className="text-blue-100">Satisfaction Rate</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">24/7</p>
                <p className="text-blue-100">Support Available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the plan that's right for you. All plans include a 14-day free trial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Perfect for small properties</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Up to 10 units</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Basic reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">5GB storage</span>
                  </li>
                </ul>
                <Link
                  href={route('register')}
                  className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors block text-center"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Professional Plan */}
              <div className="p-8 rounded-2xl border-2 border-blue-600 bg-blue-50 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-sm">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">For growing portfolios</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$79</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Up to 50 units</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">50GB storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom branding</span>
                  </li>
                </ul>
                <Link
                  href={route('register')}
                  className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors block text-center"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For large organizations</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited units</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">SLA guarantee</span>
                  </li>
                </ul>
                <button className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of property managers who have streamlined their operations with FlatEase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={route('register')}
                className="px-8 py-4 rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-colors text-lg font-semibold inline-block"
              >
                Start Free Trial
              </Link>
              <button className="px-8 py-4 rounded-lg border-2 border-white text-white hover:bg-blue-600 transition-colors text-lg font-semibold">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-blue-500" />
                  <span className="text-lg font-semibold text-white">FlatEase</span>
                </div>
                <p className="text-sm">
                  Modern apartment management platform for property managers and tenants.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800 text-sm text-center">
              <p>© 2026 FlatEase. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
