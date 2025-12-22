'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, CheckCircle, ArrowRight } from 'lucide-react';

const highlights = [
  'Free 14-day trial',
  'No credit card required',
  'Cancel anytime',
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden flex items-center min-h-[calc(100vh-120px)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 -z-10" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-200/30 to-primary-100/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary-200/30 to-secondary-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-left space-y-5">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 px-4 py-2 rounded-full text-xs font-sans font-bold border border-primary-200/50 shadow-sm tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
              </span>
              Trusted by 5,000+ Healthcare Providers
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-800 leading-[1.15]">
              Modern Clinic Management
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 bg-clip-text text-transparent block mt-2">Made Simple & Powerful</span>
            </h1>

            <p className="font-sans text-base md:text-lg text-secondary-600 leading-relaxed max-w-xl">
              Streamline your healthcare practice with our all-in-one platform. From appointments to prescriptions, 
              billing to patient engagement — manage everything effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/signup"
                className="group w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3.5 rounded-xl font-sans font-bold text-base transition-all hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 flex items-center justify-center gap-2 tracking-wide"
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group w-full sm:w-auto bg-white/80 backdrop-blur-sm border-2 border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50 text-secondary-700 px-8 py-3.5 rounded-xl font-sans font-bold text-base transition-all hover:shadow-xl flex items-center justify-center gap-2 tracking-wide">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Play size={16} className="text-primary-600 ml-0.5" fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-secondary-500 font-sans font-semibold">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-primary-500" strokeWidth={2.5} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* iMac Mockup - Clean Single Image Display */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-4xl">
              {/* Animated Glow Effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 rounded-3xl blur-3xl animate-glow"></div>
              
              {/* iMac Container with Hover Effect */}
              <div className="relative animate-float transform hover:scale-[1.02] transition-all duration-500 ease-out">
                {/* Shadow Layer */}
                <div className="absolute inset-0 bg-gray-900/20 rounded-2xl blur-2xl translate-y-8"></div>
                
                {/* iMac Image */}
                <div className="relative w-full">
                  <Image
                    src="/imacplaceholder.png"
                    alt="Avia Wellness Dashboard on iMac"
                    width={1280}
                    height={853}
                    className="w-full h-auto drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
