'use client'

import { motion } from 'framer-motion'

export default function GlbIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Compressed Cube Container */}
      <motion.rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="4"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Inner Cube */}
      <motion.rect
        x="22"
        y="22"
        width="20"
        height="20"
        rx="2"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />

      {/* Binary Pattern - 0s and 1s */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {/* Row 1 */}
        <motion.text x="18" y="12" fontSize="6" fill="currentColor" fillOpacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >01</motion.text>
        <motion.text x="36" y="12" fontSize="6" fill="currentColor" fillOpacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >10</motion.text>

        {/* Row 2 */}
        <motion.text x="8" y="34" fontSize="6" fill="currentColor" fillOpacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        >1</motion.text>
        <motion.text x="52" y="34" fontSize="6" fill="currentColor" fillOpacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        >0</motion.text>

        {/* Row 3 */}
        <motion.text x="18" y="58" fontSize="6" fill="currentColor" fillOpacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
        >11</motion.text>
        <motion.text x="36" y="58" fontSize="6" fill="currentColor" fillOpacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >00</motion.text>
      </motion.g>

      {/* Compression Arrows */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <motion.path
          d="M32 4 L32 10 M28 8 L32 4 L36 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.path
          d="M32 60 L32 54 M28 56 L32 60 L36 56"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.path
          d="M4 32 L10 32 M8 28 L4 32 L8 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.path
          d="M60 32 L54 32 M56 28 L60 32 L56 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ x: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.g>

      {/* Center Glow Pulse */}
      <motion.circle
        cx="32"
        cy="32"
        r="8"
        fill="currentColor"
        fillOpacity="0.3"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Corner Accents */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <circle cx="14" cy="14" r="2" fill="currentColor" />
        <circle cx="50" cy="14" r="2" fill="currentColor" />
        <circle cx="14" cy="50" r="2" fill="currentColor" />
        <circle cx="50" cy="50" r="2" fill="currentColor" />
      </motion.g>
    </motion.svg>
  )
}
