'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface LaurelFrameProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
  glowColor?: 'gold' | 'crimson' | 'sapphire'
}

const sizeConfig = {
  sm: { width: 120, height: 80, strokeWidth: 1.5, padding: 'p-3' },
  md: { width: 180, height: 120, strokeWidth: 2, padding: 'p-4' },
  lg: { width: 240, height: 160, strokeWidth: 2.5, padding: 'p-6' },
  xl: { width: 320, height: 200, strokeWidth: 3, padding: 'p-8' },
}

const glowColors = {
  gold: {
    stroke: '#C5A059',
    glow: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.6))',
    filter: 'url(#goldGlow)',
  },
  crimson: {
    stroke: '#9A212D',
    glow: 'drop-shadow(0 0 8px rgba(154, 33, 45, 0.6))',
    filter: 'url(#crimsonGlow)',
  },
  sapphire: {
    stroke: '#0066CC',
    glow: 'drop-shadow(0 0 8px rgba(0, 102, 204, 0.6))',
    filter: 'url(#sapphireGlow)',
  },
}

export default function LaurelFrame({
  children,
  size = 'md',
  animated = true,
  className = '',
  glowColor = 'gold',
}: LaurelFrameProps) {
  const config = sizeConfig[size]
  const colors = glowColors[glowColor]

  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: 'easeInOut' },
        opacity: { duration: 0.5 },
      },
    },
  }

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.5, 1, 0.5],
      transition: {
        opacity: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  }

  // SVG paths for elegant laurel wreath
  const leftLaurelPath = `
    M 15 50
    Q 5 40, 10 25
    Q 15 35, 20 30
    Q 10 35, 15 20
    Q 20 30, 25 25
    Q 15 30, 20 15
    Q 25 25, 30 20
    Q 22 25, 25 12
    Q 30 22, 35 18
    Q 28 22, 32 10
    Q 36 20, 40 16
    Q 34 20, 38 8
    Q 42 18, 45 15
  `

  const rightLaurelPath = `
    M 85 50
    Q 95 40, 90 25
    Q 85 35, 80 30
    Q 90 35, 85 20
    Q 80 30, 75 25
    Q 85 30, 80 15
    Q 75 25, 70 20
    Q 78 25, 75 12
    Q 70 22, 65 18
    Q 72 22, 68 10
    Q 64 20, 60 16
    Q 66 20, 62 8
    Q 58 18, 55 15
  `

  // Leaf details for more elaborate design
  const leftLeaves = [
    'M 12 45 Q 8 40, 12 35 Q 14 40, 12 45',
    'M 14 38 Q 10 33, 14 28 Q 16 33, 14 38',
    'M 17 32 Q 13 27, 17 22 Q 19 27, 17 32',
    'M 21 26 Q 17 21, 21 16 Q 23 21, 21 26',
    'M 26 21 Q 22 16, 26 11 Q 28 16, 26 21',
    'M 32 17 Q 28 12, 32 7 Q 34 12, 32 17',
    'M 39 14 Q 35 9, 39 4 Q 41 9, 39 14',
  ]

  const rightLeaves = [
    'M 88 45 Q 92 40, 88 35 Q 86 40, 88 45',
    'M 86 38 Q 90 33, 86 28 Q 84 33, 86 38',
    'M 83 32 Q 87 27, 83 22 Q 81 27, 83 32',
    'M 79 26 Q 83 21, 79 16 Q 77 21, 79 26',
    'M 74 21 Q 78 16, 74 11 Q 72 16, 74 21',
    'M 68 17 Q 72 12, 68 7 Q 66 12, 68 17',
    'M 61 14 Q 65 9, 61 4 Q 59 9, 61 14',
  ]

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* SVG Laurel Frame */}
      <svg
        viewBox="0 0 100 60"
        className="absolute inset-0 w-full h-full"
        style={{
          width: config.width,
          height: config.height,
          filter: colors.glow,
        }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="laurelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="50%" stopColor="#D4B56A" />
            <stop offset="100%" stopColor="#C5A059" />
          </linearGradient>

          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="crimsonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="sapphireGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left laurel branch */}
        <motion.path
          d={leftLaurelPath}
          fill="none"
          stroke="url(#laurelGradient)"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        />

        {/* Left leaves */}
        {leftLeaves.map((leaf, index) => (
          <motion.path
            key={`left-leaf-${index}`}
            d={leaf}
            fill={colors.stroke}
            fillOpacity={0.6}
            stroke={colors.stroke}
            strokeWidth={0.5}
            variants={animated ? pathVariants : undefined}
            initial={animated ? 'hidden' : 'visible'}
            animate="visible"
            transition={{ delay: 0.1 * index }}
          />
        ))}

        {/* Right laurel branch */}
        <motion.path
          d={rightLaurelPath}
          fill="none"
          stroke="url(#laurelGradient)"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        />

        {/* Right leaves */}
        {rightLeaves.map((leaf, index) => (
          <motion.path
            key={`right-leaf-${index}`}
            d={leaf}
            fill={colors.stroke}
            fillOpacity={0.6}
            stroke={colors.stroke}
            strokeWidth={0.5}
            variants={animated ? pathVariants : undefined}
            initial={animated ? 'hidden' : 'visible'}
            animate="visible"
            transition={{ delay: 0.1 * index }}
          />
        ))}

        {/* Center connecting arc */}
        <motion.path
          d="M 45 15 Q 50 12, 55 15"
          fill="none"
          stroke="url(#laurelGradient)"
          strokeWidth={config.strokeWidth * 0.8}
          strokeLinecap="round"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
          transition={{ delay: 0.7 }}
        />

        {/* Bottom ribbon/tie */}
        <motion.path
          d="M 45 55 Q 50 58, 55 55"
          fill="none"
          stroke="url(#laurelGradient)"
          strokeWidth={config.strokeWidth * 0.8}
          strokeLinecap="round"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
          transition={{ delay: 0.8 }}
        />

        {/* Decorative dots */}
        <motion.circle
          cx="50"
          cy="10"
          r="1.5"
          fill={colors.stroke}
          variants={animated ? glowVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        />
      </svg>

      {/* Content */}
      <div className={`relative z-10 ${config.padding}`}>
        {children}
      </div>
    </div>
  )
}

// Mini version for badges and small decorations
export function MiniLaurel({
  className = '',
  color = 'gold',
  size = 24,
}: {
  className?: string
  color?: 'gold' | 'crimson' | 'sapphire' | 'emerald' | 'navy' | string
  size?: number
}) {
  const colorMap: Record<string, string> = {
    gold: '#C5A059',
    crimson: '#9A212D',
    sapphire: '#0066CC',
    emerald: '#00A86B',
    navy: '#1A2B50',
  }

  // Use color map if it's a named color, otherwise use the color string directly (hex value)
  const strokeColor = colorMap[color] || color

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ width: size, height: size }}
      fill="none"
    >
      <motion.path
        d="M4 12 Q2 8, 5 5 Q4 8, 6 7 Q3 8, 6 4 Q5 7, 8 5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.path
        d="M20 12 Q22 8, 19 5 Q20 8, 18 7 Q21 8, 18 4 Q19 7, 16 5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
    </svg>
  )
}
