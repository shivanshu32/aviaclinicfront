'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Network, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SectionHeader from '@/utils/sectionHeaders';

const solutions = [
  {
    title: 'For Solo Practitioners',
    description: 'Perfect for individual doctors looking to digitize their practice.',
    features: [
      'Easy appointment management',
      'Digital prescriptions',
      'Patient records & history',
      'Basic billing & receipts',
    ],
    highlight: false,
    stats: {
      users: '500+',
      rating: '4.8',
      price: '₹999',
      period: 'month'
    },
    color: 'from-orange-500 via-rose-500 to-pink-500',
  },
  {
    title: 'For Clinics & Hospitals',
    description: 'Comprehensive solution for multi-doctor clinics and hospitals.',
    features: [
      'Multi-doctor scheduling',
      'OPD & IPD management',
      'Insurance claims processing',
      'Advanced analytics',
    ],
    highlight: false,
    stats: {
      users: '1,200+',
      rating: '4.9',
      price: '₹2,499',
      period: 'month'
    },
    color: 'from-primary-500 via-primary-600 to-secondary-600',
  },
  {
    title: 'For Healthcare Chains',
    description: 'Enterprise-grade solution for healthcare chains with multiple locations.',
    features: [
      'Multi-location management',
      'Centralized dashboard',
      'Custom integrations',
      'Dedicated support',
    ],
    highlight: false,
    stats: {
      users: '300+',
      rating: '5.0',
      price: 'Custom',
      period: ''
    },
    color: 'from-blue-500 via-cyan-500 to-teal-500',
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background elements - matching other sections */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/20 via-purple-200/20 to-fuchsia-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200/20 via-blue-200/20 to-teal-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-rose-200/20 via-pink-200/20 to-orange-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          title="for Every Healthcare Provider"
          subtitle="Tailored Solutions"
          description="Whether you're a solo practitioner or managing a healthcare chain, we have the right solution for you."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {solutions.map((solution, index) => (
            <SolutionCard key={index} index={index} {...solution} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface SolutionCardProps {
  title: string;
  description: string;
  features: string[];
  highlight: boolean;
  index: number;
  stats: {
    users: string;
    rating: string;
    price: string;
    period: string;
  };
  color: string;
}

const SolutionCard: React.FC<SolutionCardProps> = ({
  title,
  description,
  features,
  highlight,
  index,
  color
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    const iconClass = 'text-white';
    switch (title) {
      case 'For Solo Practitioners':
        return <User size={22} className={iconClass} strokeWidth={2.5} />;
      case 'For Clinics & Hospitals':
        return <Building2 size={22} className={iconClass} strokeWidth={2.5} />;
      case 'For Healthcare Chains':
        return <Network size={22} className={iconClass} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Premium card container */}
      <div
        className="relative h-full rounded-3xl p-8 md:p-9 overflow-hidden transition-all duration-500 backdrop-blur-sm border-2 border-gray-200/60 bg-white flex flex-col"
        style={{
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.02)'
            : '0 4px 16px -4px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Gradient border glow on hover */}
        {isHovered && (
          <motion.div 
            className={`absolute -inset-[2px] bg-gradient-to-br ${color} rounded-3xl opacity-20 blur-md -z-10`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Popular badge */}
        {highlight && (
          <motion.div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20 border-2 border-white"
            initial={{ scale: 0.8, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Most Popular
          </motion.div>
        )}

        {/* Decorative corner element */}
        <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full bg-gradient-to-br ${color} opacity-5 transition-all duration-700 group-hover:scale-125 group-hover:opacity-10`} />
        
        <div className="relative z-10 flex-grow flex flex-col">
          {/* Icon - centered at top */}
          <div className="flex justify-center mb-6">
            <motion.div 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br ${color}`}
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {getIcon()}
            </motion.div>
          </div>

          {/* Title - centered */}
          <h3 className="font-heading text-2xl font-bold text-secondary-800 mb-3 text-center">
            {title}
          </h3>

          {/* Description - centered */}
          <p className="font-sans text-base leading-relaxed mb-6 text-secondary-600 text-center">
            {description}
          </p>

          {/* Divider */}
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-6 rounded-full" />
          
          {/* Features list - left aligned */}
          <ul className="space-y-3.5 mb-8 flex-grow">
            {features.map((feature, idx) => (
              <motion.li 
                key={idx} 
                className="flex items-start gap-3 group/item"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md bg-gradient-to-br ${color}`}>
                  <CheckCircle2
                    size={13}
                    strokeWidth={3}
                    className="text-white"
                  />
                </div>
                <span className="text-sm leading-snug text-secondary-700 font-medium font-sans">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* CTA Button - enhanced */}
        <div className="mt-auto pt-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="#contact"
              className={`group/btn relative w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 overflow-hidden bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl`}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
