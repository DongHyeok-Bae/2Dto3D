'use client'

import { motion } from 'framer-motion'

export default function StlIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* 3D Printer Frame */}
      <motion.rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Print Bed */}
      <motion.rect
        x="12"
        y="44"
        width="40"
        height="8"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Printing Nozzle */}
      <motion.g
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <rect x="28" y="12" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.3" />
        <motion.polygon
          points="32,18 28,24 36,24"
          fill="currentColor"
          fillOpacity="0.5"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.g>

      {/* Printing Layers - Building Up */}
      <motion.g>
        <motion.rect
          x="18" y="40" width="28" height="4" rx="1"
          fill="currentColor" fillOpacity="0.6"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          style={{ transformOrigin: 'center' }}
        />
        <motion.rect
          x="20" y="36" width="24" height="4" rx="1"
          fill="currentColor" fillOpacity="0.5"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          style={{ transformOrigin: 'center' }}
        />
        <motion.rect
          x="22" y="32" width="20" height="4" rx="1"
          fill="currentColor" fillOpacity="0.4"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          style={{ transformOrigin: 'center' }}
        />
        <motion.rect
          x="24" y="28" width="16" height="4" rx="1"
          fill="currentColor" fillOpacity="0.3"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.3 }}
          style={{ transformOrigin: 'center' }}
        />
      </motion.g>

      {/* Filament Line */}
      <motion.line
        x1="32" y1="24" x2="32" y2="28"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2 1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
      />

      {/* Progress Indicator */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.3 }}
      >
        <rect x="12" y="54" width="40" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <motion.rect
          x="12" y="54" width="40" height="2" rx="1"
          fill="currentColor" fillOpacity="0.6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.g>

      {/* Heat Glow Effect */}
      <motion.circle
        cx="32"
        cy="24"
        r="4"
        fill="currentColor"
        fillOpacity="0.2"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Corner Markers */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="48" y1="8" x2="48" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="48" y1="16" x2="56" y2="16" stroke="currentColor" strokeWidth="1.5" />
      </motion.g>
    </motion.svg>
  )
}
