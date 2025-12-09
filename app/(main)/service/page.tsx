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
import { usePipelineStore } from '@/store/pipelineStore'
import { preprocessImage } from '@/lib/image/preprocessor'
import { resultStorage } from '@/lib/config/result-manager'
import { getStorageEnvironment } from '@/lib/config/environment'

// 3D 뷰어는 클라이언트 전용이므로 dynamic import
const Viewer3D = dynamic(() => import('@/components/viewer/Viewer3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-marble/50">
      <motion.div
        className="flex items-center gap-3 text-primary-navy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-6 h-6 border-2 border-primary-crimson border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="font-serif">Loading 3D Viewer...</span>
      </motion.div>
    </div>
  )
})

const tabs = [
  { value: 'upload', label: '이미지 업로드' },
  { value: 'pipeline', label: 'AI 분석 실행' },
  { value: 'results', label: '결과 확인' },
  { value: '3d', label: '3D 뷰어' },
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
      {/* Background Layers */}
      {/* Layer 1: Base Marble */}
      <div className="fixed inset-0 bg-neutral-marble" />

      {/* Layer 2: Gradient Mesh */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(197, 160, 89, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(154, 33, 45, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 102, 204, 0.03) 0%, transparent 50%)
          `
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layer 3: Blueprint Grid */}
      <div className="fixed inset-0 blueprint-grid opacity-[0.15] pointer-events-none" />

      {/* Layer 4: Laurel Pattern */}
      <div className="fixed inset-0 laurel-bg opacity-[0.08] pointer-events-none" />

      {/* Layer 5: Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? '#C5A059' : i % 3 === 1 ? '#9A212D' : '#0066CC',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* 새로고침 경고 모달 */}
        <RefreshWarningModal
          isOpen={showRefreshModal}
          onConfirm={handleRefreshConfirm}
          onCancel={handleRefreshCancel}
        />

        {/* Header */}
        <header className="relative bg-white/80 backdrop-blur-md border-b border-primary-gold/20 shadow-sm">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-crimson via-primary-gold to-primary-navy" />

          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Image
                    src="/logo-crossover.png"
                    alt="2Dto3D"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: '0 0 20px rgba(197, 160, 89, 0.3)' }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div>
                  <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-crimson via-primary-navy to-primary-gold bg-clip-text text-transparent">
                    2D to 3D BIM Converter
                  </h1>
                  <p className="text-sm text-neutral-warmGray mt-0.5 flex items-center gap-2">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-accent-emerald"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    AI 기반 도면 분석 및 3D 모델 생성
                  </p>
                </div>
              </div>

              {uploadedImage && (
                <motion.button
                  onClick={handleReset}
                  className="btn-secondary group flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>새 프로젝트</span>
                  <motion.span
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -5 }}
                    whileHover={{ x: 0 }}
                  >
                    +
                  </motion.span>
                </motion.button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="relative flex gap-2 sm:gap-4 mb-8 border-b border-neutral-warmGray/20 overflow-x-auto pb-px">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.value
              const enabled = isTabEnabled(tab.value)

              return (
                <motion.button
                  key={tab.value}
                  onClick={() => enabled && setActiveTab(tab.value)}
                  disabled={!enabled}
                  className={`
                    relative pb-4 px-2 sm:px-3 font-medium transition-colors whitespace-nowrap
                    ${isActive
                      ? 'text-primary-crimson'
                      : enabled
                      ? 'text-neutral-warmGray hover:text-primary-navy'
                      : 'text-neutral-warmGray/30 cursor-not-allowed'
                    }
                  `}
                  whileHover={enabled ? { y: -2 } : {}}
                  whileTap={enabled ? { scale: 0.98 } : {}}
                >
                  {/* Step Number Badge */}
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2
                    transition-all duration-300
                    ${isActive
                      ? 'bg-primary-crimson text-white shadow-md shadow-primary-crimson/30'
                      : enabled
                      ? 'bg-neutral-warmGray/20 text-neutral-warmGray group-hover:bg-primary-navy/10'
                      : 'bg-neutral-warmGray/10 text-neutral-warmGray/30'
                    }
                  `}>
                    {index + 1}
                  </span>

                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-sm">{tab.label.split(' ')[0]}</span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      layoutId="activeTabIndicator"
                      style={{
                        background: 'linear-gradient(90deg, transparent, #9A212D, #C5A059, #9A212D, transparent)',
                        boxShadow: '0 2px 8px rgba(154, 33, 45, 0.3)',
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Current Tab */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeTab === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-serif font-bold text-primary-navy mb-4 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-crimson/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      도면 이미지 업로드
                    </h2>
                    <ImageUploader onImageUpload={handleImageUpload} />

                    {isPreprocessing && (
                      <motion.div
                        className="mt-4 card bg-primary-navy/5 border-primary-navy/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-5 h-5 border-2 border-primary-crimson border-t-transparent rounded-full"
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

                {activeTab === 'pipeline' && uploadedImage && (
                  <motion.div
                    key="pipeline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PhaseRunner
                      imageBase64={uploadedImage}
                      onComplete={() => setActiveTab('results')}
                    />
                  </motion.div>
                )}

                {activeTab === 'results' && uploadedImage && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultViewer />
                  </motion.div>
                )}

                {activeTab === '3d' && uploadedImage && (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-serif font-bold text-primary-navy mb-4 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-accent-sapphire/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                      </span>
                      3D 모델 뷰어
                    </h2>
                    <div className="h-[600px] rounded-2xl overflow-hidden bg-neutral-marble border-2 border-neutral-warmGray/20 shadow-lg">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Image Preview & Info / 3D Controls */}
            <div className="lg:col-span-1">
              {/* Export Panel */}
              <AnimatePresence>
                {showExportPanel && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  >
                    <ExportPanel
                      masterJSON={results.phase6}
                      onClose={() => setShowExportPanel(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3D 탭일 때는 뷰어 컨트롤 및 프로젝트 관리 표시 */}
              {activeTab === '3d' && uploadedImage && !showExportPanel && (
                <motion.div
                  className="sticky top-8 space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ViewerControls onOptionsChange={setViewerOptions} />
                  <ProjectManager />
                </motion.div>
              )}

              {/* 다른 탭일 때는 이미지 정보 표시 */}
              {activeTab !== '3d' && uploadedImage && !showExportPanel && (
                <motion.div
                  className="card sticky top-8 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Card Header Gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-gold via-primary-crimson to-primary-gold" />

                  <h3 className="text-lg font-serif font-semibold text-primary-navy mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    업로드된 이미지
                  </h3>

                  <div className="rounded-xl overflow-hidden bg-neutral-warmGray/5 mb-4 border border-neutral-warmGray/10">
                    <img
                      src={uploadedImage}
                      alt="Uploaded floor plan"
                      className="w-full h-auto"
                    />
                  </div>

                  {imageMetadata && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-marble">
                        <span className="text-neutral-warmGray">해상도</span>
                        <span className="font-medium text-primary-navy">
                          {imageMetadata.width} × {imageMetadata.height}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-marble">
                        <span className="text-neutral-warmGray">크기</span>
                        <span className="font-medium text-primary-navy">
                          {(imageMetadata.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-marble">
                        <span className="text-neutral-warmGray">형식</span>
                        <span className="font-medium text-primary-navy">
                          {imageMetadata.format}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-neutral-warmGray/20">
                    <h4 className="text-sm font-semibold text-primary-navy mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      처리 옵션
                    </h4>
                    <div className="space-y-1 text-xs text-neutral-warmGray">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                        최대 해상도: 2048×2048
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-sapphire" />
                        대비 조정: 1.2x
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-gold" />
                        형식: PNG
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!uploadedImage && (
                <motion.div
                  className="card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-center py-8">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neutral-warmGray/10 to-neutral-warmGray/5 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg
                        className="w-8 h-8 text-neutral-warmGray"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </motion.div>
                    <p className="text-sm text-neutral-warmGray">
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

        {/* Footer */}
        <footer className="relative py-8 mt-16 border-t border-neutral-warmGray/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
              <Image
                src="/logo.png"
                alt="2Dto3D"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="text-xs text-neutral-warmGray font-medium">
                Powered by Kyung Hee University
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
