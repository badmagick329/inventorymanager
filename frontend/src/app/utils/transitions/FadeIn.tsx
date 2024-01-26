'use client';
import { motion } from 'framer-motion';

export default function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: -30, rotate: 0 }}
      animate={{ x: [-25, 0], rotate: [2, 0] }}
      transition={{
        ease: 'easeInOut',
        duration: 0.60,
      }}
    >
      {children}
    </motion.div>
  );
}
