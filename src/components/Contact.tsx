'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import SectionHeader from '@/utils/sectionHeaders';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clinicName: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your interest! We will contact you shortly.');
    setFormData({ name: '', email: '', phone: '', clinicName: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100/20 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          title="Get in Touch"
          subtitle="Contact Us"
          description="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2 font-sans">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white hover:border-gray-300"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2 font-sans">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white hover:border-gray-300"
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2 font-sans">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white hover:border-gray-300"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label htmlFor="clinicName" className="block text-sm font-medium text-secondary-700 mb-2 font-sans">
                    Clinic/Hospital Name
                  </label>
                  <input
                    type="text"
                    id="clinicName"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white hover:border-gray-300"
                    placeholder="City Hospital"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2 font-sans">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all resize-none bg-white hover:border-gray-300"
                  placeholder="Tell us about your requirements..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-[1.02] flex items-center justify-center gap-3 font-sans"
              >
                Send Message
                <Send size={22} />
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 md:p-10 border-2 border-primary-100">
              <h3 className="font-heading text-2xl font-bold text-secondary-800 mb-8 tracking-tight">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Mail size={26} className="text-primary-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-secondary-800 mb-1.5">Email</p>
                    <a href="mailto:hello@aviawellness.com" className="text-primary-600 hover:text-primary-700 font-sans font-medium text-sm">
                      hello@aviawellness.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Phone size={26} className="text-primary-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-secondary-800 mb-1.5">Phone</p>
                    <a href="tel:+919876543210" className="text-primary-600 hover:text-primary-700 font-sans font-medium text-sm">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MapPin size={26} className="text-primary-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-secondary-800 mb-1.5">Office</p>
                    <p className="text-secondary-600 font-sans font-medium text-sm">
                      123 Healthcare Hub, Sector 5<br />
                      Gurugram, Haryana 122001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-secondary-700 via-secondary-800 to-secondary-900 rounded-3xl p-8 md:p-10 text-white shadow-xl border-2 border-secondary-600">
              <h3 className="font-heading text-2xl font-bold mb-4 tracking-tight">Schedule a Demo</h3>
              <p className="text-secondary-200 mb-8 text-sm leading-relaxed font-sans">
                Want to see Avia Wellness in action? Book a personalized demo with our product experts.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold font-sans transition-all hover:shadow-xl hover:scale-105"
              >
                Book Demo Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
