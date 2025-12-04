'use client'

import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  labelClassName?: string
  label?: string
  icon?: React.ReactNode
  color?: 'gold' | 'crimson' | 'sapphire' | 'emerald' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showGlow?: boolean
}

const colorStyles = {
  gold: {
    text: 'text-primary-gold',
    glow: 'text-glow-gold',
    gradient: 'from-primary-gold to-primary-gold-light',
  },
  crimson: {
    text: 'text-primary-crimson',
    glow: 'text-glow-crimson',
    gradient: 'from-primary-crimson to-primary-crimson-light',
  },
  sapphire: {
    text: 'text-accent-sapphire',
    glow: '',
    gradient: 'from-accent-sapphire to-accent-sapphire-light',
  },
  emerald: {
    text: 'text-accent-emerald',
    glow: '',
    gradient: 'from-accent-emerald to-accent-emerald-light',
  },
  white: {
    text: 'text-white',
    glow: '',
    gradient: 'from-white to-white/80',
  },
}

const sizeStyles = {
  sm: { number: 'text-2xl', label: 'text-xs', icon: 'w-4 h-4' },
  md: { number: 'text-4xl', label: 'text-sm', icon: 'w-5 h-5' },
  lg: { number: 'text-5xl', label: 'text-base', icon: 'w-6 h-6' },
  xl: { number: 'text-6xl', label: 'text-lg', icon: 'w-8 h-8' },
}

export default function AnimatedCounter({
  value,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  labelClassName = '',
  label,
  icon,
  color = 'gold',
  size = 'md',
  showGlow = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  const display = useTransform(spring, (current) => {
    return current.toFixed(decimals)
  })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        spring.set(value)
        setHasAnimated(true)
      }, delay * 1000)

      return () => clearTimeout(timer)
    }
  }, [isInView, hasAnimated, spring, value, delay])

  const colors = colorStyles[color]
  const sizes = sizeStyles[size]

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          className={`${colors.text} ${sizes.icon} mb-2`}
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring' }}
        >
          {icon}
        </motion.div>
      )}

      {/* Number */}
      <div className="relative">
        {/* Glow background */}
        {showGlow && (
          <motion.div
            className={`absolute inset-0 blur-xl opacity-30 bg-gradient-to-r ${colors.gradient}`}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <motion.span
          className={`
            relative font-display font-bold
            ${sizes.number} ${colors.text}
            ${showGlow ? colors.glow : ''}
          `}
        >
          {prefix}
          <motion.span>{display}</motion.span>
          {suffix}
        </motion.span>
      </div>

      {/* Label */}
      {label && (
        <motion.span
          className={`
            mt-2 font-medium text-white/60
            ${sizes.label} ${labelClassName}
          `}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  )
}

// Compact version for inline stats
export function InlineCounter({
  value,
  suffix = '',
  label,
  color = 'gold',
}: {
  value: number
  suffix?: string
  label: string
  color?: 'gold' | 'crimson' | 'sapphire' | 'emerald' | 'white'
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const duration = 1500
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  const colors = colorStyles[color]

  return (
    <span ref={ref} className="inline-flex items-center gap-1">
      <span className={`font-bold ${colors.text}`}>
        {count}{suffix}
      </span>
      <span className="text-white/50">{label}</span>
    </span>
  )
}

// Stats grid component
export function StatsGrid({
  stats,
  className = '',
}: {
  stats: Array<{
    value: number
    suffix?: string
    label: string
    icon?: React.ReactNode
    color?: 'gold' | 'crimson' | 'sapphire' | 'emerald'
  }>
  className?: string
}) {
  return (
    <motion.div
      className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="relative p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          whileHover={{
            scale: 1.05,
            borderColor: 'rgba(197, 160, 89, 0.3)',
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <AnimatedCounter
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            icon={stat.icon}
            color={stat.color || 'gold'}
            delay={index * 0.1}
            size="md"
          />

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-gold/20 to-transparent transform rotate-45 translate-x-8 -translate-y-8" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
