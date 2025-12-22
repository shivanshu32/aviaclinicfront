'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, CheckCircle, Mail, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/lib/services';

const benefits = [
  'Free 14-day trial',
  'No credit card required',
  'Cancel anytime',
  'Full feature access',
];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    ownerName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.ownerName.trim()) {
      setError('Your name is required');
      return;
    }

    setLoading(true);
    try {
      await authService.signup(formData);
      setSuccess(true);
      toast.success('Registration successful! Check your email.');
    } catch (err: any) {
      setError(err.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-secondary-800 mb-3">
              Check Your Email
            </h1>
            <p className="font-sans text-secondary-600 mb-6 leading-relaxed">
              We&apos;ve sent an activation link to<br />
              <strong className="text-secondary-800">{formData.email}</strong>
            </p>
            <p className="font-sans text-sm text-secondary-400 mb-8">
              Click the link to activate your account and set your password.<br />
              The link will expire in 24 hours.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold font-sans transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-700 via-secondary-600 to-primary-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link href="/" className="mb-12">
            <Image
              src="/avialogo.png"
              alt="Avia Wellness"
              width={180}
              height={45}
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-sans font-medium mb-6 w-fit">
            <Sparkles className="w-4 h-4" />
            Start your journey today
          </div>
          
          <h1 className="font-heading text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Transform Your
            <span className="block text-primary-300">Clinic Management</span>
          </h1>
          
          <p className="font-sans text-lg text-white/80 mb-10 max-w-md leading-relaxed">
            Join thousands of healthcare providers who trust Avia Wellness to streamline their practice.
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-300" />
                <span className="font-sans text-white/90 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 font-sans text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="text-center">
              <Image
                src="/avialogo.png"
                alt="Avia Wellness"
                width={160}
                height={40}
                className="h-10 w-auto mx-auto"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold text-secondary-800">
              Start Your Free Trial
            </h2>
            <p className="font-sans text-secondary-500 mt-2">
              14 days free, no credit card required
            </p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-sans">
                  {error}
                </div>
              )}

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2 font-sans">
                  Your Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-secondary-800 placeholder:text-gray-400"
                  placeholder="Dr. John Smith"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2 font-sans">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-secondary-800 placeholder:text-gray-400"
                  placeholder="you@clinic.com"
                  autoComplete="email"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2 font-sans">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-secondary-800 placeholder:text-gray-400"
                  placeholder="10 digit phone number"
                  maxLength={10}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 font-sans"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-secondary-500 font-sans">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-8 font-sans">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-secondary-500 hover:text-secondary-600">Terms</Link>
            {' '}and{' '}
            <Link href="#" className="text-secondary-500 hover:text-secondary-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
