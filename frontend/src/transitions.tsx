'use client';
import { motion } from 'framer-motion';

export function MoveRight({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: -30, rotate: 0 }}
      animate={{ x: [-25, 0], rotate: [2, 0] }}
      transition={{
        ease: 'easeInOut',
        duration: 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}

export function MoveUp({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: [45, 0], opacity: [0.1, 1] }}
      transition={{
        ease: 'easeInOut',
        duration: 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}
