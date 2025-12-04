'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

// Seeded random for consistent values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function BlueprintGrid() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Pre-compute particle data only on client
  const particles = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: 20 }, (_, i) => {
      const seed = i * 7000
      return {
        id: i,
        left: seededRandom(seed + 1) * 100,
        top: seededRandom(seed + 2) * 100,
        duration: 3 + seededRandom(seed + 3) * 2,
        delay: seededRandom(seed + 4) * 3,
      }
    })
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main Grid SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grid Pattern */}
          <pattern
            id="blueprint-grid-small"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(197, 160, 89, 0.15)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="blueprint-grid-large"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <rect width="200" height="200" fill="url(#blueprint-grid-small)" />
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke="rgba(197, 160, 89, 0.3)"
              strokeWidth="1"
            />
          </pattern>

          {/* Glow Effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#blueprint-grid-large)" />

        {/* Animated Lines - Horizontal */}
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={`${20 + i * 15}%`}
            x2="100%"
            y2={`${20 + i * 15}%`}
            stroke="rgba(197, 160, 89, 0.2)"
            strokeWidth="1"
            strokeDasharray="1000"
            initial={{ strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Animated Lines - Vertical */}
        {[...Array(7)].map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={`${10 + i * 13}%`}
            y1="0"
            x2={`${10 + i * 13}%`}
            y2="100%"
            stroke="rgba(197, 160, 89, 0.15)"
            strokeWidth="1"
            strokeDasharray="1000"
            initial={{ strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 2.5,
              delay: 0.5 + i * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Corner Markers - Top Left only (others handled via CSS) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <path
            d="M 30 50 L 30 30 L 50 30"
            fill="none"
            stroke="#C5A059"
            strokeWidth="2"
            filter="url(#glow)"
          />
        </motion.g>

        {/* Floating measurement lines */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {/* Dimension line example */}
          <line
            x1="10%"
            y1="95%"
            x2="40%"
            y2="95%"
            stroke="#C5A059"
            strokeWidth="1"
          />
          <line
            x1="10%"
            y1="93%"
            x2="10%"
            y2="97%"
            stroke="#C5A059"
            strokeWidth="1"
          />
          <line
            x1="40%"
            y1="93%"
            x2="40%"
            y2="97%"
            stroke="#C5A059"
            strokeWidth="1"
          />
          <text
            x="25%"
            y="93%"
            fill="#C5A059"
            fontSize="10"
            textAnchor="middle"
            opacity="0.6"
          >
            13,200 mm
          </text>
        </motion.g>
      </svg>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-navy via-transparent to-primary-navy opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-navy via-transparent to-primary-navy opacity-40" />

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary-gold rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* CSS-based Corner Markers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Top Right */}
        <div className="absolute top-[30px] right-[30px] w-5 h-5 border-t-2 border-r-2 border-primary-gold" style={{ filter: 'drop-shadow(0 0 3px rgba(197, 160, 89, 0.6))' }} />
        {/* Bottom Left */}
        <div className="absolute bottom-[30px] left-[30px] w-5 h-5 border-b-2 border-l-2 border-primary-gold" style={{ filter: 'drop-shadow(0 0 3px rgba(197, 160, 89, 0.6))' }} />
        {/* Bottom Right */}
        <div className="absolute bottom-[30px] right-[30px] w-5 h-5 border-b-2 border-r-2 border-primary-gold" style={{ filter: 'drop-shadow(0 0 3px rgba(197, 160, 89, 0.6))' }} />
      </motion.div>
    </div>
  )
}
