'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PriceToggle({ onToggle }: { onToggle: (isYearly: boolean) => void }) {
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    onToggle(isYearly);
  }, [isYearly, onToggle]);

  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`font-medium ${!isYearly ? 'text-primary-600' : 'text-gray-400'}`}>Monthly</span>
      <button
        onClick={() => setIsYearly(!isYearly)}
        className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
          isYearly ? 'bg-primary-500' : 'bg-gray-200'
        }`}
      >
        <motion.div
          className="w-6 h-6 bg-white rounded-full shadow-md"
          layout
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30
          }}
          style={{
            x: isYearly ? 'calc(100% + 0.5rem)' : '0%',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isYearly ? 'yearly' : 'monthly'}
              className="absolute inset-0 flex items-center justify-center text-xs font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isYearly ? '✓' : ''}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </button>
      <div className="relative">
        <span className={`font-medium ${isYearly ? 'text-primary-600' : 'text-gray-400'}`}>
          Yearly
        </span>
        {isYearly && (
          <motion.span 
            className="absolute -top-6 -right-8 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            2 months free
          </motion.span>
        )}
      </div>
    </div>
  );
}
