'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#' },
    { label: 'Updates', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Community', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'HIPAA Compliance', href: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Logo, description, newsletter */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/avialogo.png"
                alt="Avia Wellness"
                width={160}
                height={42}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm font-sans">
              The all-in-one platform to streamline your healthcare practice. From appointments to prescriptions, manage everything effortlessly.
            </p>
            
            {/* Newsletter Signup */}
            <div>
              <label htmlFor="newsletter-email" className="font-sans font-semibold text-sm text-slate-200 mb-2 block">Stay Updated</label>
              <div className="flex">
                <input 
                  type="email" 
                  id="newsletter-email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-l-lg bg-slate-800 border-2 border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm text-white"
                />
                <button className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2.5 rounded-r-lg font-bold text-sm hover:from-primary-600 hover:to-primary-700 transition-all">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Columns: Links */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="font-heading font-bold text-sm uppercase text-slate-400 mb-4 tracking-wider">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-primary-400 text-sm font-sans transition-colors duration-200 hover:pl-1 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm uppercase text-slate-400 mb-4 tracking-wider">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-primary-400 text-sm font-sans transition-colors duration-200 hover:pl-1 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm uppercase text-slate-400 mb-4 tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-primary-400 text-sm font-sans transition-colors duration-200 hover:pl-1 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm uppercase text-slate-400 mb-4 tracking-wider">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-primary-400 text-sm font-sans transition-colors duration-200 hover:pl-1 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-sans text-center md:text-left">
            © {new Date().getFullYear()} Avia Wellness, a product of Abscod Informatics. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-slate-500 hover:text-primary-400 transition-colors duration-300"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
