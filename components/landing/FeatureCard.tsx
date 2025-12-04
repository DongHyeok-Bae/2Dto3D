'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useState, useRef, MouseEvent } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  description: string
  color?: 'crimson' | 'sapphire' | 'emerald' | 'gold'
  stats?: { value: string; label: string }
  index: number
  featured?: boolean
  horizontal?: boolean
  compact?: boolean
}

const colorConfig = {
  crimson: {
    accent: 'text-primary-crimson',
    bg: 'bg-primary-crimson-pale',
    border: 'border-primary-crimson/30',
    hoverBorder: 'group-hover:border-primary-crimson/60',
    glow: 'shadow-glow-crimson',
    gradient: 'from-primary-crimson/10 via-primary-crimson/5 to-transparent',
    iconBg: 'bg-primary-crimson/10',
    statBg: 'bg-primary-crimson',
  },
  sapphire: {
    accent: 'text-accent-sapphire',
    bg: 'bg-accent-sapphire-pale',
    border: 'border-accent-sapphire/30',
    hoverBorder: 'group-hover:border-accent-sapphire/60',
    glow: 'shadow-glow-sapphire',
    gradient: 'from-accent-sapphire/10 via-accent-sapphire/5 to-transparent',
    iconBg: 'bg-accent-sapphire/10',
    statBg: 'bg-accent-sapphire',
  },
  emerald: {
    accent: 'text-accent-emerald',
    bg: 'bg-accent-emerald-pale',
    border: 'border-accent-emerald/30',
    hoverBorder: 'group-hover:border-accent-emerald/60',
    glow: 'shadow-glow-emerald',
    gradient: 'from-accent-emerald/10 via-accent-emerald/5 to-transparent',
    iconBg: 'bg-accent-emerald/10',
    statBg: 'bg-accent-emerald',
  },
  gold: {
    accent: 'text-primary-gold',
    bg: 'bg-primary-gold-pale',
    border: 'border-primary-gold/30',
    hoverBorder: 'group-hover:border-primary-gold/60',
    glow: 'shadow-glow-gold',
    gradient: 'from-primary-gold/10 via-primary-gold/5 to-transparent',
    iconBg: 'bg-primary-gold/10',
    statBg: 'bg-primary-gold',
  },
}

export default function FeatureCard({
  icon,
  title,
  subtitle,
  description,
  color = 'gold',
  stats,
  index,
  featured = false,
  horizontal = false,
  compact = false,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const colors = colorConfig[color]

  // 3D tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    x.set(mouseX / width - 0.5)
    y.set(mouseY / height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  // Layout variants
  const layoutClasses = featured
    ? 'p-10 flex flex-col justify-between'
    : horizontal
    ? 'p-6 flex flex-row items-center gap-6'
    : compact
    ? 'p-5'
    : 'p-8'

  const iconSizeClasses = featured
    ? 'w-20 h-20'
    : horizontal
    ? 'w-16 h-16 flex-shrink-0'
    : compact
    ? 'w-12 h-12'
    : 'w-16 h-16'

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group h-full"
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        className={`
          relative h-full rounded-2xl bg-white/90 backdrop-blur-sm
          border-2 ${colors.border} ${colors.hoverBorder}
          overflow-hidden cursor-pointer transition-all duration-500
          ${layoutClasses}
        `}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: `0 20px 40px -20px rgba(0,0,0,0.15)`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Corner Markers - Animated */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner, i) => (
          <motion.div
            key={corner}
            className={`absolute w-4 h-4 ${colors.accent}
              ${corner === 'top-left' ? 'top-0 left-0 border-t-2 border-l-2' : ''}
              ${corner === 'top-right' ? 'top-0 right-0 border-t-2 border-r-2' : ''}
              ${corner === 'bottom-left' ? 'bottom-0 left-0 border-b-2 border-l-2' : ''}
              ${corner === 'bottom-right' ? 'bottom-0 right-0 border-b-2 border-r-2' : ''}
              border-current opacity-40 transition-all duration-300
              group-hover:opacity-100 group-hover:w-6 group-hover:h-6
            `}
            animate={isHovered ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}

        {/* Background Gradient Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0px 0px', '20px 20px'],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main Content */}
        <div className={`relative z-10 ${horizontal ? 'flex-1' : ''}`}>
          {/* Icon Container */}
          <motion.div
            className={`
              ${iconSizeClasses} ${colors.iconBg} rounded-xl
              flex items-center justify-center
              ${horizontal ? '' : 'mx-auto mb-6'}
              ${colors.accent} transition-all duration-300
              group-hover:scale-110
            `}
            animate={isHovered ? {
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>

          {/* Text Content */}
          <div className={horizontal ? '' : 'text-center'}>
            {/* Subtitle Badge */}
            {subtitle && !compact && (
              <motion.span
                className={`
                  inline-block px-3 py-1 rounded-full text-xs font-medium
                  ${colors.accent} ${colors.iconBg}
                  mb-2 tracking-wide uppercase
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {subtitle}
              </motion.span>
            )}

            {/* Title */}
            <h3 className={`
              font-display font-bold text-primary-navy
              group-hover:${colors.accent} transition-colors duration-300
              ${featured ? 'text-3xl mb-4' : compact ? 'text-lg mb-2' : 'text-xl mb-3'}
            `}>
              {title}
            </h3>

            {/* Description */}
            <p className={`
              text-neutral-warmGray leading-relaxed
              ${featured ? 'text-base' : compact ? 'text-xs' : 'text-sm'}
              ${compact ? 'line-clamp-2' : ''}
            `}>
              {description}
            </p>
          </div>
        </div>

        {/* Stats Badge */}
        {stats && !compact && (
          <motion.div
            className={`
              ${featured ? 'mt-8' : 'mt-4'}
              ${horizontal ? 'flex-shrink-0' : ''}
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className={`
              inline-flex items-center gap-3 px-4 py-2 rounded-xl
              ${colors.iconBg}
            `}>
              <span className={`
                ${featured ? 'text-3xl' : 'text-2xl'}
                font-display font-bold ${colors.accent}
              `}>
                {stats.value}
              </span>
              <span className="text-xs text-neutral-warmGray uppercase tracking-wide">
                {stats.label}
              </span>
            </div>
          </motion.div>
        )}

        {/* Bottom Line Animation */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 ${colors.statBg}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
          initial={{ x: '-200%' }}
          animate={{ x: isHovered ? '200%' : '-200%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Floating Particles on Hover (Featured only) */}
        {featured && isHovered && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${colors.statBg}`}
                initial={{
                  x: `${20 + i * 15}%`,
                  y: '100%',
                  opacity: 0,
                }}
                animate={{
                  y: '-20%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}

        {/* Index Number (Featured only) */}
        {featured && (
          <motion.span
            className={`
              absolute top-4 right-4 text-6xl font-display font-bold
              ${colors.accent} opacity-10
            `}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 0.1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            0{index + 1}
          </motion.span>
        )}
      </motion.div>

      {/* External Glow Effect */}
      <motion.div
        className={`
          absolute -inset-2 rounded-3xl ${colors.glow} opacity-0
          group-hover:opacity-30 transition-opacity duration-500 -z-10
        `}
      />
    </motion.div>
  )
}
