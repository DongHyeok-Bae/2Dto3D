'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface GlassPhaseCardProps {
  phaseNumber: number
  phaseName: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  confidence?: number
  onRun?: () => void
  disabled?: boolean
  prerequisites?: { phase: number; completed: boolean }[]
  metadata?: {
    executionTime?: number
    itemCount?: number
  }
}

export default function GlassPhaseCard({
  phaseNumber,
  phaseName,
  description,
  status,
  confidence = 0,
  onRun,
  disabled,
  prerequisites = [],
  metadata
}: GlassPhaseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'from-accent-emerald/20 to-accent-emerald/5 border-accent-emerald/30'
      case 'running': return 'from-primary-crimson/20 to-primary-crimson/5 border-primary-crimson/30'
      case 'error': return 'from-red-500/20 to-red-500/5 border-red-500/30'
      default: return 'from-white/10 to-white/5 border-white/10'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return (
          <motion.div
            className="w-8 h-8 rounded-full border-3 border-primary-crimson border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )
      case 'completed':
        return (
          <motion.div
            className="w-8 h-8 rounded-full bg-accent-emerald flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
          </motion.div>
        )
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full border-2 border-neutral-warmGray/30 flex items-center justify-center">
            <span className="text-neutral-warmGray font-bold">{phaseNumber}</span>
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer
        backdrop-blur-md bg-gradient-to-br ${getStatusColor()}
        border transition-all duration-300
        ${status === 'running' ? 'ring-2 ring-primary-crimson/50 shadow-glow-crimson' : ''}
        ${status === 'completed' ? 'shadow-glow-emerald' : ''}
      `}
      style={{
        transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`,
        transition: 'transform 0.1s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Holographic Shine Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Data Stream Background (for running state) */}
      {status === 'running' && (
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <DataStreamEffect />
        </div>
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-bold text-primary-navy text-lg">
                Phase {phaseNumber}
              </h3>
              <p className="text-sm text-primary-navy/80 font-medium">{phaseName}</p>
            </div>
          </div>

          {/* Confidence Gauge */}
          {status === 'completed' && confidence > 0 && (
            <ConfidenceGauge value={confidence} size={48} />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-warmGray mb-4 line-clamp-2">{description}</p>

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-neutral-warmGray">선수조건:</span>
            <div className="flex gap-1">
              {prerequisites.map((prereq) => (
                <span
                  key={prereq.phase}
                  className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${prereq.completed
                      ? 'bg-accent-emerald/20 text-accent-emerald'
                      : 'bg-neutral-warmGray/20 text-neutral-warmGray'
                    }
                  `}
                >
                  P{prereq.phase} {prereq.completed ? '✓' : '○'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata (for completed phases) */}
        {status === 'completed' && metadata && (
          <div className="flex items-center gap-4 mb-4 text-xs text-neutral-warmGray">
            {metadata.executionTime && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {metadata.executionTime}ms
              </span>
            )}
            {metadata.itemCount && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {metadata.itemCount} items
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <motion.button
          onClick={onRun}
          disabled={disabled || status === 'running'}
          className={`
            w-full py-3 rounded-xl font-medium text-sm transition-all
            flex items-center justify-center gap-2
            ${disabled || status === 'running'
              ? 'bg-neutral-warmGray/20 text-neutral-warmGray cursor-not-allowed'
              : status === 'completed'
              ? 'bg-primary-navy/10 text-primary-navy hover:bg-primary-navy/20'
              : 'bg-gradient-to-r from-primary-crimson to-primary-gold text-white hover:shadow-lg hover:shadow-primary-crimson/20'
            }
          `}
          whileTap={disabled ? {} : { scale: 0.98 }}
        >
          {status === 'running' ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >⚙️</motion.span>
              분석 중...
            </>
          ) : status === 'completed' ? (
            <>🔄 재실행</>
          ) : (
            <>▶️ 단독 실행</>
          )}
        </motion.button>
      </div>

      {/* Running Progress Bar */}
      {status === 'running' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-crimson via-primary-gold to-primary-crimson"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

// Confidence Gauge Component
function ConfidenceGauge({ value, size = 48 }: { value: number; size?: number }) {
  const percentage = Math.round(value * 100)
  const strokeWidth = size / 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value * circumference)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(197, 160, 89, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={value >= 0.8 ? '#00A86B' : value >= 0.5 ? '#C5A059' : '#9A212D'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-primary-navy">{percentage}%</span>
      </div>
    </div>
  )
}

// Data Stream Effect Component
function DataStreamEffect() {
  const columns = 12
  const chars = '01アイウエオカキクケコ'

  return (
    <div className="flex h-full">
      {[...Array(columns)].map((_, i) => (
        <motion.div
          key={i}
          className="flex-1 flex flex-col text-xs font-mono text-primary-gold/60 overflow-hidden"
          initial={{ y: '-100%' }}
          animate={{ y: '100%' }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 2
          }}
        >
          {[...Array(20)].map((_, j) => (
            <span key={j}>{chars[Math.floor(Math.random() * chars.length)]}</span>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

export { ConfidenceGauge, DataStreamEffect }
