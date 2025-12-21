'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle, Zap, Shield, Clock, Award, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SectionHeader from '@/utils/sectionHeaders';
import PriceToggle from '@/components/ui/PriceToggle';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: '₹999',
    yearlyPrice: '₹8,388',
    period: 'month',
    description: 'Perfect for solo practitioners starting their digital journey.',
    features: [
      'Up to 100 appointments/month',
      'Basic EMR & patient records',
      'Digital prescriptions',
      'WhatsApp notifications',
      'Basic reports',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
    icon: <Zap size={20} className="text-white" />,
    color: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
    borderColor: 'border-violet-200',
    accentColor: 'violet',
  },
  {
    name: 'Professional',
    monthlyPrice: '₹2,499',
    yearlyPrice: '₹23,990',
    period: 'month',
    description: 'Ideal for growing clinics with multiple doctors.',
    features: [
      'Unlimited appointments',
      'Advanced EMR features',
      'Voice prescriptions',
      'SMS & WhatsApp campaigns',
      'Custom report templates',
      'Insurance claims processing',
      'Multi-doctor support',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: false,
    icon: <Award size={20} className="text-white" />,
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-blue-50 via-cyan-50 to-teal-50',
    borderColor: 'border-blue-200',
    accentColor: 'blue',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    period: '',
    description: 'For healthcare chains and large hospitals.',
    features: [
      'Everything in Professional',
      'Multi-location management',
      'Custom integrations',
      'Dedicated account manager',
      'On-premise deployment option',
      'SLA guarantee',
      'Training & onboarding',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
    icon: <Shield size={20} className="text-white" />,
    color: 'from-orange-500 via-rose-500 to-pink-500',
    bgGradient: 'from-orange-50 via-rose-50 to-pink-50',
    borderColor: 'border-orange-200',
    accentColor: 'orange',
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const constraintsRef = useRef(null);

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/20 via-purple-200/20 to-fuchsia-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200/20 via-blue-200/20 to-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-rose-200/20 via-pink-200/20 to-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          title="Pricing"
          subtitle="Simple, Transparent"
          description="Choose the plan that fits your practice. All plans include a 14-day free trial."
        />

        {/* Billing Toggle */}
        <PriceToggle onToggle={setIsYearly} />

        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10"
          ref={constraintsRef}
        >
          <AnimatePresence>
            {plans.map((plan, index) => (
              <PricingCard 
                key={index} 
                index={index}
                isYearly={isYearly}
                isHovered={hoveredCard === index}
                onHoverChange={(hovered) => setHoveredCard(hovered ? index : null)}
                {...plan} 
              />
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

interface PricingCardProps {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  index: number;
  isYearly: boolean;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  monthlyPrice,
  yearlyPrice,
  period,
  description,
  features,
  cta,
  popular,
  icon,
  color,
  bgGradient,
  borderColor,
  accentColor,
  index,
  isYearly,
  isHovered,
  onHoverChange,
}) => {

  const price = isYearly ? yearlyPrice : monthlyPrice;
  const isCustom = price === 'Custom';
  const pricePeriod = isCustom ? '' : `/${period}`;

  return (
    <motion.div
      className="relative rounded-3xl p-7 md:p-8 overflow-hidden transition-all duration-500 backdrop-blur-sm border-2 border-gray-200/60 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isHovered ? 1.02 : 1,
        zIndex: isHovered ? 10 : 1,
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.1
      }}
      onHoverStart={() => onHoverChange(true)}
      onHoverEnd={() => onHoverChange(false)}
      style={{
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.02)' 
          : '0 4px 16px -4px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Popular badge */}
      {popular && (
        <motion.div 
          className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${color} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20 border-2 border-white`}
          initial={{ scale: 0.8, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }}
        >
          <Star size={12} fill="currentColor" className="text-white/90" />
          <span>Most Popular</span>
        </motion.div>
      )}
      
      {/* Animated gradient border effect */}
      {isHovered && (
        <motion.div 
          className={`absolute -inset-[2px] bg-gradient-to-br ${color} rounded-3xl opacity-20 blur-md -z-10`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Decorative corner element */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full bg-gradient-to-br ${color} opacity-5 transition-all duration-700 group-hover:scale-125 group-hover:opacity-10`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon centered */}
        <div className="flex justify-center mb-5">
          <motion.div 
            className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color} shadow-xl`}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Plan name centered */}
        <h3 className="font-heading text-2xl font-bold text-secondary-800 mb-2 text-center">
          {name}
        </h3>

        {/* Description centered */}
        <p className="font-sans text-sm text-secondary-600 leading-relaxed mb-5 text-center min-h-[40px]">
          {description}
        </p>

        {/* Price section centered */}
        <div className="mb-6 text-center">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
              {price}
            </span>
            {!isCustom && (
              <span className="font-sans text-base font-semibold text-secondary-600">
                {pricePeriod}
              </span>
            )}
          </div>
          {!isCustom && isYearly && (
            <span className="font-sans inline-block text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
              Save {Math.round((1 - (parseInt(yearlyPrice.replace(/[^0-9]/g, '')) / (parseInt(monthlyPrice.replace(/[^0-9]/g, '')) * 12))) * 100)}%
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-6 rounded-full" />
        
        {/* Features - compact spacing */}
        <ul className="space-y-2.5 mb-7 flex-grow">
          {features.map((feature, idx) => (
            <li 
              key={idx} 
              className="flex items-start gap-2.5"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md`}>
                <CheckCircle
                  size={13}
                  strokeWidth={3}
                  className="text-white"
                />
              </div>
              <span className="font-sans text-sm leading-snug text-secondary-700 font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
        
        {/* CTA Button */}
        <div className="mt-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="#contact"
              className={`font-sans group/btn relative block w-full text-center py-4 px-6 rounded-xl font-bold text-base transition-all overflow-hidden bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {cta}
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
