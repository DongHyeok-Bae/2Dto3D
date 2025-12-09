'use client'

import { motion } from 'framer-motion'

export default function ImageIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Photo Frame */}
      <motion.rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="3"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Inner Frame Border */}
      <motion.rect
        x="12"
        y="16"
        width="40"
        height="32"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.3"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      />

      {/* Sun */}
      <motion.circle
        cx="44"
        cy="26"
        r="6"
        fill="currentColor"
        fillOpacity="0.4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />

      {/* Sun Rays */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={angle}
            x1="44"
            y1="26"
            x2={44 + Math.cos((angle * Math.PI) / 180) * 10}
            y2={26 + Math.sin((angle * Math.PI) / 180) * 10}
            stroke="currentColor"
            strokeWidth="1"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </motion.g>

      {/* Mountains */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {/* Back Mountain */}
        <motion.polygon
          points="14,48 28,30 42,48"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Front Mountain */}
        <motion.polygon
          points="30,48 44,34 58,48"
          fill="currentColor"
          fillOpacity="0.35"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Ground Line */}
      <motion.line
        x1="12"
        y1="48"
        x2="52"
        y2="48"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      />

      {/* Flash Effect */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
        transition={{ delay: 1.2, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <circle cx="32" cy="32" r="20" fill="white" fillOpacity="0.3" />
        <circle cx="32" cy="32" r="12" fill="white" fillOpacity="0.5" />
      </motion.g>

      {/* Corner Accents */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <path d="M8 20 L8 12 L16 12" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M56 20 L56 12 L48 12" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 44 L8 52 L16 52" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M56 44 L56 52 L48 52" fill="none" stroke="currentColor" strokeWidth="2" />
      </motion.g>

      {/* Focus Points */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
      >
        <rect x="20" y="24" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="40" y="36" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  )
}
