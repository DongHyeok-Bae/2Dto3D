'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import FeatureCard from './FeatureCard'
import TimeIcon from './icons/TimeIcon'
import AccuracyIcon from './icons/AccuracyIcon'
import DataIcon from './icons/DataIcon'
import InteractionIcon from './icons/InteractionIcon'
import { MiniLaurel } from './LaurelFrame'

const features = [
  {
    icon: <TimeIcon className="w-full h-full" />,
    title: '시간 단축',
    subtitle: '10x Faster',
    description: '수일 걸리던 도면 분석 및 3D 변환 작업을 단 몇 분 만에 완료합니다. AI가 복잡한 패턴을 즉시 인식합니다.',
    color: 'crimson',
    stats: { value: '90%', label: '시간 절약' },
  },
  {
    icon: <AccuracyIcon className="w-full h-full" />,
    title: '정확성',
    subtitle: 'Precision AI',
    description: 'AI 기반 벡터 인식으로 건축 요소를 정밀하게 추출하고 변환합니다.',
    color: 'sapphire',
    stats: { value: '99.2%', label: '인식률' },
  },
  {
    icon: <DataIcon className="w-full h-full" />,
    title: '데이터화',
    subtitle: 'Smart BIM',
    description: '단순 3D 모델이 아닌, BIM 정보가 담긴 구조화된 데이터를 생성합니다.',
    color: 'emerald',
    stats: { value: '7', label: '데이터 레이어' },
  },
  {
    icon: <InteractionIcon className="w-full h-full" />,
    title: '동적 상호작용',
    subtitle: 'Real-time',
    description: '실시간으로 3D 모델을 조작하고, 요소별 수정이 가능합니다.',
    color: 'gold',
    stats: { value: '∞', label: '편집 가능' },
  },
]

export default function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-neutral-marble overflow-hidden"
    >
      {/* ===== BACKGROUND LAYERS ===== */}

      {/* Layer 1: Blueprint Grid with Parallax */}
      <motion.div
        className="absolute inset-0 blueprint-grid opacity-20"
        style={{ y: backgroundY }}
      />

      {/* Layer 2: Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

      {/* Layer 3: Floating Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary-gold/5 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-crimson/5 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -50, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-sapphire/3 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layer 4: Laurel Pattern */}
      <div className="absolute inset-0 laurel-bg opacity-10" />

      {/* ===== SECTION HEADER ===== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Decorative laurels */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-16 h-px bg-gradient-to-r from-transparent to-primary-gold"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <MiniLaurel color="gold" />
            <motion.div
              className="w-16 h-px bg-gradient-to-l from-transparent to-primary-gold"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </motion.div>

          {/* Main heading */}
          <motion.h2
            className="text-4xl md:text-6xl font-display font-bold text-primary-navy mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Why{' '}
            <span className="text-gradient-animated">2Dto3D</span>
            ?
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-neutral-warmGray max-w-2xl mx-auto"
          >
            AI 기술로 건축 도면 작업의 <span className="text-primary-crimson font-medium">패러다임</span>을 바꿉니다
          </motion.p>

          {/* Animated underline */}
          <motion.div
            className="mt-6 mx-auto h-1 bg-gradient-royal rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 120 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.div>
      </div>

      {/* ===== BENTO GRID ===== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Bento Layout */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-6 auto-rows-fr" style={{ minHeight: '500px' }}>
          {/* Featured Card (2x2) */}
          <div className="col-span-2 row-span-2">
            <FeatureCard
              icon={features[0].icon}
              title={features[0].title}
              subtitle={features[0].subtitle}
              description={features[0].description}
              color={features[0].color as 'crimson' | 'sapphire' | 'emerald' | 'gold'}
              stats={features[0].stats}
              index={0}
              featured
            />
          </div>

          {/* Top Right Card */}
          <div className="col-span-2 row-span-1">
            <FeatureCard
              icon={features[1].icon}
              title={features[1].title}
              subtitle={features[1].subtitle}
              description={features[1].description}
              color={features[1].color as 'crimson' | 'sapphire' | 'emerald' | 'gold'}
              stats={features[1].stats}
              index={1}
              horizontal
            />
          </div>

          {/* Bottom Right Cards */}
          <div className="col-span-1 row-span-1">
            <FeatureCard
              icon={features[2].icon}
              title={features[2].title}
              subtitle={features[2].subtitle}
              description={features[2].description}
              color={features[2].color as 'crimson' | 'sapphire' | 'emerald' | 'gold'}
              stats={features[2].stats}
              index={2}
              compact
            />
          </div>
          <div className="col-span-1 row-span-1">
            <FeatureCard
              icon={features[3].icon}
              title={features[3].title}
              subtitle={features[3].subtitle}
              description={features[3].description}
              color={features[3].color as 'crimson' | 'sapphire' | 'emerald' | 'gold'}
              stats={features[3].stats}
              index={3}
              compact
            />
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
              description={feature.description}
              color={feature.color as 'crimson' | 'sapphire' | 'emerald' | 'gold'}
              stats={feature.stats}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* ===== BOTTOM DECORATIONS ===== */}

      {/* Connecting lines */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(197, 160, 89, 0.3) 20%, rgba(154, 33, 45, 0.3) 50%, rgba(0, 102, 204, 0.3) 80%, transparent 100%)',
        }}
      />

      {/* Floating numbers/indices */}
      {[1, 2, 3, 4].map((num, i) => (
        <motion.div
          key={num}
          className="absolute font-display text-9xl font-bold text-primary-gold/5 pointer-events-none select-none hidden xl:block"
          style={{
            top: `${20 + i * 20}%`,
            left: i % 2 === 0 ? '5%' : 'auto',
            right: i % 2 === 1 ? '5%' : 'auto',
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2, duration: 0.8 }}
        >
          0{num}
        </motion.div>
      ))}
    </section>
  )
}
