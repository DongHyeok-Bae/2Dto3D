'use client'

import { motion } from 'framer-motion'
import FeatureCard from './FeatureCard'
import TimeIcon from './icons/TimeIcon'
import AccuracyIcon from './icons/AccuracyIcon'
import DataIcon from './icons/DataIcon'
import InteractionIcon from './icons/InteractionIcon'

const features = [
  {
    icon: <TimeIcon className="w-full h-full" />,
    title: '시간 단축',
    description: '수일 걸리던 도면 분석 및 3D 변환 작업을 단 몇 분 만에 완료합니다.',
  },
  {
    icon: <AccuracyIcon className="w-full h-full" />,
    title: '정확성',
    description: 'AI 기반 벡터 인식으로 건축 요소를 정밀하게 추출하고 변환합니다.',
  },
  {
    icon: <DataIcon className="w-full h-full" />,
    title: '데이터화',
    description: '단순 3D 모델이 아닌, BIM 정보가 담긴 구조화된 데이터를 생성합니다.',
  },
  {
    icon: <InteractionIcon className="w-full h-full" />,
    title: '동적 상호작용',
    description: '실시간으로 3D 모델을 조작하고, 요소별 수정이 가능합니다.',
  },
]

export default function FeatureSection() {
  return (
    <section className="relative py-24 bg-neutral-marble overflow-hidden">
      {/* Blueprint Pattern Background */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />

      {/* Section Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Header Frame */}
          <div className="inline-block relative px-12 py-4">
            {/* Decorative Lines */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px bg-primary-gold" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px bg-primary-gold" />

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-navy">
              Why{' '}
              <span className="text-gradient-royal">2Dto3D</span>
              ?
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-lg text-neutral-warmGray max-w-2xl mx-auto"
          >
            AI 기술로 건축 도면 작업의 패러다임을 바꿉니다
          </motion.p>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
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
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent"
      />
    </section>
  )
}
