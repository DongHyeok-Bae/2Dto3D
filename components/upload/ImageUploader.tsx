'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { validateImage, fileToBase64, getImageMetadata } from '@/lib/image/preprocessor'

interface ImageUploaderProps {
  onImageUpload: (imageBase64: string, metadata: any) => void
  maxSize?: number
  accept?: string
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
}

export default function ImageUploader({
  onImageUpload,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [showRipple, setShowRipple] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const particleIdRef = useRef(0)

  // Particle effect on hover
  useEffect(() => {
    if (!isHovered || preview) return

    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: particleIdRef.current++,
        x: Math.random() * 100,
        y: 100,
        color: ['#C5A059', '#9A212D', '#0066CC', '#00A86B'][Math.floor(Math.random() * 4)]
      }
      setParticles(prev => [...prev.slice(-15), newParticle])
    }, 200)

    return () => clearInterval(interval)
  }, [isHovered, preview])

  // Clear old particles
  useEffect(() => {
    const timeout = setTimeout(() => {
      setParticles(prev => prev.slice(1))
    }, 2000)
    return () => clearTimeout(timeout)
  }, [particles])

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsProcessing(true)
      setShowRipple(true)
      setTimeout(() => setShowRipple(false), 600)

      try {
        // 이미지 검증
        const validation = await validateImage(file)
        if (!validation.valid) {
          setError(validation.error || '이미지 검증 실패')
          setIsProcessing(false)
          return
        }

        // Base64 변환
        const base64 = await fileToBase64(file)
        setPreview(base64)

        // 메타데이터 추출
        const metadata = await getImageMetadata(base64)

        // 부모 컴포넌트로 전달
        onImageUpload(base64, metadata)
      } catch (err) {
        setError('이미지 처리 중 오류가 발생했습니다.')
        console.error('Image upload error:', err)
      } finally {
        setIsProcessing(false)
      }
    },
    [onImageUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleReset = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className="w-full">
      {!preview ? (
        <motion.div
          ref={containerRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-300
            ${isDragging
              ? 'bg-gradient-to-br from-primary-crimson/10 to-primary-gold/10'
              : 'bg-gradient-to-br from-white/80 to-neutral-marble/50'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Animated SVG Border */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.rect
              x="4"
              y="4"
              width="calc(100% - 8px)"
              height="calc(100% - 8px)"
              rx="16"
              ry="16"
              fill="none"
              stroke={isDragging ? '#9A212D' : '#C5A059'}
              strokeWidth="2"
              strokeDasharray="12 8"
              initial={{ strokeDashoffset: 0 }}
              animate={{
                strokeDashoffset: [0, -40],
                stroke: isDragging ? '#9A212D' : isHovered ? '#C5A059' : '#D1D5DB'
              }}
              transition={{
                strokeDashoffset: { duration: 2, repeat: Infinity, ease: 'linear' },
                stroke: { duration: 0.3 }
              }}
            />
          </svg>

          {/* Glow Effect on Drag */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-crimson/20 via-transparent to-primary-gold/20 blur-xl" />
                <motion.div
                  className="absolute inset-4 rounded-xl border-2 border-primary-crimson/50"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(154, 33, 45, 0.3)',
                      '0 0 40px rgba(154, 33, 45, 0.5)',
                      '0 0 20px rgba(154, 33, 45, 0.3)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ripple Effect on Drop */}
          <AnimatePresence>
            {showRipple && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-primary-gold/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 4 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${particle.x}%`,
                    backgroundColor: particle.color,
                  }}
                  initial={{ y: '100%', opacity: 0, scale: 0 }}
                  animate={{ y: '-20%', opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* File Input */}
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-5">
            {/* Animated Upload Icon */}
            <motion.div
              className="relative"
              animate={isHovered ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Icon Glow */}
              <motion.div
                className="absolute -inset-3 rounded-full bg-primary-gold/20 blur-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-crimson to-primary-navy flex items-center justify-center shadow-xl shadow-primary-crimson/20">
                <motion.svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </motion.svg>
              </div>
            </motion.div>

            {isProcessing ? (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-5 h-5 border-2 border-primary-crimson border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span className="text-primary-navy font-medium">이미지 처리 중...</span>
              </motion.div>
            ) : (
              <>
                <div className="space-y-2">
                  <motion.p
                    className="text-xl font-serif font-bold text-primary-navy"
                    animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                  >
                    {isDragging ? '여기에 놓으세요!' : '도면 이미지를 업로드하세요'}
                  </motion.p>
                  <p className="text-neutral-warmGray">
                    클릭하거나 드래그 앤 드롭
                  </p>
                </div>

                {/* File Info */}
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {[
                    { icon: '📄', text: 'PNG, JPEG, WebP' },
                    { icon: '📏', text: '최대 10MB' },
                    { icon: '🎯', text: '권장: 1000×1000+' },
                  ].map((item, i) => (
                    <motion.span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-neutral-warmGray/10 text-neutral-warmGray shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Corner Accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-gold/40 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-gold/40 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-gold/40 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-gold/40 rounded-br-lg" />
        </motion.div>
      ) : (
        <motion.div
          className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-warmGray/10 shadow-neo"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Preview Header */}
          <div className="p-4 bg-gradient-to-r from-accent-emerald/10 to-transparent border-b border-neutral-warmGray/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold text-primary-navy flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✅
                </motion.span>
                이미지 업로드 완료
              </h3>
            </div>
          </div>

          {/* Preview Image */}
          <div className="p-4">
            <div className="relative rounded-xl overflow-hidden bg-neutral-warmGray/5 border border-neutral-warmGray/10">
              <img
                src={preview}
                alt="Uploaded floor plan"
                className="w-full h-auto max-h-96 object-contain"
              />
              {/* Success Overlay */}
              <motion.div
                className="absolute inset-0 bg-accent-emerald/10 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="p-4 pt-0 flex justify-end">
            <motion.button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-primary-navy/5 text-primary-navy font-medium text-sm hover:bg-primary-navy/10 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              다른 이미지 선택
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
