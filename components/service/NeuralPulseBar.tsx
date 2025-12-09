'use client'

import { motion } from 'framer-motion'

interface NeuralPulseBarProps {
  isActive: boolean
  currentPhase: number
  totalPhases: number
  status?: string
}

export default function NeuralPulseBar({
  isActive,
  currentPhase,
  totalPhases,
  status = 'AI Engine Ready'
}: NeuralPulseBarProps) {
  const progress = currentPhase / totalPhases

  return (
    <div className="relative">
      {/* Main Bar Container */}
      <div className="relative bg-gradient-to-r from-primary-navy via-primary-navy/95 to-primary-navy rounded-2xl overflow-hidden border border-primary-gold/20">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 20">
            <pattern id="neural-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#C5A059" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#neural-grid)" />
          </svg>
        </div>

        {/* Scan Line Effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 w-full h-full pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-1/4 h-full bg-gradient-to-r from-transparent via-primary-gold/20 to-transparent" />
          </motion.div>
        )}

        {/* Content */}
        <div className="relative px-6 py-4 flex items-center justify-between">
          {/* Left: Status */}
          <div className="flex items-center gap-4">
            {/* Neural Pulse Indicator */}
            <div className="relative">
              <motion.div
                className={`w-3 h-3 rounded-full ${isActive ? 'bg-accent-emerald' : 'bg-neutral-warmGray'}`}
                animate={isActive ? {
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(0, 168, 107, 0.4)',
                    '0 0 0 8px rgba(0, 168, 107, 0)',
                    '0 0 0 0 rgba(0, 168, 107, 0)'
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            <div>
              <div className="text-white font-medium text-sm">{status}</div>
              <div className="text-white/50 text-xs">
                {isActive ? `Phase ${currentPhase}/${totalPhases} Processing` : 'Awaiting Input'}
              </div>
            </div>
          </div>

          {/* Center: Neural Network Visualization */}
          <div className="hidden md:flex items-center gap-1">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary-gold/60 rounded-full"
                animate={isActive ? {
                  height: [8, 20 + Math.random() * 16, 8],
                  opacity: [0.4, 1, 0.4]
                } : { height: 8, opacity: 0.3 }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                style={{ height: 8 }}
              />
            ))}
          </div>

          {/* Right: Progress */}
          <div className="flex items-center gap-4">
            {/* Phase Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(totalPhases)].map((_, i) => {
                const phaseNum = i + 1
                const isCompleted = phaseNum < currentPhase
                const isCurrent = phaseNum === currentPhase && isActive
                const isPending = phaseNum > currentPhase

                return (
                  <motion.div
                    key={i}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCompleted ? 'bg-accent-emerald text-white' : ''}
                      ${isCurrent ? 'bg-primary-crimson text-white' : ''}
                      ${isPending ? 'bg-white/10 text-white/40' : ''}
                    `}
                    animate={isCurrent ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(154, 33, 45, 0.4)',
                        '0 0 0 4px rgba(154, 33, 45, 0)',
                        '0 0 0 0 rgba(154, 33, 45, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isCompleted ? '✓' : phaseNum}
                  </motion.div>
                )
              })}
            </div>

            {/* Percentage */}
            <motion.div
              className="text-2xl font-bold text-primary-gold"
              key={progress}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {Math.round(progress * 100)}%
            </motion.div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-crimson via-primary-gold to-accent-emerald"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary-gold/50" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary-gold/50" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary-gold/50" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary-gold/50" />
    </div>
  )
}
