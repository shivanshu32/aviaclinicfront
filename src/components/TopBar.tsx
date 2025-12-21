'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Phone, Mail } from 'lucide-react';

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function TopBar() {
  return (
    <div className="hidden md:block bg-secondary-800 text-white py-2 border-b border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="hover:text-primary-400 transition-colors"
                aria-label={social.label}
              >
                <social.icon size={16} />
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <a 
              href="tel:+918630062102" 
              className="flex items-center gap-2 hover:text-primary-400 transition-colors font-display"
            >
              <Phone size={14} />
              <span>+91 8630062102</span>
            </a>
            <a 
              href="mailto:info@aviawellness.com" 
              className="flex items-center gap-2 hover:text-primary-400 transition-colors font-display"
            >
              <Mail size={14} />
              <span>info@aviawellness.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
