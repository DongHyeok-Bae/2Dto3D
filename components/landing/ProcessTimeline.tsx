'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProcessStep from './ProcessStep'

// Step Icons as SVG components
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
)

const AnalysisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
  </svg>
)

const ExtractIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h18M3 15h18" />
  </svg>
)

const VerifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Generate3DIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

const steps = [
  {
    number: 1,
    title: '도면 업로드',
    description: '2D 건축 도면 이미지(JPG, PNG)를 업로드합니다. 평면도, 입면도 등 다양한 도면 형식을 지원합니다.',
    icon: <UploadIcon />,
    color: '#9A212D', // Crimson
  },
  {
    number: 2,
    title: 'AI 분석',
    description: 'Google Gemini AI가 도면을 스캔하고 건축 요소(벽, 문, 창문, 공간)를 자동으로 인식합니다.',
    icon: <AnalysisIcon />,
    color: '#C5A059', // Gold
  },
  {
    number: 3,
    title: '요소 추출',
    description: '인식된 각 요소의 좌표, 크기, 유형을 추출하고 구조화된 데이터로 변환합니다.',
    icon: <ExtractIcon />,
    color: '#0066CC', // Sapphire
  },
  {
    number: 4,
    title: '검증',
    description: '추출된 데이터의 정합성을 검증하고, 누락되거나 잘못된 요소를 자동으로 보정합니다.',
    icon: <VerifyIcon />,
    color: '#00A86B', // Emerald
  },
  {
    number: 5,
    title: '3D 생성',
    description: '검증된 데이터를 기반으로 인터랙티브 3D 모델을 생성합니다. BIM 데이터와 함께 다양한 포맷으로 내보내기 가능합니다.',
    icon: <Generate3DIcon />,
    color: '#1A2B50', // Navy
  },
]

export default function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0)

  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-24 bg-neutral-marble overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Header Frame */}
          <div className="inline-block relative px-12 py-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px bg-primary-gold" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px bg-primary-gold" />

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-navy">
              변환{' '}
              <span className="text-gradient-royal">프로세스</span>
            </h2>
          </div>

          <p className="mt-6 text-lg text-neutral-warmGray max-w-2xl mx-auto">
            5단계 AI 파이프라인으로 정확하고 빠른 3D 변환을 제공합니다
          </p>
        </motion.div>

        {/* Step Indicators (Desktop) */}
        <div className="hidden md:flex justify-center gap-2 mb-12">
          {steps.map((step, index) => (
            <motion.button
              key={step.number}
              onClick={() => setActiveStep(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeStep === index
                  ? 'bg-primary-gold text-white shadow-lg'
                  : 'bg-white text-neutral-warmGray hover:bg-primary-gold/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {step.number}. {step.title}
            </motion.button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              color={step.color}
              isActive={activeStep === index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Progress Dots (Mobile) */}
        <div className="flex md:hidden justify-center gap-2 mt-8">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index
                  ? 'bg-primary-gold scale-125'
                  : 'bg-neutral-warmGray/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Decoration */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent"
      />
    </section>
  )
}
