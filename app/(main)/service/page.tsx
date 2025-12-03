'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading 3D Viewer...</div>
})

export default function ServicePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageMetadata, setImageMetadata] = useState<any>(null)
  const [isPreprocessing, setIsPreprocessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'pipeline' | 'results' | '3d'>('upload')
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
      // 새 세션 + 저장된 데이터 = 새로고침
      setShowRefreshModal(true)
    } else if (!sessionFlag && !sessionId) {
      // 새 세션 + 데이터 없음 + 세션 ID 없음 = 최초 접속
      initSession()
    }

    // 세션 활성화 플래그 설정
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
      // 1. 로컬 ResultStorage 초기화
      resultStorage.clear()

      // 2. Blob Storage 초기화 (호스팅 환경)
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

      // 3. Zustand store 초기화
      clearAll()

      // 4. 새 세션 ID 생성
      initSession()

      // 5. 로컬 state 초기화
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
    // Store에서 이미지 복원
    if (storedImage) {
      setUploadedImage(storedImage)
    }
    setShowRefreshModal(false)
  }

  const handleImageUpload = async (base64: string, metadata: any) => {
    setIsPreprocessing(true)

    try {
      // 이미지 전처리
      const processed = await preprocessImage(base64, {
        maxWidth: 2048,
        maxHeight: 2048,
        contrast: 1.2, // 약간 대비 증가
      })

      setUploadedImage(processed)
      setImageMetadata(metadata)
      saveToStore(processed)

      // 자동으로 파이프라인 탭으로 이동
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

  return (
    <div className="min-h-screen bg-neutral-marble">
      {/* 새로고침 경고 모달 */}
      <RefreshWarningModal
        isOpen={showRefreshModal}
        onConfirm={handleRefreshConfirm}
        onCancel={handleRefreshCancel}
      />

      {/* Header */}
      <header className="bg-white border-b border-neutral-warmGray/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-primary-navy">
                2D to 3D BIM Converter
              </h1>
              <p className="text-sm text-neutral-warmGray mt-1">
                AI 기반 도면 분석 및 3D 모델 생성
              </p>
            </div>

            {uploadedImage && (
              <button onClick={handleReset} className="btn-secondary">
                새 프로젝트
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-neutral-warmGray/20">
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              pb-3 px-1 font-medium transition-colors relative
              ${
                activeTab === 'upload'
                  ? 'text-primary-crimson'
                  : 'text-neutral-warmGray hover:text-primary-navy'
              }
            `}
          >
            1. 이미지 업로드
            {activeTab === 'upload' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-crimson" />
            )}
          </button>

          <button
            onClick={() => uploadedImage && setActiveTab('pipeline')}
            disabled={!uploadedImage}
            className={`
              pb-3 px-1 font-medium transition-colors relative
              ${
                activeTab === 'pipeline'
                  ? 'text-primary-crimson'
                  : uploadedImage
                  ? 'text-neutral-warmGray hover:text-primary-navy'
                  : 'text-neutral-warmGray/30 cursor-not-allowed'
              }
            `}
          >
            2. AI 분석 실행
            {activeTab === 'pipeline' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-crimson" />
            )}
          </button>

          <button
            onClick={() => uploadedImage && setActiveTab('results')}
            disabled={!uploadedImage}
            className={`
              pb-3 px-1 font-medium transition-colors relative
              ${
                activeTab === 'results'
                  ? 'text-primary-crimson'
                  : uploadedImage
                  ? 'text-neutral-warmGray hover:text-primary-navy'
                  : 'text-neutral-warmGray/30 cursor-not-allowed'
              }
            `}
          >
            3. 결과 확인
            {activeTab === 'results' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-crimson" />
            )}
          </button>

          <button
            onClick={() => uploadedImage && setActiveTab('3d')}
            disabled={!uploadedImage}
            className={`
              pb-3 px-1 font-medium transition-colors relative
              ${
                activeTab === '3d'
                  ? 'text-primary-crimson'
                  : uploadedImage
                  ? 'text-neutral-warmGray hover:text-primary-navy'
                  : 'text-neutral-warmGray/30 cursor-not-allowed'
              }
            `}
          >
            4. 3D 뷰어
            {activeTab === '3d' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-crimson" />
            )}
          </button>

        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Current Tab */}
          <div className="lg:col-span-2">
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-xl font-serif font-bold text-primary-navy mb-4">
                  도면 이미지 업로드
                </h2>
                <ImageUploader onImageUpload={handleImageUpload} />

                {isPreprocessing && (
                  <div className="mt-4 card bg-primary-navy/5">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-primary-navy">
                        이미지 전처리 중...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pipeline' && uploadedImage && (
              <PhaseRunner
                imageBase64={uploadedImage}
                onComplete={() => setActiveTab('results')}
              />
            )}

            {activeTab === 'results' && uploadedImage && <ResultViewer />}

            {activeTab === '3d' && uploadedImage && (
              <div>
                <h2 className="text-xl font-serif font-bold text-primary-navy mb-4">
                  3D 모델 뷰어
                </h2>
                <div className="h-[600px] rounded-lg overflow-hidden bg-neutral-marble">
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
              </div>
            )}

          </div>

          {/* Right: Image Preview & Info / 3D Controls */}
          <div className="lg:col-span-1">
            {/* Export Panel (모달처럼 표시) */}
            {showExportPanel && (
              <div className="card mb-4">
                <ExportPanel
                  masterJSON={results.phase6}
                  onClose={() => setShowExportPanel(false)}
                />
              </div>
            )}

            {/* 3D 탭일 때는 뷰어 컨트롤 및 프로젝트 관리 표시 */}
            {activeTab === '3d' && uploadedImage && !showExportPanel && (
              <div className="sticky top-8 space-y-4">
                <ViewerControls onOptionsChange={setViewerOptions} />
                <ProjectManager />
              </div>
            )}

            {/* 다른 탭일 때는 이미지 정보 표시 */}
            {activeTab !== '3d' && uploadedImage && !showExportPanel && (
              <div className="card sticky top-8">
                <h3 className="text-lg font-serif font-semibold text-primary-navy mb-4">
                  업로드된 이미지
                </h3>

                <div className="rounded-lg overflow-hidden bg-neutral-warmGray/5 mb-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded floor plan"
                    className="w-full h-auto"
                  />
                </div>

                {imageMetadata && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-warmGray">해상도</span>
                      <span className="font-medium text-primary-navy">
                        {imageMetadata.width} × {imageMetadata.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-warmGray">크기</span>
                      <span className="font-medium text-primary-navy">
                        {(imageMetadata.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-warmGray">형식</span>
                      <span className="font-medium text-primary-navy">
                        {imageMetadata.format}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-neutral-warmGray/20">
                  <h4 className="text-sm font-semibold text-primary-navy mb-2">
                    처리 옵션
                  </h4>
                  <div className="space-y-1 text-xs text-neutral-warmGray">
                    <div>• 최대 해상도: 2048×2048</div>
                    <div>• 대비 조정: 1.2x</div>
                    <div>• 형식: PNG</div>
                  </div>
                </div>
              </div>
            )}

            {!uploadedImage && (
              <div className="card">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-warmGray/10 flex items-center justify-center">
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
                  </div>
                  <p className="text-sm text-neutral-warmGray">
                    이미지를 업로드하면
                    <br />
                    미리보기가 표시됩니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
