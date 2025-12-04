'use client'

import { motion } from 'framer-motion'

export default function DataIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Blueprint Paper */}
      <motion.rect
        x="8"
        y="8"
        width="36"
        height="48"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Blueprint Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <line x1="14" y1="18" x2="38" y2="18" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="26" x2="32" y2="26" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="34" x2="36" y2="34" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="42" x2="28" y2="42" stroke="currentColor" strokeWidth="1.5" />
      </motion.g>

      {/* Data Nodes */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {/* Central Node */}
        <circle cx="50" cy="24" r="6" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />

        {/* Connected Nodes */}
        <motion.circle
          cx="56"
          cy="40"
          r="4"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="50"
          cy="52"
          r="4"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
      </motion.g>

      {/* Connection Lines */}
      <motion.g
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <line x1="50" y1="30" x2="56" y2="36" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="50" y1="30" x2="50" y2="48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="44" y1="34" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      </motion.g>

      {/* Data Flow Particles */}
      <motion.circle
        cx="50"
        cy="30"
        r="2"
        fill="currentColor"
        animate={{
          cy: [30, 48, 30],
          opacity: [1, 0.5, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  )
}
