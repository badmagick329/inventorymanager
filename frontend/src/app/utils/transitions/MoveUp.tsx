'use client';
import { motion } from 'framer-motion';

export default function MoveUp({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: [45, 0], opacity: [0.1, 1] }}
      transition={{
        ease: 'easeInOut',
        duration: 0.60,
      }}
    >
      {children}
    </motion.div>
  );
}
