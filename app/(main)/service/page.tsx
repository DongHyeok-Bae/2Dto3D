'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from '@/components/upload/ImageUploader'
import PhaseRunner from '@/components/pipeline/PhaseRunner'
import ResultViewer from '@/components/results/ResultViewer'
import ViewerControls, { type ViewerOptions } from '@/components/viewer/ViewerControls'
import ExportPanel from '@/components/export/ExportPanel'
import ProjectManager from '@/components/export/ProjectManager'
import RefreshWarningModal from '@/components/ui/RefreshWarningModal'
import ImageLightbox from '@/components/ui/ImageLightbox'
import MagneticButton from '@/components/service/MagneticButton'
import { TabIcons } from '@/components/service/icons/TabIcons'
import { usePipelineStore } from '@/store/pipelineStore'
import { preprocessImage } from '@/lib/image/preprocessor'
import { resultStorage } from '@/lib/config/result-manager'
import { getStorageEnvironment } from '@/lib/config/environment'

// 3D 뷰어는 클라이언트 전용이므로 dynamic import
const Viewer3D = dynamic(() => import('@/components/viewer/Viewer3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-navy/5 to-primary-navy/10">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-primary-gold border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <span className="font-serif text-primary-navy">Loading 3D Viewer...</span>
      </motion.div>
    </div>
  )
})

const tabs = [
  { value: 'upload', label: '이미지 업로드', description: '도면 이미지를 업로드하세요' },
  { value: 'pipeline', label: 'AI 분석 실행', description: 'AI가 도면을 분석합니다' },
  { value: 'results', label: '결과 확인', description: '분석 결과를 확인하세요' },
  { value: '3d', label: '3D 뷰어', description: '3D 모델을 확인하세요' },
] as const

type TabValue = typeof tabs[number]['value']

