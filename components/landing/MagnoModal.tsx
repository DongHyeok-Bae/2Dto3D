'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface MagnoModalProps {
  isOpen: boolean
  onClose: () => void
}

// MAGNO 브랜드 색상 (LOGO.png 기준)
const TEAL = '#189A8A'
const TEAL_DARK = '#0E7468'
const TEAL_LIGHT = '#2BBBA8'
const GOLD = '#C9A24B'

const SPECIAL_DRAWINGS = ['병원', '학교', '데이터센터', '복층']

export default function MagnoModal({ isOpen, onClose }: MagnoModalProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#0E1A18]/85 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* 상단 틸→골드 gradient 액센트 바 */}
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL}, ${GOLD})` }}
            />

            {/* 골드 코너 액센트 */}
            <div
              className="pointer-events-none absolute left-0 top-1.5 h-8 w-8 rounded-tl-2xl border-l-2 border-t-2"
              style={{ borderColor: `${GOLD}99` }}
            />
            <div
              className="pointer-events-none absolute right-0 top-1.5 h-8 w-8 rounded-tr-2xl border-r-2 border-t-2"
              style={{ borderColor: `${GOLD}99` }}
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-2 border-l-2"
              style={{ borderColor: `${GOLD}99` }}
            />
            <div
              className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-2 border-r-2"
              style={{ borderColor: `${GOLD}99` }}
            />

            {/* 닫기(X) 버튼 */}
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-neutral-warmGray transition-colors hover:bg-neutral-marble hover:text-neutral-charcoal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 본문 */}
            <div className="px-8 pb-8 pt-7 text-center">
              {/* MAGNO 로고 */}
              <div className="mb-5 flex justify-center">
                <Image
                  src="/magno-logo.png"
                  alt="MAGNO"
                  width={180}
                  height={116}
                  priority
                  className="h-auto w-[180px] select-none"
                  draggable={false}
                />
              </div>

              {/* 배지 */}
              <div className="mb-4 flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white"
                  style={{ background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL})` }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: GOLD }}
                  />
                  차세대 BIM 변환
                </span>
              </div>

              {/* 제목 */}
              <h3
                className="mb-3 font-serif text-2xl font-bold"
                style={{ color: TEAL_DARK }}
              >
                이제 MAGNO에서 만나보세요
              </h3>

              {/* 설명 */}
              <p className="mb-5 text-sm leading-relaxed text-neutral-warmGray">
                <span className="font-semibold text-neutral-charcoal">2Dto3D</span>가 AI 의존도를
                낮추고, 병원·학교·데이터센터·복층 등 복잡한 특수 도면까지 정밀하게 변환하는 차세대
                서비스{' '}
                <span className="font-bold" style={{ color: TEAL }}>
                  MAGNO
                </span>
                로 진화했습니다.
              </p>

              {/* 특수 도면 태그 칩 */}
              <div className="mb-7 flex flex-wrap justify-center gap-2">
                {SPECIAL_DRAWINGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: `${TEAL}55`, color: TEAL_DARK, background: `${TEAL}0D` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 메인 CTA */}
              <a
                href="https://magno.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                style={{
                  background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL}, ${GOLD})`,
                  boxShadow: `0 8px 24px ${TEAL}40`,
                }}
              >
                magno.kr 바로가기
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {/* 보조 닫기 */}
              <button
                onClick={onClose}
                className="mt-3 text-sm text-neutral-warmGray transition-colors hover:text-neutral-charcoal"
              >
                나중에 볼게요
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
