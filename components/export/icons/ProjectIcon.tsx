'use client'

import { motion } from 'framer-motion'

export default function ProjectIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Folder Base */}
      <motion.path
        d="M8 18 L8 52 Q8 54 10 54 L54 54 Q56 54 56 52 L56 22 Q56 20 54 20 L30 20 L26 14 L10 14 Q8 14 8 16 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Folder Tab */}
      <motion.path
        d="M8 18 L8 16 Q8 14 10 14 L26 14 L30 20 L8 20 Z"
        fill="currentColor"
        fillOpacity="0.25"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        style={{ transformOrigin: 'left' }}
      />

      {/* Document 1 */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <rect x="16" y="26" width="20" height="24" rx="2" fill="white" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="32" x2="32" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="36" x2="30" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="40" x2="32" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="44" x2="28" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </motion.g>

      {/* Document 2 (Behind) */}
      <motion.rect
        x="20"
        y="24"
        width="20"
        height="24"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1"
        initial={{ x: 16, opacity: 0 }}
        animate={{ x: 20, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      />

      {/* Save Disk Icon */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <rect x="40" y="32" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="43" y="32" width="8" height="5" fill="currentColor" fillOpacity="0.2" />
        <rect x="44" y="40" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.4" />
      </motion.g>

      {/* Save Arrow */}
      <motion.g
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <motion.path
          d="M47 24 L47 30 M44 27 L47 30 L50 27"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.g>

      {/* Progress Ring */}
      <motion.circle
        cx="47"
        cy="39"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="62.8"
        initial={{ strokeDashoffset: 62.8 }}
        animate={{ strokeDashoffset: [62.8, 0, 62.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        opacity={0.3}
      />

      {/* Success Checkmark (appears at end) */}
      <motion.path
        d="M44 39 L46 41 L50 37"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
      />

      {/* Sparkles */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
      >
        <circle cx="52" y="28" r="1.5" fill="currentColor" />
        <circle cx="56" y="36" r="1" fill="currentColor" />
        <circle cx="54" y="48" r="1.5" fill="currentColor" />
      </motion.g>
    </motion.svg>
  )
}
