'use client'

import { motion } from 'framer-motion'

export default function IfcIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Building Base - Ground Floor */}
      <motion.rect
        x="12"
        y="44"
        width="40"
        height="12"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Second Floor */}
      <motion.rect
        x="14"
        y="32"
        width="36"
        height="12"
        rx="1"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Third Floor */}
      <motion.rect
        x="16"
        y="20"
        width="32"
        height="12"
        rx="1"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Roof */}
      <motion.polygon
        points="32,6 50,20 14,20"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Windows - Ground Floor */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.3 }}
      >
        <rect x="16" y="48" width="6" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
        <rect x="29" y="48" width="6" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
        <rect x="42" y="48" width="6" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
      </motion.g>

      {/* Windows - Second Floor */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      >
        <rect x="18" y="35" width="5" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
        <rect x="29.5" y="35" width="5" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
        <rect x="41" y="35" width="5" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
      </motion.g>

      {/* Windows - Third Floor */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.3 }}
      >
        <rect x="20" y="23" width="5" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
        <rect x="29.5" y="23" width="5" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
        <rect x="39" y="23" width="5" height="6" fill="currentColor" fillOpacity="0.4" rx="0.5" />
      </motion.g>

      {/* BIM Data Flow Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
      >
        <line x1="8" y1="50" x2="12" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="52" y1="38" x2="56" y2="38" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="8" y1="26" x2="16" y2="26" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
      </motion.g>

      {/* Pulse Effect */}
      <motion.rect
        x="10"
        y="18"
        width="44"
        height="40"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.02, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  )
}
