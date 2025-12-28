
import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  /* Fix: Use React.JSX instead of global JSX namespace to resolve missing namespace error */
  as?: keyof React.JSX.IntrinsicElements;
}

export const TextReveal: React.FC<TextRevealProps> = ({ 
  text, 
  className = "", 
  delay = 0, 
  as: Tag = "span" 
}) => {
  /* Fix: Explicitly typing as Variants to resolve type incompatibility with AnimationGeneratorType */
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i + delay },
    }),
  };

  /* Fix: Explicitly typing as Variants and using 'as const' for transition type */
  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split(" ").map((word, index) => (
        <motion.span
          variants={child}
          style={{ marginRight: "0.5em" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};