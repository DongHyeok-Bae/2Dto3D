'use client'

import { motion } from 'framer-motion'

export default function ObjIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Wireframe Cube - Front Face */}
      <motion.polygon
        points="16,24 32,16 48,24 48,44 32,52 16,44"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Top Edge */}
      <motion.line
        x1="32"
        y1="16"
        x2="32"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />

      {/* Hidden Edges (Back of cube) */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <line x1="32" y1="8" x2="48" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="32" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="16" y1="16" x2="16" y2="24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="48" y1="16" x2="48" y2="24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      </motion.g>

      {/* Center Vertical Line */}
      <motion.line
        x1="32"
        y1="16"
        x2="32"
        y2="52"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      />

      {/* Vertices (Corner Points) */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <motion.circle cx="32" cy="8" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.circle cx="16" cy="24" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.circle cx="48" cy="24" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />
        <motion.circle cx="32" cy="16" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
        <motion.circle cx="16" cy="44" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />
        <motion.circle cx="48" cy="44" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        <motion.circle cx="32" cy="52" r="2.5" fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
        />
      </motion.g>

      {/* Mesh Grid Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <line x1="24" y1="20" x2="24" y2="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="40" y1="20" x2="40" y2="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="16" y1="34" x2="48" y2="34" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      </motion.g>

      {/* Rotation Animation Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="8 8"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
        opacity={0.2}
      />
    </motion.svg>
  )
}
