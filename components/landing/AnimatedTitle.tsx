'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface AnimatedTitleProps {
  onAnimationComplete?: () => void
}

export default function AnimatedTitle({ onAnimationComplete }: AnimatedTitleProps) {
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [typedText, setTypedText] = useState('')

  const subtitle = '파편화된 2D 도면을 AI가 이해하고, 실시간 3D 모델로 변환합니다'

  useEffect(() => {
    // Start subtitle typing after logo animation
    const timer = setTimeout(() => {
      setShowSubtitle(true)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showSubtitle) return

    let index = 0
    const interval = setInterval(() => {
      if (index < subtitle.length) {
        setTypedText(subtitle.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        onAnimationComplete?.()
      }
    }, 40)

    return () => clearInterval(interval)
  }, [showSubtitle, onAnimationComplete])

  return (
    <div className="text-center">
      {/* Logo Animation */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Image
            src="/logo-crossover.png"
            alt="2Dto3D Logo"
            width={450}
            height={225}
            priority
            className="drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* Version Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-6"
      >
        <span className="inline-block px-4 py-2 bg-primary-gold/20 border border-primary-gold/40 rounded-full text-primary-gold text-sm font-medium">
          BIM-AutoConverter v3.0
        </span>
      </motion.div>

      {/* Typing Subtitle */}
      <AnimatePresence>
        {showSubtitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-16 flex items-center justify-center"
          >
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-primary-gold ml-1 align-middle"
              />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight Text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 0.6 }}
        className="mt-4 text-lg"
      >
        <span className="text-primary-gold animate-glow-pulse font-semibold">
          지능형 웹 서비스
        </span>
        <span className="text-white/60 ml-2">
          | 경희대학교 건축공학과
        </span>
      </motion.p>
    </div>
  )
}
