'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import GlowButton, { ArrowRightIcon, SparkleIcon } from './GlowButton'
import AnimatedCounter from './AnimatedCounter'
import { MiniLaurel } from './LaurelFrame'
import ParticleField from './ParticleField'

export default function DemoPreview() {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoAnimating, setIsAutoAnimating] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const autoAnimationRef = useRef<NodeJS.Timeout | null>(null)

  // Parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], [50, -50])

  // Auto animation
  useEffect(() => {
    if (!isAutoAnimating) return

    let direction = 1
    autoAnimationRef.current = setInterval(() => {
      setSliderPosition((prev) => {
        if (prev >= 75) direction = -1
        if (prev <= 25) direction = 1
        return prev + direction * 0.3
      })
    }, 30)

    return () => {
      if (autoAnimationRef.current) {
        clearInterval(autoAnimationRef.current)
      }
    }
  }, [isAutoAnimating])

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
    setIsAutoAnimating(false)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()

      let clientX: number
      if ('touches' in e) {
        clientX = e.touches[0].clientX
      } else {
        clientX = e.clientX
      }

      const x = clientX - rect.left
      const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100))
      setSliderPosition(percentage)
    },
    [isDragging]
  )

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const stats = [
    { value: 7, suffix: '단계', label: 'AI 분석 파이프라인', color: 'gold' as const },
    { value: 99.2, suffix: '%', label: '요소 인식 정확도', color: 'sapphire' as const, decimals: 1 },
    { value: 5, suffix: '분', label: '평균 변환 시간', color: 'emerald' as const },
  ]

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* ===== BACKGROUND LAYERS ===== */}

      {/* Layer 1: Base gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Layer 2: Moving particles */}
      <ParticleField
        count={40}
        colors={['#C5A059', '#D4B56A', '#0066CC']}
        speed="slow"
        opacity={0.3}
      />

      {/* Layer 3: Blueprint grid with parallax */}
      <motion.div
        className="absolute inset-0 blueprint-grid opacity-15"
        style={{ y: backgroundY }}
      />

      {/* Layer 4: Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-navy via-transparent to-primary-navy opacity-60" />

      {/* Layer 5: Laurel pattern */}
      <div className="absolute inset-0 laurel-bg opacity-10" />

      {/* Layer 6: Radial spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(15, 26, 48, 0.7) 100%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Decorative element */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-20 h-px bg-gradient-to-r from-transparent to-primary-gold"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <SparkleIcon className="text-primary-gold" />
            <motion.div
              className="w-20 h-px bg-gradient-to-l from-transparent to-primary-gold"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            See the{' '}
            <motion.span
              className="text-gradient-animated inline-block"
              animate={{
                textShadow: [
                  '0 0 10px rgba(197, 160, 89, 0.5)',
                  '0 0 30px rgba(197, 160, 89, 0.8)',
                  '0 0 10px rgba(197, 160, 89, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Magic
            </motion.span>
          </h2>
          <p className="text-lg md:text-xl text-white/70">
            AI가 2D 도면을 3D 모델로 변환하는 과정을 확인하세요
          </p>
        </motion.div>

        {/* Comparison Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative max-w-4xl mx-auto mb-16"
        >
          {/* Outer glow effect */}
          <motion.div
            className="absolute -inset-4 rounded-2xl opacity-30"
            animate={{
              boxShadow: [
                '0 0 30px rgba(197, 160, 89, 0.3)',
                '0 0 60px rgba(197, 160, 89, 0.5)',
                '0 0 30px rgba(197, 160, 89, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div
            ref={containerRef}
            className="relative aspect-[16/10] rounded-xl overflow-hidden
                       border-2 border-primary-gold/40 shadow-2xl cursor-ew-resize
                       bg-primary-navy-dark"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseEnter={() => setIsAutoAnimating(false)}
            onMouseLeave={() => {
              if (!isDragging) setIsAutoAnimating(true)
            }}
          >
            {/* Animated corner markers */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner, i) => (
              <motion.div
                key={corner}
                className={`absolute w-8 h-8 z-20 border-primary-gold
                  ${corner === 'top-left' ? 'top-0 left-0 border-t-2 border-l-2' : ''}
                  ${corner === 'top-right' ? 'top-0 right-0 border-t-2 border-r-2' : ''}
                  ${corner === 'bottom-left' ? 'bottom-0 left-0 border-b-2 border-l-2' : ''}
                  ${corner === 'bottom-right' ? 'bottom-0 right-0 border-b-2 border-r-2' : ''}
                `}
              >
                <motion.div
                  className={`absolute w-2 h-2 bg-primary-gold rounded-full
                    ${corner === 'top-left' ? 'top-1 left-1' : ''}
                    ${corner === 'top-right' ? 'top-1 right-1' : ''}
                    ${corner === 'bottom-left' ? 'bottom-1 left-1' : ''}
                    ${corner === 'bottom-right' ? 'bottom-1 right-1' : ''}
                  `}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                />
              </motion.div>
            ))}

            {/* After Image (3D) - Full width background */}
            <div className="absolute inset-0">
              <Image
                src="/demo/floor-plan-3d.jpg"
                alt="3D Model Result"
                fill
                className="object-cover"
                priority
              />
              {/* Animated overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-primary-navy/30 to-transparent"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              {/* 3D Label */}
              <motion.div
                className="absolute top-4 right-4 px-4 py-2 rounded-lg z-10
                           bg-primary-gold text-primary-navy text-sm font-bold
                           flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent-emerald"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                3D MODEL
              </motion.div>
            </div>

            {/* Before Image (2D) - Clipped by slider */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="relative w-full h-full" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
                <Image
                  src="/demo/floor-plan-2d.png"
                  alt="2D Floor Plan"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* 2D Label */}
              <motion.div
                className="absolute top-4 left-4 px-4 py-2 rounded-lg z-10
                           bg-primary-crimson text-white text-sm font-bold
                           flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                2D 도면
              </motion.div>
            </motion.div>

            {/* Enhanced Slider Handle */}
            <div
              className="absolute top-0 bottom-0 z-10"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              {/* Main slider line with neon glow */}
              <div className="absolute inset-y-0 w-1 bg-primary-gold">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    boxShadow: '0 0 10px #C5A059, 0 0 20px #C5A059, 0 0 30px #C5A059',
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {/* Handle Grip - Enhanced */}
              <motion.div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                           w-14 h-14 rounded-full
                           bg-gradient-to-br from-primary-gold to-primary-gold-dark
                           border-4 border-white shadow-xl
                           flex items-center justify-center cursor-grab
                           ${isDragging ? 'cursor-grabbing' : ''}`}
                animate={{
                  scale: isDragging ? 1.15 : 1,
                  boxShadow: isDragging
                    ? '0 0 30px rgba(197, 160, 89, 0.8), 0 0 60px rgba(197, 160, 89, 0.4)'
                    : '0 4px 20px rgba(0,0,0,0.3)',
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Inner icon */}
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-primary-navy"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isDragging ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </motion.svg>

                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary-gold"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Percentage indicator */}
              <motion.div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2
                           px-3 py-1 rounded-full bg-primary-navy/90 backdrop-blur-sm
                           border border-primary-gold/30 text-primary-gold text-xs font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isDragging ? 1 : 0, y: isDragging ? 0 : -10 }}
              >
                {Math.round(sliderPosition)}%
              </motion.div>
            </div>

            {/* Drag Hint - Enhanced */}
            <AnimatePresence>
              {isAutoAnimating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2
                             px-6 py-3 rounded-full glass-dark
                             text-white/90 text-sm font-medium z-20
                             flex items-center gap-3"
                >
                  <motion.span
                    animate={{ x: [-5, 0, -5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ←
                  </motion.span>
                  드래그하여 비교
                  <motion.span
                    animate={{ x: [5, 0, 5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center transition indicator */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         w-20 h-20 rounded-full border-2 border-dashed border-white/20
                         flex items-center justify-center pointer-events-none"
              animate={{
                rotate: 360,
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 2, repeat: Infinity },
              }}
            >
              <motion.div
                className="text-white/40 text-xs font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-16"
        >
          <GlowButton
            href="/upload"
            variant="primary"
            size="xl"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            glowIntensity="high"
            magnetic
          >
            지금 변환 시작하기
          </GlowButton>
        </motion.div>

        {/* Stats - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10
                              group-hover:border-primary-gold/30 transition-all duration-300
                              text-center">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  color={stat.color}
                  size="lg"
                  delay={0.8 + index * 0.2}
                  decimals={stat.decimals}
                />
              </div>

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                           transition-opacity duration-300 -z-10 blur-xl"
                style={{
                  background: `radial-gradient(circle, ${
                    stat.color === 'gold' ? 'rgba(197, 160, 89, 0.3)' :
                    stat.color === 'sapphire' ? 'rgba(0, 102, 204, 0.3)' :
                    'rgba(0, 168, 107, 0.3)'
                  }, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.5), transparent)',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      />
    </section>
  )
}
