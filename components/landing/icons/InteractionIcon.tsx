'use client'

import { motion } from 'framer-motion'

export default function InteractionIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* 3D Cube - Front Face */}
      <motion.path
        d="M32 20 L52 32 L32 44 L12 32 Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* 3D Cube - Top Face */}
      <motion.path
        d="M32 20 L52 32 L52 12 L32 0 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* 3D Cube - Side Face */}
      <motion.path
        d="M32 20 L12 32 L12 12 L32 0 Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />

      {/* Rotating Ring */}
      <motion.ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '32px 32px' }}
      />

      {/* Interaction Arrows */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {/* Rotate Arrow 1 */}
        <motion.path
          d="M8 50 C8 56 14 60 20 58"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '14px 54px' }}
        />
        <motion.polygon
          points="20,58 18,52 24,54"
          fill="currentColor"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '14px 54px' }}
        />

        {/* Rotate Arrow 2 */}
        <motion.path
          d="M56 50 C56 56 50 60 44 58"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ transformOrigin: '50px 54px' }}
        />
        <motion.polygon
          points="44,58 46,52 40,54"
          fill="currentColor"
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ transformOrigin: '50px 54px' }}
        />
      </motion.g>

      {/* Pulse Effect on Cube */}
      <motion.circle
        cx="32"
        cy="20"
        r="4"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 2, 0],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  )
}