export default function ServicePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageMetadata, setImageMetadata] = useState<any>(null)
  const [isPreprocessing, setIsPreprocessing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>('upload')
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions>({
    showSpaces: true,
    showFloor: true,
    showGrid: true,
    showAxes: false,
    wireframe: false,
  })
  const [showRefreshModal, setShowRefreshModal] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const {
    setUploadedImage: saveToStore,
    resetFromPhase,
    results,
    uploadedImage: storedImage,
    sessionId,
    initSession,
    clearAll,
  } = usePipelineStore()

  // 새로고침 감지: 세션 플래그 확인
  useEffect(() => {
    const sessionFlag = sessionStorage.getItem('2dto3d-session-active')
    const hasStoredData = storedImage || Object.keys(results).length > 0

    if (!sessionFlag && hasStoredData) {
      setShowRefreshModal(true)
    } else if (!sessionFlag && !sessionId) {
      initSession()
    }

    sessionStorage.setItem('2dto3d-session-active', 'true')
  }, [])

  // Store 이미지 동기화
  useEffect(() => {
    if (storedImage && !uploadedImage) {
      setUploadedImage(storedImage)
    }
  }, [storedImage])

  // 새로고침 모달: 초기화 확인
  const handleRefreshConfirm = async () => {
    try {
      resultStorage.clear()

      const env = getStorageEnvironment()
      if (env === 'vercel' && sessionId) {
        try {
          await fetch('/api/storage/clear-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
        } catch (e) {
          console.warn('Blob storage clear failed:', e)
        }
      }

      clearAll()
      initSession()
      setUploadedImage(null)
      setImageMetadata(null)
      setActiveTab('upload')
    } catch (error) {
      console.error('Failed to clear data:', error)
    } finally {
      setShowRefreshModal(false)
    }
  }

  // 새로고침 모달: 이전 결과 유지
  const handleRefreshCancel = () => {
    if (storedImage) {
      setUploadedImage(storedImage)
    }
    setShowRefreshModal(false)
  }

  const handleImageUpload = async (base64: string, metadata: any) => {
    setIsPreprocessing(true)

    try {
      const processed = await preprocessImage(base64, {
        maxWidth: 2048,
        maxHeight: 2048,
        contrast: 1.2,
      })

      setUploadedImage(processed)
      setImageMetadata(metadata)
      saveToStore(processed)
      setActiveTab('pipeline')
    } catch (error) {
      console.error('Image preprocessing error:', error)
      alert('이미지 전처리 중 오류가 발생했습니다.')
    } finally {
      setIsPreprocessing(false)
    }
  }

  const handleReset = () => {
    setUploadedImage(null)
    setImageMetadata(null)
    resetFromPhase(1)
    setActiveTab('upload')
  }

  const isTabEnabled = (tab: TabValue) => {
    if (tab === 'upload') return true
    return !!uploadedImage
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* === IMMERSIVE BACKGROUND LAYERS === */}
      {/* Layer 1: Base Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-marble via-neutral-ivory to-neutral-marble" />

      {/* Layer 2: Animated Mesh Gradient */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 15% 85%, rgba(197, 160, 89, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, rgba(154, 33, 45, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 102, 204, 0.05) 0%, transparent 60%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(ellipse at 15% 85%, rgba(197, 160, 89, 0.12) 0%, transparent 50%),
             radial-gradient(ellipse at 85% 15%, rgba(154, 33, 45, 0.08) 0%, transparent 50%),
             radial-gradient(ellipse at 50% 50%, rgba(0, 102, 204, 0.05) 0%, transparent 60%)`,
            `radial-gradient(ellipse at 25% 75%, rgba(197, 160, 89, 0.15) 0%, transparent 50%),
             radial-gradient(ellipse at 75% 25%, rgba(154, 33, 45, 0.1) 0%, transparent 50%),
             radial-gradient(ellipse at 60% 40%, rgba(0, 102, 204, 0.08) 0%, transparent 60%)`,
            `radial-gradient(ellipse at 15% 85%, rgba(197, 160, 89, 0.12) 0%, transparent 50%),
             radial-gradient(ellipse at 85% 15%, rgba(154, 33, 45, 0.08) 0%, transparent 50%),
             radial-gradient(ellipse at 50% 50%, rgba(0, 102, 204, 0.05) 0%, transparent 60%)`
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layer 3: Blueprint Grid */}
      <div className="fixed inset-0 opacity-[0.08] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="blueprint-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C5A059" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="#C5A059" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      {/* Layer 4: Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              backgroundColor: ['#C5A059', '#9A212D', '#0066CC', '#00A86B'][i % 4],
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* === CONTENT WRAPPER === */}
      <div className="relative z-10">
        {/* 새로고침 경고 모달 */}
        <RefreshWarningModal
          isOpen={showRefreshModal}
          onConfirm={handleRefreshConfirm}
          onCancel={handleRefreshCancel}
        />

        {/* === AVANT-GARDE HEADER === */}
        <header className="relative bg-white/70 backdrop-blur-xl border-b border-primary-gold/10 shadow-neo">
          {/* Top Accent Line - Animated Gradient */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, #9A212D 0%, #C5A059 25%, #1A2B50 50%, #C5A059 75%, #9A212D 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-5">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Logo Glow */}
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-primary-gold/20 blur-md"
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <Image
                    src="/logo-crossover.png"
                    alt="2Dto3D"
                    width={56}
                    height={56}
                    className="relative object-contain drop-shadow-lg"
                  />
                </motion.div>

                <div>
                  <motion.h1
                    className="text-2xl md:text-3xl font-display font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="bg-gradient-to-r from-primary-crimson via-primary-navy to-primary-gold bg-clip-text text-transparent">
                      2D to 3D BIM Converter
                    </span>
                  </motion.h1>
                  <motion.p
                    className="text-sm text-neutral-warmGray mt-1 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-accent-emerald"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    AI 기반 도면 분석 및 3D 모델 생성
                  </motion.p>
                </div>
              </div>

              {/* Actions */}
              {uploadedImage && (
                <MagneticButton
                  variant="secondary"
                  onClick={handleReset}
                  icon="✨"
                >
                  새 프로젝트
                </MagneticButton>
              )}
            </div>
          </div>
        </header>

        {/* === MAIN CONTENT === */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* === IMMERSIVE TAB NAVIGATION === */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap gap-3 p-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-neutral-warmGray/10">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.value
                const enabled = isTabEnabled(tab.value)

                return (
                  <motion.button
                    key={tab.value}
                    onClick={() => enabled && setActiveTab(tab.value)}
                    disabled={!enabled}
                    className={`
                      relative flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all
                      ${isActive
                        ? 'bg-gradient-to-r from-primary-navy to-primary-navy/90 text-white shadow-lg shadow-primary-navy/20'
                        : enabled
                        ? 'bg-white/80 text-neutral-warmGray hover:bg-white hover:text-primary-navy hover:shadow-md'
                        : 'bg-neutral-warmGray/10 text-neutral-warmGray/40 cursor-not-allowed'
                      }
                    `}
                    whileHover={enabled ? { scale: 1.02 } : {}}
                    whileTap={enabled ? { scale: 0.98 } : {}}
                    layout
                  >
                    {/* Step Badge */}
                    <span className={`
                      flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : enabled
                        ? 'bg-primary-gold/10 text-primary-gold'
                        : 'bg-neutral-warmGray/20 text-neutral-warmGray/40'
                      }
                    `}>
                      {index + 1}
                    </span>

                    {/* Icon & Label */}
                    <span className="flex items-center gap-2">
                      {/* Custom Geometric Icon */}
                      {(() => {
                        const IconComponent = TabIcons[tab.value as keyof typeof TabIcons]
                        return IconComponent ? (
                          <IconComponent
                            className={`w-5 h-5 ${isActive ? 'text-white' : enabled ? 'text-primary-navy' : 'text-neutral-warmGray/40'}`}
                            isActive={isActive}
                          />
                        ) : null
                      })()}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>

                    {/* Active Glow */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-primary-gold/10"
                        layoutId="activeTabGlow"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Tab Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTab}
                className="mt-3 text-sm text-neutral-warmGray pl-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                {tabs.find(t => t.value === activeTab)?.description}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* === CONTENT GRID === */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Main Content Area (3D 탭은 전체 너비) */}
            <div className={activeTab === '3d' ? 'lg:col-span-4' : 'lg:col-span-3'}>
              <AnimatePresence mode="wait">
                {/* UPLOAD TAB */}
                {activeTab === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-crimson to-primary-crimson/80 flex items-center justify-center shadow-lg shadow-primary-crimson/20">
                        <TabIcons.upload className="w-5 h-5 text-white" isActive />
                      </div>
                      <div>
                        <h2 className="text-xl font-serif font-bold text-primary-navy">도면 이미지 업로드</h2>
                        <p className="text-sm text-neutral-warmGray">건축 도면을 업로드하여 AI 분석을 시작하세요</p>
                      </div>
                    </div>

                    <ImageUploader onImageUpload={handleImageUpload} />

                    {isPreprocessing && (
                      <motion.div
                        className="p-4 rounded-xl bg-primary-navy/5 border border-primary-navy/10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-6 h-6 border-2 border-primary-crimson border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <p className="text-sm text-primary-navy font-medium">
                            이미지 전처리 중...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* PIPELINE TAB */}
                {activeTab === 'pipeline' && uploadedImage && (
                  <motion.div
                    key="pipeline"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PhaseRunner
                      imageBase64={uploadedImage}
                      onComplete={() => setActiveTab('results')}
                    />
                  </motion.div>
                )}

                {/* RESULTS TAB */}
                {activeTab === 'results' && uploadedImage && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultViewer />
                  </motion.div>
                )}

                {/* 3D VIEWER TAB */}
                {activeTab === '3d' && uploadedImage && (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-sapphire to-accent-sapphire/80 flex items-center justify-center shadow-lg shadow-accent-sapphire/20">
                        {(() => {
                          const Icon3D = TabIcons['3d']
                          return <Icon3D className="w-5 h-5 text-white" isActive />
                        })()}
                      </div>
                      <div>
                        <h2 className="text-xl font-serif font-bold text-primary-navy">3D 모델 뷰어</h2>
                        <p className="text-sm text-neutral-warmGray">분석된 도면을 3D로 확인하세요</p>
                      </div>
                    </div>

                    {/* 3D Viewer Container */}
                    <div className="relative h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-navy/5 to-primary-navy/10 border border-neutral-warmGray/10 shadow-neo-lg">
                      {/* Corner Decorations */}
                      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-gold/50 rounded-tl-lg" />
                      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-gold/50 rounded-tr-lg" />
                      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-gold/50 rounded-bl-lg" />
                      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-gold/50 rounded-br-lg" />

                      <Viewer3D
                        masterJSON={results.phase6 ?? null}
                        showSpaces={viewerOptions.showSpaces}
                        showFloor={viewerOptions.showFloor}
                        showGrid={viewerOptions.showGrid}
                        showAxes={viewerOptions.showAxes}
                        wireframe={viewerOptions.wireframe}
                        onExportClick={() => setShowExportPanel(true)}
                      />
                    </div>

                    {/* Controls Below 3D Viewer - 가로 2열 배치 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ViewerControls onOptionsChange={setViewerOptions} />
                      <ProjectManager />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1">
              {/* 3D Tab: 컨트롤이 뷰어 아래로 이동됨 */}
              {/* 사이드바 이미지 섹션 삭제됨 - Split View에서 원본 이미지가 표시됨 */}

              {/* Empty State */}
              {!uploadedImage && (
                <motion.div
                  className="rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm border border-neutral-warmGray/10 shadow-neo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-center py-12 px-6">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-neutral-warmGray/10 to-neutral-warmGray/5 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span className="text-4xl opacity-50">🖼️</span>
                    </motion.div>
                    <p className="text-neutral-warmGray">
                      이미지를 업로드하면
                      <br />
                      미리보기가 표시됩니다
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        {/* === EXPORT PANEL MODAL === */}
        <AnimatePresence>
          {showExportPanel && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-primary-navy/60 backdrop-blur-sm"
                onClick={() => setShowExportPanel(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              {/* Modal Content */}
              <motion.div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <ExportPanel
                  masterJSON={results.phase6}
                  onClose={() => setShowExportPanel(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === IMAGE LIGHTBOX === */}
        {uploadedImage && (
          <ImageLightbox
            isOpen={lightboxOpen}
            imageSrc={uploadedImage}
            onClose={() => setLightboxOpen(false)}
            title="업로드된 도면"
            alt="Uploaded floor plan"
          />
        )}

        {/* === FOOTER === */}
        <footer className="relative py-10 mt-16 border-t border-neutral-warmGray/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="/logo.png"
                  alt="2Dto3D"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-sm text-neutral-warmGray font-medium">
                  Powered by Kyung Hee University
                </span>
              </motion.div>
              <p className="text-xs text-neutral-warmGray/60">
                AI-Powered Architectural Analysis & 3D BIM Generation
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
