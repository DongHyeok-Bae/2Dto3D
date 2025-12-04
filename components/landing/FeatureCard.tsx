'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  index: number
}

export default function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        className="relative p-8 rounded-lg bg-white/80 backdrop-blur-sm border border-primary-gold/20
                   overflow-hidden cursor-pointer h-full"
        animate={{
          rotateY: isHovered ? 5 : 0,
          rotateX: isHovered ? -5 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
      >
        {/* Corner Markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-gold/40
                        transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-primary-gold" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-gold/40
                        transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-primary-gold" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-gold/40
                        transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-primary-gold" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-gold/40
                        transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-primary-gold" />

        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-gold/5 to-primary-crimson/5"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon */}
        <div className="relative w-16 h-16 mx-auto mb-6 text-primary-navy group-hover:text-primary-crimson transition-colors duration-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="relative text-xl font-serif font-bold text-primary-navy text-center mb-3
                       group-hover:text-primary-crimson transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="relative text-neutral-warmGray text-center text-sm leading-relaxed">
          {description}
        </p>

        {/* Bottom Line */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary-gold to-transparent"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '80%' : '0%' }}
          transition={{ duration: 0.3 }}
        />

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '200%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    </motion.div>
  )
}
