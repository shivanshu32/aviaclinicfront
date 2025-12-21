import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  description: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  className = '',
  subtitleClassName = '',
  descriptionClassName = '',
}) => {
  return (
    <motion.div 
      className={`text-center max-w-5xl mx-auto mb-20 md:mb-28 relative ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Multi-line Heading matching Hero style */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.3] ${subtitleClassName}`}>
          {/* First line - Navy text like Hero */}
          <span className="text-secondary-800 block py-2">
            {subtitle}
          </span>
          {/* Second line - Gradient text like Hero */}
          <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 bg-clip-text text-transparent block mt-2 py-2">
            {title}
          </span>
        </h2>
      </motion.div>
      
      {/* Premium Description with decorative elements */}
      <motion.div 
        className="max-w-3xl mx-auto px-4 relative mb-6"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Decorative quote marks */}
        <div className="absolute -left-2 -top-2 text-primary-200 text-6xl font-serif leading-none opacity-30">&ldquo;</div>
        <div className="absolute -right-2 -bottom-6 text-primary-200 text-6xl font-serif leading-none opacity-30">&rdquo;</div>
        
        <p className={`relative text-lg md:text-xl lg:text-2xl leading-relaxed font-sans font-normal text-secondary-600/95 pb-4 ${descriptionClassName}`}>
          {description}
        </p>
      </motion.div>

      {/* Bottom decorative accent line */}
      <motion.div 
        className="flex items-center justify-center gap-2 mt-8"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-primary-300 to-primary-400 rounded-full" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
        <div className="h-[2px] w-20 bg-gradient-to-l from-transparent via-primary-400 to-primary-300 rounded-full" />
      </motion.div>
      
    </motion.div>
  );
};

export default SectionHeader;