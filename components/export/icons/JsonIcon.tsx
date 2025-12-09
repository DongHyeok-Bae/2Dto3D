'use client'

import { motion } from 'framer-motion'

export default function JsonIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Left Curly Brace */}
      <motion.path
        d="M20 12 C12 12 12 20 12 24 C12 28 8 32 8 32 C8 32 12 36 12 40 C12 44 12 52 20 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Right Curly Brace */}
      <motion.path
        d="M44 12 C52 12 52 20 52 24 C52 28 56 32 56 32 C56 32 52 36 52 40 C52 44 52 52 44 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Data Dots - Sequential Animation */}
      <motion.g>
        <motion.circle
          cx="26"
          cy="24"
          r="3"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
        <motion.circle
          cx="38"
          cy="24"
          r="3"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.3 }}
        />
        <motion.circle
          cx="32"
          cy="32"
          r="3"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
        />
        <motion.circle
          cx="26"
          cy="40"
          r="3"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.3 }}
        />
        <motion.circle
          cx="38"
          cy="40"
          r="3"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        />
      </motion.g>

      {/* Connection Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.3, duration: 0.4 }}
      >
        <line x1="26" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="32" y1="24" x2="32" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="26" y1="40" x2="38" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      </motion.g>

      {/* Pulse Effect on Center */}
      <motion.circle
        cx="32"
        cy="32"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  )
}
