'use client'

import { motion } from 'framer-motion'

export default function TimeIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Clock Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Clock Center */}
      <motion.circle
        cx="32"
        cy="32"
        r="3"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />

      {/* Hour Hand */}
      <motion.line
        x1="32"
        y1="32"
        x2="32"
        y2="20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformOrigin: '32px 32px' }}
      />

      {/* Minute Hand */}
      <motion.line
        x1="32"
        y1="32"
        x2="32"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformOrigin: '32px 32px' }}
      />

      {/* Speed Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <line x1="52" y1="20" x2="58" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="54" y1="28" x2="60" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="54" y1="36" x2="60" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* Building Silhouette (small) */}
      <motion.path
        d="M4 58 L4 44 L10 44 L10 50 L16 50 L16 40 L22 40 L22 58 Z"
        fill="currentColor"
        fillOpacity="0.3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      />
    </motion.svg>
  )
}
