'use client';

import { Variants } from 'framer-motion';

export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  }),
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export const titleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const featureItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -10 
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
  hover: {
    x: 4,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

export const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 0.7,
    y: 10,
    transition: {
      duration: 0.3
    }
  },
  hover: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

export const glowVariants = {
  hidden: { opacity: 0 },
  hover: {
    opacity: 0.5,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};
