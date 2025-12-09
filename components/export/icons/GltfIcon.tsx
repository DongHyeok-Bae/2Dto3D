'use client'

import { motion } from 'framer-motion'

export default function GltfIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* 3D Cube - Isometric View */}
      <motion.g
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Face */}
        <motion.polygon
          points="32,8 52,20 32,32 12,20"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* Left Face */}
        <motion.polygon
          points="12,20 32,32 32,52 12,40"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        {/* Right Face */}
        <motion.polygon
          points="52,20 52,40 32,52 32,32"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
      </motion.g>

      {/* Color Palette Dots - Material Representation */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <motion.circle
          cx="8"
          cy="50"
          r="4"
          fill="currentColor"
          fillOpacity="0.8"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="18"
          cy="56"
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle
          cx="28"
          cy="58"
          r="4"
          fill="currentColor"
          fillOpacity="0.4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        />
      </motion.g>

      {/* Connection Lines from Palette to Cube */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <line x1="8" y1="46" x2="20" y2="36" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="18" y1="52" x2="26" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
      </motion.g>

      {/* Rotation Indicator */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.4, duration: 0.3 }}
      >
        <motion.path
          d="M54 8 A10 10 0 0 1 58 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '56px 12px' }}
        />
        <motion.polygon
          points="58,16 60,12 56,13"
          fill="currentColor"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '56px 12px' }}
        />
      </motion.g>

      {/* Glow Effect */}
      <motion.polygon
        points="32,8 52,20 32,32 12,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(2px)' }}
      />
    </motion.svg>
  )
}
