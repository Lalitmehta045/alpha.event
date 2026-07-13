import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

export interface AnimatedCategoryBadgeProps {
  text: string;
  category?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Always use the blue color
const blueGradient = 'linear-gradient(135deg, #1e3a8a, #2563eb)';

const AnimatedCategoryBadge: React.FC<AnimatedCategoryBadgeProps> = ({
  text,
  category,
  className = '',
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const backgroundStyle = blueGradient;

  const containerVariants: Variants = {
    hidden: {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0
    },
    visible: {
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const initial = shouldReduceMotion ? 'visible' : 'hidden';

  return (
    <motion.div
      initial={initial}
      whileInView="visible"
      viewport={{ once: false }}
      whileHover={{
        scale: 1.05,
        filter: 'brightness(1.1)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.4), 0 10px 25px rgba(0,0,0,0.18)',
        transition: { duration: 0.25 }
      }}
      variants={containerVariants}
      className={`absolute z-10 left-2 flex items-center justify-center rounded-[999px] shadow-[0_5px_15px_rgba(0,0,0,0.15)] backdrop-blur-[6px] text-white font-[700] uppercase tracking-[0.5px]
        px-[6px] py-[2px] text-[7px] h-auto
        sm:h-[18px] sm:px-[8px] sm:py-[2px] sm:text-[8px]
        ${className}`}
      style={{
        background: backgroundStyle,
        ...style
      }}
    >
      {text}
    </motion.div>
  );
};

export default AnimatedCategoryBadge;
