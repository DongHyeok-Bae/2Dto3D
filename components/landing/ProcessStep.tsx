'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ProcessStepProps {
  number: number
  title: string
  description: string
  icon: ReactNode
  color: string
  isActive: boolean
  isLast?: boolean
}

export default function ProcessStep({
  number,
  title,
  description,
  icon,
  color,
  isActive,
  isLast = false,
}: ProcessStepProps) {
  return (
    <div className="relative flex items-start gap-6">
      {/* Timeline Line */}
      {!isLast && (
        <motion.div
          className="absolute left-8 top-16 w-0.5 h-full"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            transformOrigin: 'top',
          }}
        />
      )}

      {/* Step Circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative flex-shrink-0"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center
                     border-2 transition-all duration-500 ${
                       isActive
                         ? 'border-primary-gold bg-primary-gold/10 shadow-lg'
                         : 'border-primary-gold/30 bg-white'
                     }`}
          style={{
            boxShadow: isActive ? `0 0 20px ${color}40` : 'none',
          }}
        >
          <span
            className="text-2xl font-bold"
            style={{ color: isActive ? color : '#8B8680' }}
          >
            {number}
          </span>
        </div>

        {/* Pulse Ring */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 pb-12"
      >
        {/* Icon and Title Row */}
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <div className="w-8 h-8" style={{ color }}>
              {icon}
            </div>
          </div>
          <h3
            className="text-xl font-serif font-bold"
            style={{ color: isActive ? color : '#1A2B50' }}
          >
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-neutral-warmGray leading-relaxed pl-16">
          {description}
        </p>

        {/* Progress Bar (for active step) */}
        {isActive && (
          <motion.div
            className="mt-4 ml-16 h-1 rounded-full overflow-hidden bg-neutral-warmGray/20"
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
