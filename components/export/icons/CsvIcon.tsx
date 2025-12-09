'use client'

import { motion } from 'framer-motion'

export default function CsvIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Table Frame */}
      <motion.rect
        x="8"
        y="10"
        width="48"
        height="44"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Header Row */}
      <motion.rect
        x="8"
        y="10"
        width="48"
        height="10"
        fill="currentColor"
        fillOpacity="0.15"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ transformOrigin: 'left' }}
      />

      {/* Vertical Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <line x1="24" y1="10" x2="24" y2="54" stroke="currentColor" strokeWidth="1.5" />
        <line x1="40" y1="10" x2="40" y2="54" stroke="currentColor" strokeWidth="1.5" />
      </motion.g>

      {/* Horizontal Lines - Sequential */}
      <motion.line
        x1="8" y1="20" x2="56" y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      />
      <motion.line
        x1="8" y1="31" x2="56" y2="31"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      />
      <motion.line
        x1="8" y1="42" x2="56" y2="42"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      />

      {/* Data Cells Animation */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {/* Row 1 */}
        <motion.rect x="11" y="23" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.rect x="27" y="23" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.rect x="43" y="23" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />

        {/* Row 2 */}
        <motion.rect x="11" y="34" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
        <motion.rect x="27" y="34" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />
        <motion.rect x="43" y="34" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        {/* Row 3 */}
        <motion.rect x="11" y="45" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
        />
        <motion.rect x="27" y="45" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
        />
        <motion.rect x="43" y="45" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.3"
          animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.6 }}
        />
      </motion.g>

      {/* Header Labels */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <rect x="11" y="13" width="8" height="4" rx="1" fill="currentColor" />
        <rect x="27" y="13" width="8" height="4" rx="1" fill="currentColor" />
        <rect x="43" y="13" width="8" height="4" rx="1" fill="currentColor" />
      </motion.g>
    </motion.svg>
  )
}
