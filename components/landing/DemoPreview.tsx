'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function DemoPreview() {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoAnimating, setIsAutoAnimating] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoAnimationRef = useRef<NodeJS.Timeout | null>(null)

  // Auto animation
  useEffect(() => {
    if (!isAutoAnimating) return

    let direction = 1
    autoAnimationRef.current = setInterval(() => {
      setSliderPosition((prev) => {
        if (prev >= 80) direction = -1
        if (prev <= 20) direction = 1
        return prev + direction * 0.5
      })
    }, 50)

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
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
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

  return (
    <section className="relative py-24 bg-primary-navy overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 blueprint-grid opacity-20" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-navy via-transparent to-primary-navy opacity-50" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            See the{' '}
            <span className="text-primary-gold animate-glow-pulse">Magic</span>
          </h2>
          <p className="text-lg text-white/70">
            AI가 2D 도면을 3D 모델로 변환하는 과정을 확인하세요
          </p>
        </motion.div>

        {/* Comparison Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          ref={containerRef}
          className="relative aspect-[16/10] max-w-4xl mx-auto rounded-lg overflow-hidden
                     border-2 border-primary-gold/30 shadow-2xl cursor-ew-resize"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseEnter={() => setIsAutoAnimating(false)}
          onMouseLeave={() => {
            if (!isDragging) setIsAutoAnimating(true)
          }}
        >
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-gold z-20" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-gold z-20" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-gold z-20" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-gold z-20" />

          {/* After Image (3D) - Full width background */}
          <div className="absolute inset-0">
            <Image
              src="/demo/floor-plan-3d.jpg"
              alt="3D Model Result"
              fill
              className="object-cover"
              priority
            />
            {/* 3D Label */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-primary-gold/90 text-primary-navy text-sm font-bold rounded z-10">
              3D MODEL
            </div>
          </div>

          {/* Before Image (2D) - Clipped by slider */}
          <div
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
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary-crimson/90 text-white text-sm font-bold rounded z-10">
              2D 도면
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary-gold z-10"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            {/* Handle Grip */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         w-10 h-10 rounded-full bg-primary-gold border-4 border-white
                         shadow-lg flex items-center justify-center
                         transition-transform duration-200
                         ${isDragging ? 'scale-110' : 'hover:scale-110'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-primary-navy"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-primary-gold blur-sm opacity-50" />
          </div>

          {/* Drag Hint */}
          <AnimatePresence>
            {isAutoAnimating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2
                           bg-black/50 backdrop-blur-sm rounded-full text-white/80 text-sm z-20"
              >
                ← 드래그하여 비교 →
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/upload"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-crimson to-primary-gold
                       text-white font-bold rounded-lg shadow-lg
                       hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>지금 변환 시작하기</span>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </motion.svg>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-gold">7단계</div>
            <div className="text-white/60 text-sm">AI 분석 파이프라인</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-gold">99%</div>
            <div className="text-white/60 text-sm">요소 인식 정확도</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-gold">5분</div>
            <div className="text-white/60 text-sm">평균 변환 시간</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
