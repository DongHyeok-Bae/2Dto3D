'use client'

import { useState, useRef, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: ReactNode
  loading?: boolean
}

export default function MagneticButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  loading
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current || disabled) return

    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    // Magnetic pull effect (stronger near edges)
    const magnetStrength = 0.3
    setPosition({
      x: distanceX * magnetStrength,
      y: distanceY * magnetStrength
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-gradient-to-r from-primary-crimson to-primary-crimson/90
          text-white
          hover:from-primary-crimson/90 hover:to-primary-crimson
          shadow-lg shadow-primary-crimson/25
          hover:shadow-xl hover:shadow-primary-crimson/35
        `
      case 'secondary':
        return `
          bg-gradient-to-r from-primary-navy to-primary-navy/90
          text-white
          hover:from-primary-navy/90 hover:to-primary-navy
          shadow-lg shadow-primary-navy/25
          hover:shadow-xl hover:shadow-primary-navy/35
        `
      case 'outline':
        return `
          bg-transparent
          border-2 border-primary-gold
          text-primary-gold
          hover:bg-primary-gold/10
        `
      case 'ghost':
        return `
          bg-white/5
          text-primary-navy
          hover:bg-white/20
          backdrop-blur-sm
        `
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'px-4 py-2 text-sm'
      case 'md': return 'px-6 py-3 text-base'
      case 'lg': return 'px-8 py-4 text-lg'
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-xl font-medium
        transition-all duration-200 ease-out
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={disabled ? {} : { scale: 0.96 }}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15
      }}
    >
      {/* Ripple Effect on Hover */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full" />
        </motion.div>
      )}

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={isHovered ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      </motion.div>

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.span
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : icon ? (
          <motion.span
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {icon}
          </motion.span>
        ) : null}
        <span>{children}</span>
      </span>

      {/* Neon Glow Border (only for primary/secondary) */}
      {(variant === 'primary' || variant === 'secondary') && isHovered && !disabled && (
        <motion.div
          className={`
            absolute -inset-px rounded-xl pointer-events-none
            ${variant === 'primary' ? 'bg-primary-crimson' : 'bg-primary-navy'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ filter: 'blur(4px)', zIndex: -1 }}
        />
      )}
    </motion.button>
  )
}
