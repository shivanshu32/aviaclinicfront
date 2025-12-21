'use client';

import { Star, Quote } from 'lucide-react';
import SectionHeader from '@/utils/sectionHeaders';

const testimonials = [
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Cardiologist, Delhi',
    content: 'Avia Wellness has transformed how I manage my practice. The digital prescriptions and WhatsApp integration save me hours every day. My patients love the online booking feature.',
    rating: 5,
  },
  {
    name: 'Dr. Priya Sharma',
    role: 'Pediatrician, Mumbai',
    content: 'The EMR system is incredibly intuitive. I can access patient history in seconds, and the voice prescription feature is a game-changer during busy OPD hours.',
    rating: 5,
  },
  {
    name: 'Dr. Amit Patel',
    role: 'Orthopedic Surgeon, Ahmedabad',
    content: 'Managing multiple clinics was a nightmare before Avia Wellness. Now I have complete visibility across all locations from a single dashboard. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Dr. Sunita Reddy',
    role: 'Gynecologist, Hyderabad',
    content: 'The insurance claims AI has reduced our claim processing time by 70%. The automated billing and payment tracking features are excellent.',
    rating: 5,
  },
  {
    name: 'Dr. Mohammed Khan',
    role: 'General Physician, Bangalore',
    content: 'Started with the Starter plan and upgraded to Professional within a month. The ROI is incredible - I&apos;ve reduced my administrative work by half.',
    rating: 5,
  },
  {
    name: 'Dr. Neha Gupta',
    role: 'Dermatologist, Pune',
    content: 'The telemedicine integration with Zoom has been essential for my practice. Patients can book video consultations easily, and prescriptions are sent instantly via WhatsApp.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-100/20 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          title="by Doctors Across India"
          subtitle="Trusted"
          description="See what healthcare professionals are saying about Avia Wellness."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-secondary-700 via-secondary-800 to-secondary-900 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <Stat value="5,000+" label="Healthcare Providers" />
            <Stat value="2M+" label="Patients Served" />
            <Stat value="50+" label="Cities" />
            <Stat value="99.9%" label="Uptime" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-200/20 transition-all duration-500 hover:-translate-y-2">
      <div className="mb-6">
        <Quote size={40} className="text-primary-300 group-hover:text-primary-500 transition-colors" strokeWidth={1.5} />
      </div>
      <p className="text-secondary-600 text-base leading-relaxed mb-6 font-medium">{content}</p>
      <div className="flex items-center gap-1.5 mb-5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" strokeWidth={0} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
          <span className="text-primary-600 font-bold text-lg">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-heading font-bold text-secondary-800">{name}</p>
          <p className="text-sm text-secondary-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent mb-2">{value}</p>
      <p className="text-white text-sm md:text-base font-medium">{label}</p>
    </div>
  );
}
