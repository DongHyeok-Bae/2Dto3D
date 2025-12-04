'use client'

import { motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'

interface ParticleFieldProps {
  count?: number
  colors?: string[]
  className?: string
  speed?: 'slow' | 'medium' | 'fast'
  size?: 'sm' | 'md' | 'lg' | 'mixed'
  opacity?: number
  shape?: 'circle' | 'square' | 'diamond' | 'mixed'
}

const speedConfig = {
  slow: { duration: 20, y: 30 },
  medium: { duration: 12, y: 50 },
  fast: { duration: 6, y: 80 },
}

const sizeConfig = {
  sm: [2, 3],
  md: [3, 5],
  lg: [5, 8],
  mixed: [2, 8],
}

// Seeded random number generator for consistent values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
  shape: string
  rotation: number
  opacityOffset: number
  xOffset: number
}

interface Orb {
  id: number
  x: number
  y: number
  width: number
  height: number
  durationOffset: number
}

export default function ParticleField({
  count = 50,
  colors = ['#C5A059', '#9A212D', '#0066CC', '#D4B56A'],
  className = '',
  speed = 'medium',
  size = 'mixed',
  opacity = 0.6,
  shape = 'mixed',
}: ParticleFieldProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const particles = useMemo<Particle[]>(() => {
    if (!isClient) return []

    return Array.from({ length: count }, (_, i) => {
      const sizeRange = sizeConfig[size]
      const seed = i * 1000
      const particleSize = sizeRange[0] + seededRandom(seed + 1) * (sizeRange[1] - sizeRange[0])

      const shapes = shape === 'mixed'
        ? ['circle', 'square', 'diamond'][Math.floor(seededRandom(seed + 2) * 3)]
        : shape

      return {
        id: i,
        x: seededRandom(seed + 3) * 100,
        y: seededRandom(seed + 4) * 100,
        size: particleSize,
        color: colors[Math.floor(seededRandom(seed + 5) * colors.length)],
        delay: seededRandom(seed + 6) * 5,
        duration: speedConfig[speed].duration + seededRandom(seed + 7) * 10,
        shape: shapes,
        rotation: seededRandom(seed + 8) * 360,
        opacityOffset: 0.5 + seededRandom(seed + 9) * 0.5,
        xOffset: seededRandom(seed + 10) * 20 - 10,
      }
    })
  }, [isClient, count, colors, speed, size, shape])

  const orbs = useMemo<Orb[]>(() => {
    if (!isClient) return []

    return Array.from({ length: Math.floor(count / 10) }, (_, i) => {
      const seed = i * 2000 + 5000
      return {
        id: i,
        x: 20 + seededRandom(seed + 1) * 60,
        y: 20 + seededRandom(seed + 2) * 60,
        width: 100 + seededRandom(seed + 3) * 100,
        height: 100 + seededRandom(seed + 4) * 100,
        durationOffset: seededRandom(seed + 5) * 10,
      }
    })
  }, [isClient, count])

  const getShapeStyle = (particleShape: string, particleSize: number) => {
    switch (particleShape) {
      case 'square':
        return { borderRadius: '2px' }
      case 'diamond':
        return {
          borderRadius: '2px',
          transform: 'rotate(45deg)',
          width: particleSize * 0.8,
          height: particleSize * 0.8,
        }
      default:
        return { borderRadius: '50%' }
    }
  }

  if (!isClient) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: opacity * particle.opacityOffset,
            ...getShapeStyle(particle.shape, particle.size),
          }}
          animate={{
            y: [0, -speedConfig[speed].y, 0],
            x: [0, particle.xOffset, 0],
            opacity: [opacity * 0.3, opacity, opacity * 0.3],
            scale: [1, 1.2, 1],
            rotate: [0, particle.rotation, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Larger glowing orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.width,
            height: orb.height,
            background: `radial-gradient(circle, ${colors[orb.id % colors.length]}20 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15 + orb.durationOffset,
            delay: orb.id * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Floating sparkles - more magical effect
export function SparkleField({
  count = 30,
  className = '',
}: {
  count?: number
  className?: string
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const sparkles = useMemo(() => {
    if (!isClient) return []

    return Array.from({ length: count }, (_, i) => {
      const seed = i * 3000
      return {
        id: i,
        x: seededRandom(seed + 1) * 100,
        y: seededRandom(seed + 2) * 100,
        size: 4 + seededRandom(seed + 3) * 8,
        delay: seededRandom(seed + 4) * 3,
        duration: 2 + seededRandom(seed + 5) * 2,
      }
    })
  }, [isClient, count])

  if (!isClient) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {sparkles.map((sparkle) => (
        <motion.svg
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          viewBox="0 0 24 24"
          fill="#C5A059"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
        </motion.svg>
      ))}
    </div>
  )
}

// Rising particles - like embers
export function RisingParticles({
  count = 20,
  colors = ['#C5A059', '#D4B56A', '#FFC107'],
  className = '',
}: {
  count?: number
  colors?: string[]
  className?: string
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const particles = useMemo(() => {
    if (!isClient) return []

    return Array.from({ length: count }, (_, i) => {
      const seed = i * 4000
      return {
        id: i,
        x: seededRandom(seed + 1) * 100,
        size: 2 + seededRandom(seed + 2) * 4,
        color: colors[Math.floor(seededRandom(seed + 3) * colors.length)],
        delay: seededRandom(seed + 4) * 10,
        duration: 8 + seededRandom(seed + 5) * 8,
        xOffset: seededRandom(seed + 6) * 100 - 50,
      }
    })
  }, [isClient, count, colors])

  if (!isClient) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: '-10%',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [0, '-120vh'],
            x: [0, particle.xOffset],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// Constellation effect - connected dots
export function ConstellationField({
  nodeCount = 15,
  className = '',
}: {
  nodeCount?: number
  className?: string
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const nodes = useMemo(() => {
    if (!isClient) return []

    return Array.from({ length: nodeCount }, (_, i) => {
      const seed = i * 5000
      return {
        id: i,
        x: 10 + seededRandom(seed + 1) * 80,
        y: 10 + seededRandom(seed + 2) * 80,
        size: 3 + seededRandom(seed + 3) * 3,
      }
    })
  }, [isClient, nodeCount])

  // Create connections between nearby nodes
  const connections = useMemo(() => {
    if (!isClient || nodes.length === 0) return []

    const lines: { x1: number; y1: number; x2: number; y2: number; key: string; delay: number }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
        )
        if (distance < 30) {
          const seed = (i * 100 + j) * 6000
          lines.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            key: `${i}-${j}`,
            delay: seededRandom(seed),
          })
        }
      }
    }
    return lines
  }, [isClient, nodes])

  // Early return if not client or nodes not ready
  if (!isClient || nodes.length === 0) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="w-full h-full">
        {/* Connection lines */}
        {connections.map((line) => (
          <motion.line
            key={line.key}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="#C5A059"
            strokeWidth="0.5"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.3, pathLength: 1 }}
            transition={{ duration: 2, delay: line.delay }}
          />
        ))}

        {/* Nodes - only render if node has valid coordinates */}
        {nodes.map((node, i) => (
          node.x !== undefined && node.y !== undefined ? (
            <motion.circle
              key={node.id}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill="#C5A059"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ) : null
        ))}
      </svg>
    </div>
  )
}
