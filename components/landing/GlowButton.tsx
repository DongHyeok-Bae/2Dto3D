'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useRef, MouseEvent } from 'react'
import Link from 'next/link'

interface GlowButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  glowIntensity?: 'low' | 'medium' | 'high'
  magnetic?: boolean
}

const variantStyles = {
  primary: {
    base: 'bg-primary-crimson text-white border-2 border-transparent',
    hover: 'hover:bg-primary-crimson-light',
    glow: 'rgba(154, 33, 45, 0.5)',
    glowHover: 'rgba(154, 33, 45, 0.8)',
  },
  secondary: {
    base: 'bg-primary-navy text-white border-2 border-transparent',
    hover: 'hover:bg-primary-navy-light',
    glow: 'rgba(26, 43, 80, 0.5)',
    glowHover: 'rgba(26, 43, 80, 0.8)',
  },
  outline: {
    base: 'bg-transparent text-primary-gold border-2 border-primary-gold',
    hover: 'hover:bg-primary-gold/10',
    glow: 'rgba(197, 160, 89, 0.3)',
    glowHover: 'rgba(197, 160, 89, 0.6)',
  },
  ghost: {
    base: 'bg-transparent text-white border-2 border-white/30',
    hover: 'hover:bg-white/10 hover:border-white/50',
    glow: 'rgba(255, 255, 255, 0.2)',
    glowHover: 'rgba(255, 255, 255, 0.4)',
  },
  neon: {
    base: 'bg-primary-navy-dark text-primary-gold border-2 border-primary-gold',
    hover: 'hover:text-white',
    glow: 'rgba(197, 160, 89, 0.4)',
    glowHover: 'rgba(197, 160, 89, 1)',
  },
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
  xl: 'px-10 py-5 text-xl rounded-2xl',
}

const glowIntensityMap = {
  low: { blur: '10px', spread: '5px' },
  medium: { blur: '20px', spread: '10px' },
  high: { blur: '30px', spread: '15px' },
}

export default function GlowButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  glowIntensity = 'medium',
  magnetic = true,
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const styles = variantStyles[variant]
  const glowConfig = glowIntensityMap[glowIntensity]

  // Magnetic effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent) => {
    if (!magnetic || !buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = (e.clientX - centerX) * 0.2
    const distanceY = (e.clientY - centerY) * 0.2

    x.set(distanceX)
    y.set(distanceY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Shimmer position
  const shimmerX = useMotionValue(-100)

  const buttonContent = (
    <>
      {/* Animated gradient border for neon variant */}
      {variant === 'neon' && (
        <motion.div
          className="absolute inset-0 rounded-inherit -z-10"
          style={{
            background: 'linear-gradient(90deg, #C5A059, #9A212D, #0066CC, #C5A059)',
            backgroundSize: '300% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Inner background for neon variant */}
      {variant === 'neon' && (
        <div className="absolute inset-[2px] bg-primary-navy-dark rounded-inherit -z-[5]" />
      )}

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none"
        initial={false}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            x: shimmerX,
          }}
          whileHover={{
            x: ['-100%', '100%'],
            transition: { duration: 0.8, ease: 'easeInOut' },
          }}
        />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-inherit -z-20 opacity-0"
        initial={{ opacity: 0 }}
        whileHover={{
          opacity: 1,
          boxShadow: `0 0 ${glowConfig.blur} ${glowConfig.spread} ${styles.glowHover}`,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Ripple container */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && iconPosition === 'left' && (
          <motion.span
            className="flex-shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <motion.span
            className="flex-shrink-0"
            whileHover={{ scale: 1.1, x: 3 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* Pulse ring effect */}
      <motion.span
        className="absolute inset-0 rounded-inherit border-2 border-current opacity-0 pointer-events-none"
        whileHover={{
          opacity: [0, 0.5, 0],
          scale: [1, 1.1, 1.2],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
    </>
  )

  const motionProps = {
    ref: buttonRef as any,
    className: `
      relative inline-flex items-center justify-center font-medium
      transition-all duration-300 overflow-hidden
      ${styles.base} ${styles.hover} ${sizeStyles[size]}
      ${fullWidth ? 'w-full' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `,
    style: {
      x: magnetic ? xSpring : 0,
      y: magnetic ? ySpring : 0,
      boxShadow: `0 0 ${glowConfig.blur} ${styles.glow}`,
    },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    whileHover: disabled
      ? {}
      : {
          scale: 1.02,
          boxShadow: `0 0 ${glowConfig.blur} ${glowConfig.spread} ${styles.glowHover}`,
        },
    whileTap: disabled ? {} : { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  }

  if (href && !disabled) {
    return (
      <Link href={href} passHref legacyBehavior>
        <motion.a {...motionProps}>{buttonContent}</motion.a>
      </Link>
    )
  }

  return (
    <motion.button
      {...motionProps}
      onClick={onClick}
      disabled={disabled}
    >
      {buttonContent}
    </motion.button>
  )
}

// Arrow icon for CTA buttons
export function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  )
}

// Sparkle icon for special buttons
export function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      className={`w-5 h-5 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      animate={{
        rotate: [0, 15, -15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
    </motion.svg>
  )
}
