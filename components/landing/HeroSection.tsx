'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import BlueprintGrid from './BlueprintGrid'
import AnimatedTitle from './AnimatedTitle'
import GlowButton, { ArrowRightIcon, SparkleIcon } from './GlowButton'
import ParticleField, { SparkleField, RisingParticles } from './ParticleField'
import AnimatedCounter from './AnimatedCounter'
import { MiniLaurel } from './LaurelFrame'

// Dynamic import for Three.js component (heavy)
const InteractiveBuilding = dynamic(() => import('./InteractiveBuilding'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 border-4 border-primary-gold/30 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        <motion.div
          className="absolute inset-2 w-12 h-12 border-2 border-primary-crimson/50 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  ),
})

// Stats data
const stats = [
  { value: 1247, suffix: '+', label: '변환 완료' },
  { value: 99.2, suffix: '%', label: '정확도', decimals: 1 },
  { value: 5, suffix: '분', label: '평균 시간' },
  { value: 7, suffix: '단계', label: 'AI 파이프라인' },
]

export default function HeroSection() {
  const [titleComplete, setTitleComplete] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ===== BACKGROUND LAYERS ===== */}

      {/* Layer 1: Base Gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Layer 2: Animated Mesh Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-mesh opacity-50"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Layer 3: Blueprint Grid */}
      <BlueprintGrid />

      {/* Layer 4: Particle Field */}
      <ParticleField
        count={60}
        colors={['#C5A059', '#D4B56A', '#9A212D', '#0066CC']}
        speed="slow"
        opacity={0.5}
      />

      {/* Layer 5: Rising Particles */}
      <RisingParticles count={15} />

      {/* Layer 6: Sparkle Field */}
      <SparkleField count={20} />

      {/* Layer 7: Laurel Pattern Overlay */}
      <div className="absolute inset-0 laurel-bg opacity-20" />

      {/* Layer 8: Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15, 26, 48, 0.5) 100%)',
        }}
      />

      {/* Layer 9: Scan Line Effect */}
      <div className="absolute inset-0 scan-line pointer-events-none opacity-30" />

      {/* Layer 10: Noise Texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Top Section - Title & 3D Model */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-8 gap-8 lg:gap-16">

          {/* Left - Title & CTA */}
          <motion.div
            className="flex-1 max-w-xl"
            style={{
              x: mousePosition.x * 0.5,
              y: mousePosition.y * 0.5,
            }}
          >
            {/* Trusted Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center lg:justify-start gap-2 mb-6"
            >
              <MiniLaurel color="gold" />
              <span className="text-sm text-primary-gold/80 font-medium tracking-wide">
                Powered by Kyung Hee University
              </span>
              <MiniLaurel color="gold" className="transform scale-x-[-1]" />
            </motion.div>

            {/* Main Title */}
            <AnimatedTitle onAnimationComplete={() => setTitleComplete(true)} />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: titleComplete ? 1 : 0, y: titleComplete ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <GlowButton
                href="/upload"
                variant="neon"
                size="lg"
                icon={<SparkleIcon />}
                iconPosition="left"
                glowIntensity="high"
                magnetic
              >
                시작하기
              </GlowButton>

              <GlowButton
                href="/admin/prompts"
                variant="ghost"
                size="lg"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                iconPosition="left"
                glowIntensity="medium"
              >
                관리자 페이지
              </GlowButton>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: titleComplete ? 1 : 0, y: titleComplete ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10
                                  group-hover:border-primary-gold/30 transition-all duration-300">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      label={stat.label}
                      size="sm"
                      color="gold"
                      delay={1 + index * 0.15}
                      showGlow={false}
                    />
                  </div>

                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.2), transparent)',
                      filter: 'blur(10px)',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - 3D Building with Enhanced Frame */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5, type: 'spring' }}
            className="flex-1 w-full max-w-lg h-[350px] lg:h-[450px]"
            style={{
              x: mousePosition.x * -0.3,
              y: mousePosition.y * -0.3,
              perspective: 1000,
            }}
          >
            <div className="relative w-full h-full">
              {/* Outer glow */}
              <motion.div
                className="absolute -inset-4 rounded-2xl opacity-50"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(197, 160, 89, 0.2)',
                    '0 0 60px rgba(197, 160, 89, 0.4)',
                    '0 0 30px rgba(197, 160, 89, 0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Main container */}
              <div className="relative w-full h-full rounded-xl overflow-hidden
                              border-2 border-primary-gold/30 bg-primary-navy-dark/50
                              backdrop-blur-sm animate-glow-breathe">

                {/* Animated border gradient */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.3), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['-100% 0', '200% 0'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Blueprint frame corners - Enhanced */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-gold z-10">
                  <motion.div
                    className="absolute top-1 left-1 w-2 h-2 bg-primary-gold rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-gold z-10">
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 bg-primary-gold rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-gold z-10">
                  <motion.div
                    className="absolute bottom-1 left-1 w-2 h-2 bg-primary-gold rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-gold z-10">
                  <motion.div
                    className="absolute bottom-1 right-1 w-2 h-2 bg-primary-gold rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  />
                </div>

                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5 opacity-20">
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-primary-gold to-transparent" />
                  <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary-gold to-transparent" />
                </div>

                {/* 3D Building */}
                <InteractiveBuilding />

                {/* Label badge */}
                <motion.div
                  className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full
                             bg-primary-navy/80 backdrop-blur-sm border border-primary-gold/30
                             flex items-center gap-2 z-20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-accent-emerald"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs text-white/80">Interactive 3D Model</span>
                </motion.div>

                {/* Tech label */}
                <motion.div
                  className="absolute top-4 right-4 px-2 py-1 rounded
                             bg-primary-crimson/80 backdrop-blur-sm text-xs text-white z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  Three.js
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator - Enhanced */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="scroll-indicator pb-8"
        >
          <motion.div
            className="flex flex-col items-center gap-3"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-sm text-white/60 tracking-widest uppercase">Scroll to Explore</span>

            {/* Mouse scroll indicator */}
            <motion.div className="relative">
              <div className="w-6 h-10 rounded-full border-2 border-primary-gold/50 flex justify-center pt-2">
                <motion.div
                  className="w-1.5 h-3 rounded-full bg-primary-gold"
                  animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full border border-primary-gold/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Arrow */}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-primary-gold/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade - Enhanced */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-neutral-marble via-neutral-marble/80 to-transparent pointer-events-none" />

      {/* Side gradients for depth */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-primary-navy-dark/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-primary-navy-dark/50 to-transparent pointer-events-none" />
    </section>
  )
}
