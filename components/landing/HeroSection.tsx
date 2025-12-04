'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import BlueprintGrid from './BlueprintGrid'
import AnimatedTitle from './AnimatedTitle'

// Dynamic import for Three.js component (heavy)
const InteractiveBuilding = dynamic(() => import('./InteractiveBuilding'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function HeroSection() {
  const [titleComplete, setTitleComplete] = useState(false)

  return (
    <section className="relative min-h-screen bg-primary-navy overflow-hidden">
      {/* Animated Blueprint Grid Background */}
      <BlueprintGrid />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section - Title & Description */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-8 gap-8 lg:gap-16">
          {/* Left - Title & CTA */}
          <div className="flex-1 max-w-xl">
            <AnimatedTitle onAnimationComplete={() => setTitleComplete(true)} />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: titleComplete ? 1 : 0, y: titleComplete ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/upload" className="btn-blueprint corner-markers group">
                <span className="flex items-center gap-2">
                  시작하기
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </span>
              </Link>

              <Link
                href="/admin/prompts"
                className="px-8 py-4 border border-white/30 text-white/80 font-medium
                           hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  관리자 페이지
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Right - 3D Building */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex-1 w-full max-w-lg h-[350px] lg:h-[450px]"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-primary-gold/20">
              {/* Blueprint frame corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-gold z-10" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-gold z-10" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-gold z-10" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-gold z-10" />

              <InteractiveBuilding />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="scroll-indicator pb-8"
        >
          <span className="text-sm">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-marble to-transparent" />
    </section>
  )
}
