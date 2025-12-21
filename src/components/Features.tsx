'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '@/utils/sectionHeaders';
import { 
  Calendar, 
  FileText, 
  Pill, 
  MessageCircle, 
  FileBarChart, 
  CreditCard, 
  Building2, 
  Shield, 
  Smartphone,
  Video,
  Brain,
  Cloud,
  Users,
  Bell,
  Star,
  Stethoscope,
  ClipboardList,
  Receipt,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';

const featureCategories = [
  {
    id: 'scheduling',
    label: 'Scheduling',
    icon: Calendar,
    color: 'from-violet-500 via-purple-500 to-fuchsia-500',
    features: [
      {
        icon: Calendar,
        title: 'Smart Scheduling',
        description: '24/7 online booking with automated reminders, calendar sync, and real-time availability.',
        highlights: ['Online Booking', 'Auto Reminders', 'Calendar Sync']
      },
      {
        icon: Bell,
        title: 'Automated Reminders',
        description: 'Send SMS, email, and WhatsApp reminders to reduce no-shows and improve attendance.',
        highlights: ['SMS Alerts', 'Email Reminders', 'WhatsApp Notifications']
      },
      {
        icon: Users,
        title: 'Waitlist Management',
        description: 'Efficiently manage patient waitlists and fill cancellations automatically.',
        highlights: ['Auto-fill Slots', 'Priority Queue', 'Real-time Updates']
      }
    ]
  },
  {
    id: 'clinical',
    label: 'Clinical Tools',
    icon: Stethoscope,
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    features: [
      {
        icon: FileText,
        title: 'Electronic Medical Records',
        description: 'Complete patient history with timeline view, quick search, and secure cloud storage.',
        highlights: ['Patient History', 'Timeline View', 'Cloud Storage']
      },
      {
        icon: Brain,
        title: 'AI Diagnostics',
        description: 'Smart diagnostic suggestions powered by machine learning and pattern recognition.',
        highlights: ['ML Powered', 'Smart Alerts', '95% Accuracy']
      },
      {
        icon: Pill,
        title: 'Digital Prescriptions',
        description: 'Voice-enabled prescription generation with comprehensive drug database.',
        highlights: ['Voice Input', '50K+ Drugs', 'Print & Share']
      }
    ]
  },
  {
    id: 'billing',
    label: 'Billing & Finance',
    icon: CreditCard,
    color: 'from-orange-500 via-rose-500 to-pink-500',
    features: [
      {
        icon: CreditCard,
        title: 'Billing & Payments',
        description: 'Multi-gateway payment support with automated invoicing and receipt generation.',
        highlights: ['Razorpay', 'Stripe', 'Auto Invoice']
      },
      {
        icon: Shield,
        title: 'Insurance Claims',
        description: 'Automated claim filing with TPA integration and real-time status tracking.',
        highlights: ['Auto Filing', 'TPA Integration', 'Fast Processing']
      },
      {
        icon: Receipt,
        title: 'Financial Reports',
        description: 'Comprehensive financial analytics with revenue tracking and expense management.',
        highlights: ['Revenue Reports', 'Expense Tracking', 'Tax Reports']
      }
    ]
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    color: 'from-primary-500 via-primary-600 to-secondary-600',
    features: [
      {
        icon: MessageCircle,
        title: 'WhatsApp Integration',
        description: 'Direct sharing of prescriptions, appointments, and reports via WhatsApp.',
        highlights: ['Direct Share', 'Bulk Messages', 'Templates']
      },
      {
        icon: Video,
        title: 'Telemedicine',
        description: 'HD video consultations with screen sharing and session recording capabilities.',
        highlights: ['HD Video', 'Screen Share', 'Recording']
      },
      {
        icon: FileBarChart,
        title: 'Analytics Dashboard',
        description: 'Real-time insights, financial reports, and comprehensive business analytics.',
        highlights: ['Live Data', 'Reports', 'Insights']
      }
    ]
  }
];


export default function Features() {
  const [activeTab, setActiveTab] = useState('scheduling');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeCategory = featureCategories.find(cat => cat.id === activeTab);
  const activeFeatures = activeCategory?.features || [];
  const activeColor = activeCategory?.color || 'from-primary-500 via-primary-600 to-secondary-600';

  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background elements - matching Pricing section */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/20 via-purple-200/20 to-fuchsia-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200/20 via-blue-200/20 to-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-rose-200/20 via-pink-200/20 to-orange-200/20 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader 
          title="for Everything You Need"
          subtitle="Powerful Features"
          description="Comprehensive tools designed for modern healthcare providers"
        />

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {featureCategories.map((category) => {
            const TabIcon = category.icon;
            const isActive = activeTab === category.id;
            
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TabIcon size={18} strokeWidth={2.5} />
                {category.label}
              </motion.button>
            );
          })}
        </div>

        {/* Grid Layout - matching Solutions section */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {activeFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                {/* Card - matching Pricing card style with dynamic colors */}
                <div className="relative h-full rounded-3xl p-6 md:p-7 overflow-hidden transition-all duration-500 backdrop-blur-sm border-2 border-gray-200/60 bg-white"
                  style={{
                    boxShadow: isHovered
                      ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.02)'
                      : '0 4px 16px -4px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {/* Gradient Border on Hover */}
                  {isHovered && (
                    <motion.div 
                      className={`absolute -inset-[2px] bg-gradient-to-br ${activeColor} rounded-3xl opacity-20 blur-md -z-10`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Decorative corner element */}
                  <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full bg-gradient-to-br ${activeColor} opacity-5 transition-all duration-700 group-hover:scale-125 group-hover:opacity-10`} />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon - centered */}
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${activeColor} shadow-xl mb-5`}
                      animate={{
                        scale: isHovered ? 1.1 : 1,
                        rotate: isHovered ? 5 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Icon size={22} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                    
                    {/* Title - centered */}
                    <h3 className="font-heading text-2xl font-bold text-secondary-800 mb-3">
                      {feature.title}
                    </h3>

                    {/* Description - centered */}
                    <p className="font-sans text-base leading-relaxed mb-6 text-secondary-600">
                      {feature.description}
                    </p>

                    {/* Divider */}
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-5 rounded-full" />

                    {/* Highlights - centered rounded border tags */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {feature.highlights.map((highlight, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                          className={`px-3 py-1.5 rounded-full border-2 bg-gradient-to-br ${activeColor} border-transparent text-xs font-sans font-medium text-white shadow-md transition-all duration-300 cursor-default hover:scale-105`}
                        >
                          {highlight}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
