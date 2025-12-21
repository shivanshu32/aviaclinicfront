'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, CheckCircle, Users, Star, TrendingUp, Award } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-700 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-900/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Mobile Screen Image */}
          <motion.div 
            className="relative flex justify-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative">
              {/* Glow effect behind phone */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[3rem] blur-2xl scale-105" />
              
              {/* Phone mockup */}
              <motion.div
                className="relative z-10"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/mobilescreen-portrait.png"
                  alt="Avia Wellness Mobile App"
                  width={280}
                  height={560}
                  className="relative z-10 drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Enhanced Content */}
          <motion.div 
            className="text-center lg:text-left lg:pr-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          >
            {/* Trust Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold mb-4 border-2 border-white/30 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Award size={14} className="text-white" />
              <span className="font-heading">Trusted by 5,000+ Doctors</span>
            </motion.div>
            
            {/* Main Heading - Compact */}
            <motion.h2 
              className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Ready to Transform Your Practice?
            </motion.h2>
            
            {/* Description - Compact */}
            <motion.p 
              className="font-sans text-white/95 text-base md:text-lg mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Join thousands of healthcare providers who have streamlined their operations with Avia Wellness.
            </motion.p>

            {/* Stats Row - Compact */}
            <motion.div 
              className="grid grid-cols-3 gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 }}
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-0.5">
                  <Users size={16} className="text-white" />
                  <p className="font-heading text-xl md:text-2xl font-black text-white">5K+</p>
                </div>
                <p className="font-sans text-xs text-white/80">Doctors</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-0.5">
                  <Star size={16} className="text-white fill-white" />
                  <p className="font-heading text-xl md:text-2xl font-black text-white">4.9</p>
                </div>
                <p className="font-sans text-xs text-white/80">Rating</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-0.5">
                  <TrendingUp size={16} className="text-white" />
                  <p className="font-heading text-xl md:text-2xl font-black text-white">2M+</p>
                </div>
                <p className="font-sans text-xs text-white/80">Patients</p>
              </div>
            </motion.div>
            
            {/* CTA Buttons - Compact */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="#contact"
                  className="group relative bg-white hover:bg-gray-50 text-primary-600 px-8 py-3.5 rounded-xl font-heading font-bold text-base transition-all shadow-2xl hover:shadow-white/20 flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="tel:+919876543210"
                  className="group bg-white/15 backdrop-blur-md border-2 border-white/40 hover:border-white hover:bg-white/25 text-white px-8 py-3.5 rounded-xl font-heading font-bold text-base transition-all hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Talk to Sales
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Trust Indicators - Compact */}
            <motion.div 
              className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 text-sm text-white/95 font-medium font-sans"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <span className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" strokeWidth={3} />
                </div>
                Free 14-day trial
              </span>
              <span className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" strokeWidth={3} />
                </div>
                No credit card required
              </span>
              <span className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" strokeWidth={3} />
                </div>
                Cancel anytime
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
