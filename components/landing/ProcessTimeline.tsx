'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { MiniLaurel } from './LaurelFrame'
import { SparkleField } from './ParticleField'

// Step Icons as SVG components with enhanced styling
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <motion.path
      d="M17 8l-5-5-5 5"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <motion.path
      d="M12 3v12"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </svg>
)

const AnalysisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <motion.path
      d="M21 21l-4.35-4.35"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
    <path d="M11 8v6M8 11h6" />
  </svg>
)

const ExtractIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <motion.path
      d="M9 3v18"
      strokeDasharray="4 2"
      animate={{ strokeDashoffset: [0, 12] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
    <motion.path
      d="M3 9h18"
      strokeDasharray="4 2"
      animate={{ strokeDashoffset: [0, -12] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
    <motion.path
      d="M3 15h18"
      strokeDasharray="4 2"
      animate={{ strokeDashoffset: [0, 12] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </svg>
)

const VerifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <motion.path
      d="M9 12l2 2 4-4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
    />
    <circle cx="12" cy="12" r="9" />
  </svg>
)

const Generate3DIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <motion.path
      d="M12 2L2 7l10 5 10-5-10-5z"
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.path
      d="M2 17l10 5 10-5"
      animate={{ y: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
    />
    <motion.path
      d="M2 12l10 5 10-5"
      animate={{ y: [0, 0.5, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.15 }}
    />
  </svg>
)

const steps = [
  {
    number: 1,
    title: '도면 업로드',
    shortTitle: '업로드',
    description: '2D 건축 도면 이미지(JPG, PNG)를 업로드합니다. 평면도, 입면도 등 다양한 도면 형식을 지원합니다.',
    icon: <UploadIcon />,
    color: '#9A212D',
    colorName: 'crimson',
    gradient: 'from-primary-crimson to-primary-crimson-light',
  },
  {
    number: 2,
    title: 'AI 분석',
    shortTitle: '분석',
    description: 'Google Gemini AI가 도면을 스캔하고 건축 요소(벽, 문, 창문, 공간)를 자동으로 인식합니다.',
    icon: <AnalysisIcon />,
    color: '#C5A059',
    colorName: 'gold',
    gradient: 'from-primary-gold to-primary-gold-light',
  },
  {
    number: 3,
    title: '요소 추출',
    shortTitle: '추출',
    description: '인식된 각 요소의 좌표, 크기, 유형을 추출하고 구조화된 데이터로 변환합니다.',
    icon: <ExtractIcon />,
    color: '#0066CC',
    colorName: 'sapphire',
    gradient: 'from-accent-sapphire to-accent-sapphire-light',
  },
  {
    number: 4,
    title: '검증',
    shortTitle: '검증',
    description: '추출된 데이터의 정합성을 검증하고, 누락되거나 잘못된 요소를 자동으로 보정합니다.',
    icon: <VerifyIcon />,
    color: '#00A86B',
    colorName: 'emerald',
    gradient: 'from-accent-emerald to-accent-emerald-light',
  },
  {
    number: 5,
    title: '3D 생성',
    shortTitle: '생성',
    description: '검증된 데이터를 기반으로 인터랙티브 3D 모델을 생성합니다. BIM 데이터와 함께 다양한 포맷으로 내보내기 가능합니다.',
    icon: <Generate3DIcon />,
    color: '#1A2B50',
    colorName: 'navy',
    gradient: 'from-primary-navy to-primary-navy-light',
  },
]

// Flowing particles on connection line
function FlowingParticles({
  fromColor,
  toColor,
  isActive,
  delay = 0
}: {
  fromColor: string
  toColor: string
  isActive: boolean
  delay?: number
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {isActive && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
            boxShadow: `0 0 8px ${fromColor}`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          initial={{ left: '-5%', opacity: 0 }}
          animate={{
            left: '105%',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: delay + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// Horizontal connection line with gradient
function ConnectionLine({
  fromColor,
  toColor,
  progress,
  isActive,
  index,
}: {
  fromColor: string
  toColor: string
  progress: number
  isActive: boolean
  index: number
}) {
  return (
    <div className="relative flex-1 h-1 mx-2">
      {/* Background line */}
      <div className="absolute inset-0 rounded-full bg-neutral-warmGray/20" />

      {/* Gradient fill */}
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
        }}
        initial={{ width: '0%' }}
        animate={{ width: progress >= index + 1 ? '100%' : progress > index ? `${(progress - index) * 100}%` : '0%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Glow effect when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${fromColor}40, ${toColor}40)`,
            filter: 'blur(4px)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Flowing particles */}
      <FlowingParticles
        fromColor={fromColor}
        toColor={toColor}
        isActive={isActive}
        delay={index * 0.2}
      />
    </div>
  )
}

// Step node for horizontal timeline
function TimelineNode({
  step,
  isActive,
  isPast,
  index,
  onClick,
}: {
  step: typeof steps[0]
  isActive: boolean
  isPast: boolean
  index: number
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Glow background for active */}
      {isActive && (
        <motion.div
          className="absolute -inset-4 rounded-2xl"
          style={{
            background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Step circle */}
      <motion.div
        className={`
          relative w-16 h-16 md:w-20 md:h-20 rounded-full
          flex items-center justify-center
          border-2 transition-all duration-500
          ${isActive
            ? 'bg-white shadow-xl'
            : isPast
              ? 'bg-white/80'
              : 'bg-white/60 group-hover:bg-white/80'
          }
        `}
        style={{
          borderColor: isActive || isPast ? step.color : `${step.color}40`,
          boxShadow: isActive ? `0 0 30px ${step.color}40, 0 0 60px ${step.color}20` : 'none',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Icon */}
        <motion.div
          className="w-8 h-8 md:w-10 md:h-10"
          style={{ color: isActive || isPast ? step.color : '#8B8680' }}
          animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {step.icon}
        </motion.div>

        {/* Number badge */}
        <motion.div
          className={`
            absolute -top-1 -right-1 w-6 h-6 rounded-full
            flex items-center justify-center text-xs font-bold
            transition-all duration-300
          `}
          style={{
            backgroundColor: isActive || isPast ? step.color : '#E5E0DB',
            color: isActive || isPast ? 'white' : '#8B8680',
          }}
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {step.number}
        </motion.div>

        {/* Pulse rings for active */}
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: step.color }}
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: step.color }}
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
            />
          </>
        )}

        {/* Checkmark for past steps */}
        {isPast && !isActive && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-emerald flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </motion.div>

      {/* Title */}
      <motion.span
        className={`
          mt-3 text-sm md:text-base font-medium text-center
          transition-colors duration-300
          ${isActive ? 'text-primary-navy' : isPast ? 'text-neutral-warmGray' : 'text-neutral-warmGray/60'}
        `}
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {step.shortTitle}
      </motion.span>
    </motion.div>
  )
}

// Detail card for active step
function StepDetailCard({ step, isVisible }: { step: typeof steps[0], isVisible: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 p-8 rounded-2xl bg-white/90 backdrop-blur-sm border-2 overflow-hidden"
          style={{ borderColor: `${step.color}30` }}
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `radial-gradient(circle at 0% 0%, ${step.color} 0%, transparent 50%)`,
            }}
          />

          {/* Corner decorations */}
          <div
            className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 rounded-tl-2xl"
            style={{ borderColor: step.color }}
          />
          <div
            className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 rounded-br-2xl"
            style={{ borderColor: step.color }}
          />

          {/* Content */}
          <div className="relative flex flex-col md:flex-row items-start gap-6">
            {/* Icon box */}
            <motion.div
              className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${step.color}15` }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-12 h-12" style={{ color: step.color }}>
                {step.icon}
              </div>
            </motion.div>

            {/* Text content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  STEP {step.number}
                </span>
                <MiniLaurel size={20} color={step.color} />
              </div>

              <h3
                className="text-2xl font-display font-bold mb-3"
                style={{ color: step.color }}
              >
                {step.title}
              </h3>

              <p className="text-neutral-warmGray leading-relaxed">
                {step.description}
              </p>

              {/* Progress bar */}
              <div className="mt-4 h-1 rounded-full bg-neutral-warmGray/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: step.color }}
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 4, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Animate progress
  useEffect(() => {
    setProgress(activeStep)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < activeStep + 1) {
          return Math.min(prev + 0.05, activeStep + 0.99)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(timer)
  }, [activeStep])

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-neutral-marble via-white to-neutral-marble"
          style={{ y: backgroundY }}
        />

        {/* Blueprint grid */}
        <div className="absolute inset-0 blueprint-grid opacity-10" />

        {/* Radial gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-crimson/5 rounded-full blur-3xl" />

        {/* Sparkle particles */}
        <SparkleField count={15} className="opacity-30" />

        {/* Fade overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Laurel decoration */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <MiniLaurel size={24} color="#C5A059" className="rotate-180" />
            <span className="text-primary-gold font-medium tracking-widest text-sm uppercase">
              AI Pipeline
            </span>
            <MiniLaurel size={24} color="#C5A059" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-navy mb-4">
            변환{' '}
            <span className="text-gradient-royal">프로세스</span>
          </h2>

          <p className="text-lg text-neutral-warmGray max-w-2xl mx-auto">
            5단계 AI 파이프라인으로 정확하고 빠른 3D 변환을 제공합니다
          </p>
        </motion.div>

        {/* Horizontal Timeline (Desktop) */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <TimelineNode
                  step={step}
                  isActive={activeStep === index}
                  isPast={index < activeStep}
                  index={index}
                  onClick={() => setActiveStep(index)}
                />

                {/* Connection line */}
                {index < steps.length - 1 && (
                  <ConnectionLine
                    fromColor={step.color}
                    toColor={steps[index + 1].color}
                    progress={progress}
                    isActive={activeStep === index}
                    index={index}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Detail card */}
          <StepDetailCard step={steps[activeStep]} isVisible={true} />
        </div>

        {/* Vertical Timeline (Mobile) */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-500
                ${activeStep === index
                  ? 'bg-white shadow-lg'
                  : 'bg-white/60'
                }
              `}
              style={{
                borderColor: activeStep === index ? step.color : `${step.color}30`,
              }}
              onClick={() => setActiveStep(index)}
            >
              {/* Vertical line */}
              {index < steps.length - 1 && (
                <div
                  className="absolute left-1/2 -bottom-6 w-0.5 h-6 -translate-x-1/2"
                  style={{
                    background: `linear-gradient(to bottom, ${step.color}, ${steps[index + 1].color})`,
                  }}
                />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <div className="w-8 h-8" style={{ color: step.color }}>
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.number}
                    </span>
                    <h3 className="font-display font-bold" style={{ color: step.color }}>
                      {step.title}
                    </h3>
                  </div>

                  <AnimatePresence>
                    {activeStep === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-neutral-warmGray leading-relaxed"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress bar for active */}
              {activeStep === index && (
                <motion.div
                  className="mt-4 h-1 rounded-full bg-neutral-warmGray/20 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.color }}
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 4, ease: 'linear' }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { value: '< 30초', label: '평균 처리 시간' },
            { value: '99.2%', label: '변환 성공률' },
            { value: '5단계', label: 'AI 파이프라인' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl md:text-3xl font-display font-bold text-primary-gold">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-warmGray mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Decoration */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent"
      />
    </section>
  )
}
