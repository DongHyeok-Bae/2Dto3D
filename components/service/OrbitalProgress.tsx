'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Phase {
  number: number
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  confidence?: number
}

interface OrbitalProgressProps {
  phases: Phase[]
  currentPhase: number
  onPhaseClick?: (phaseNumber: number) => void
}

export default function OrbitalProgress({
  phases,
  currentPhase,
  onPhaseClick
}: OrbitalProgressProps) {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null)

  const totalPhases = phases.length
  const angleStep = 360 / totalPhases
  const radius = 120 // px

  const getPhasePosition = (index: number) => {
    const angle = (index * angleStep - 90) * (Math.PI / 180) // Start from top
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    }
  }

  const getStatusColor = (status: Phase['status']) => {
    switch (status) {
      case 'completed': return '#00A86B'
      case 'running': return '#9A212D'
      case 'error': return '#EF4444'
      default: return '#8B8680'
    }
  }

  const completedCount = phases.filter(p => p.status === 'completed').length
  const overallProgress = completedCount / totalPhases

  return (
    <div className="relative flex items-center justify-center p-8">
      {/* Orbital Ring */}
      <svg
        className="absolute"
        width={radius * 2 + 80}
        height={radius * 2 + 80}
        viewBox={`${-radius - 40} ${-radius - 40} ${radius * 2 + 80} ${radius * 2 + 80}`}
      >
        <defs>
          <linearGradient id="orbital-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#9A212D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0066CC" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow-effect">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Ring */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="none"
          stroke="url(#orbital-gradient)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Progress Arc */}
        <motion.circle
          cx="0"
          cy="0"
          r={radius}
          fill="none"
          stroke="#C5A059"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${overallProgress * radius * 2 * Math.PI} ${radius * 2 * Math.PI}`}
          transform="rotate(-90)"
          filter="url(#glow-effect)"
          initial={{ strokeDasharray: `0 ${radius * 2 * Math.PI}` }}
          animate={{ strokeDasharray: `${overallProgress * radius * 2 * Math.PI} ${radius * 2 * Math.PI}` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Connection Lines */}
        {phases.map((phase, index) => {
          const pos = getPhasePosition(index)
          const nextIndex = (index + 1) % totalPhases
          const nextPos = getPhasePosition(nextIndex)
          const isCompleted = phase.status === 'completed'

          return (
            <motion.line
              key={`line-${index}`}
              x1={pos.x}
              y1={pos.y}
              x2={nextPos.x}
              y2={nextPos.y}
              stroke={isCompleted ? '#C5A059' : 'rgba(139, 134, 128, 0.3)'}
              strokeWidth="2"
              strokeDasharray={isCompleted ? 'none' : '4 4'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          )
        })}
      </svg>

      {/* Phase Nodes */}
      {phases.map((phase, index) => {
        const pos = getPhasePosition(index)
        const isActive = phase.number === currentPhase
        const isHovered = hoveredPhase === phase.number

        return (
          <motion.div
            key={phase.number}
            className="absolute cursor-pointer"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
            }}
            onMouseEnter={() => setHoveredPhase(phase.number)}
            onMouseLeave={() => setHoveredPhase(null)}
            onClick={() => onPhaseClick?.(phase.number)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Node Circle */}
            <motion.div
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300
                ${phase.status === 'completed' ? 'bg-accent-emerald' : ''}
                ${phase.status === 'running' ? 'bg-primary-crimson' : ''}
                ${phase.status === 'error' ? 'bg-red-500' : ''}
                ${phase.status === 'pending' ? 'bg-white border-2 border-neutral-warmGray/30' : ''}
              `}
              animate={isActive ? {
                boxShadow: [
                  `0 0 0 0 ${getStatusColor(phase.status)}40`,
                  `0 0 0 10px ${getStatusColor(phase.status)}00`,
                ]
              } : {}}
              transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
            >
              {/* Running Spinner */}
              {phase.status === 'running' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/50 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Phase Number / Icon */}
              <span className={`
                font-bold text-sm
                ${phase.status === 'pending' ? 'text-neutral-warmGray' : 'text-white'}
              `}>
                {phase.status === 'completed' ? '✓' : phase.number}
              </span>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  <div className="bg-primary-navy text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                    <div className="font-medium">Phase {phase.number}</div>
                    <div className="text-white/70">{phase.name}</div>
                    {phase.confidence && (
                      <div className="text-primary-gold mt-1">
                        신뢰도: {(phase.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-navy" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {/* Center Info */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Overall Progress */}
        <div className="w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-primary-navy"
            key={completedCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {Math.round(overallProgress * 100)}%
          </motion.span>
          <span className="text-xs text-neutral-warmGray">
            {completedCount}/{totalPhases} 완료
          </span>
        </div>
      </motion.div>

      {/* Active Phase Highlight Ring */}
      {currentPhase > 0 && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${getPhasePosition(currentPhase - 1).x}px), calc(-50% + ${getPhasePosition(currentPhase - 1).y}px))`
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-primary-crimson" />
        </motion.div>
      )}
    </div>
  )
}
