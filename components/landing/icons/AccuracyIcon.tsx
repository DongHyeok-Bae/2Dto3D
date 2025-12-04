'use client'

import { motion } from 'framer-motion'

export default function AccuracyIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Outer Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Middle Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      />

      {/* Inner Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      />

      {/* Center Dot */}
      <motion.circle
        cx="32"
        cy="32"
        r="3"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1] }}
        transition={{ delay: 1, duration: 0.5 }}
      />

      {/* Crosshair Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <line x1="32" y1="2" x2="32" y2="14" stroke="currentColor" strokeWidth="2" />
        <line x1="32" y1="50" x2="32" y2="62" stroke="currentColor" strokeWidth="2" />
        <line x1="2" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="32" x2="62" y2="32" stroke="currentColor" strokeWidth="2" />
      </motion.g>

      {/* Laser Scan Effect */}
      <motion.line
        x1="32"
        y1="4"
        x2="32"
        y2="60"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '32px 32px' }}
      />
    </motion.svg>
  )
}
