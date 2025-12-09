'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePipelineStore } from '@/store/pipelineStore'
import { PHASES, PHASE_DEPENDENCIES, TOTAL_PHASES, FINAL_PHASE } from '@/lib/config/phases'
import AlgorithmicArtCanvas from '@/components/service/AlgorithmicArtCanvas'
import NeuralPulseBar from '@/components/service/NeuralPulseBar'
import GlassPhaseCard from '@/components/service/GlassPhaseCard'
import MagneticButton from '@/components/service/MagneticButton'
import OrbitalProgress from '@/components/service/OrbitalProgress'
import ImageLightbox from '@/components/ui/ImageLightbox'

interface PhaseRunnerProps {
  imageBase64: string
  onComplete?: (results: any) => void
}

export default function PhaseRunner({ imageBase64, onComplete }: PhaseRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [viewMode, setViewMode] = useState<'cards' | 'orbital'>('cards')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const {
    setPhaseResult,
    results,
    executing,
    errors: storeErrors,
    setExecuting,
    setError,
    canExecutePhase,
    incrementExecutionCount,
    pipelineError,
    setPipelineError,
    getLastCompletedPhase,
    metadata,
  } = usePipelineStore()

  // ✅ 핵심: executing에서 실행 중 여부 파생 (탭 전환에도 Zustand 메모리에서 유지됨)
  const isAnyPhaseExecuting = Object.values(executing).some(v => v === true)
  const showSplitView = isRunning || isAnyPhaseExecuting

  // 현재 실행 중인 Phase 번호 파생 (탭 복귀 시에도 정확)
  const getCurrentExecutingPhase = () => {
    for (let i = 1; i <= TOTAL_PHASES; i++) {
      if (executing[i]) return i
    }
    return 0
  }
  const executingPhase = getCurrentExecutingPhase()

  // 파생 상태: results, executing, errors에서 phaseStatuses 계산
  const phaseStatuses = useMemo(() => {
    const statuses: Record<number, 'pending' | 'running' | 'completed' | 'error'> = {}
    PHASES.forEach(phase => {
      const phaseKey = `phase${phase.number}` as keyof typeof results
      if (executing[phase.number]) {
        statuses[phase.number] = 'running'
      } else if (storeErrors[phase.number]) {
        statuses[phase.number] = 'error'
      } else if (results[phaseKey]) {
        statuses[phase.number] = 'completed'
      } else {
        statuses[phase.number] = 'pending'
      }
    })
    return statuses
  }, [results, executing, storeErrors])

  // Confidence Scores
  const confidenceScores = useMemo(() => {
    const scores: Record<number, number> = {}
    PHASES.forEach(phase => {
      const phaseKey = `phase${phase.number}` as keyof typeof results
      const result = results[phaseKey]
      if (result && typeof result === 'object' && 'metadata' in result) {
        scores[phase.number] = (result as any).metadata?.confidence || 0
      }
    })
    return scores
  }, [results])

  // "이어서 실행" 버튼 표시 조건
  const lastCompletedPhase = getLastCompletedPhase()
  const showContinueButton =
    !isRunning &&
    lastCompletedPhase > 0 &&
    lastCompletedPhase < TOTAL_PHASES

  // Orbital Progress용 phases 데이터
  const orbitalPhases = useMemo(() =>
    PHASES.map(phase => ({
      number: phase.number,
      name: phase.name,
      status: phaseStatuses[phase.number],
      confidence: confidenceScores[phase.number]
    })), [phaseStatuses, confidenceScores])

  const runPhase = async (phaseNumber: number) => {
    setCurrentPhase(phaseNumber)
    setExecuting(phaseNumber, true)
    setError(phaseNumber, null)

    try {
      const endpoint = `/api/pipeline/phase${phaseNumber}`

      // Request body 구성
      let body: any = {
        imageBase64,
        promptVersion: 'latest',
      }

      // Phase 2-5: 이전 결과 포함
      if (phaseNumber >= 2 && phaseNumber <= 5) {
        const currentResults = usePipelineStore.getState().results
        body.previousResults = {
          phase1: currentResults.phase1,
          phase2: currentResults.phase2,
          phase3: currentResults.phase3,
          phase4: currentResults.phase4,
        }
      }

      // 최종 Phase: Master JSON 생성 - 이전 모든 Phase 결과 포함 (이미지 없음)
      if (phaseNumber === FINAL_PHASE.number) {
        const currentResults = usePipelineStore.getState().results
        body.allResults = {
          phase1: currentResults.phase1,
          phase2: currentResults.phase2,
          phase3: currentResults.phase3,
          phase4: currentResults.phase4,
          phase5: currentResults.phase5,
        }
        delete body.imageBase64 // 최종 Phase는 이미지 불필요
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Phase ${phaseNumber} 실패`)
      }

      const data = await response.json()

      // 결과 저장 (메타데이터 포함)
      setPhaseResult(phaseNumber, data.result, data.metadata)
      setExecuting(phaseNumber, false)

      // 실행 횟수 증가
      incrementExecutionCount(phaseNumber)

      return data.result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      setError(phaseNumber, errorMessage)
      setExecuting(phaseNumber, false)
      throw error
    }
  }

  // 특정 Phase부터 실행하는 공통 함수
  const runFromPhase = async (startPhase: number) => {
    setIsRunning(true)
    setPipelineError(null)

    for (let i = startPhase; i <= TOTAL_PHASES; i++) {
      setError(i, null)
    }

    let failedPhase = 0

    try {
      for (let i = startPhase; i <= TOTAL_PHASES; i++) {
        failedPhase = i
        await runPhase(i)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (onComplete) {
        onComplete(usePipelineStore.getState().results)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      setPipelineError({
        phase: failedPhase,
        message: errorMessage,
      })
      console.error(`Pipeline execution failed at phase ${failedPhase}:`, error)
    } finally {
      setIsRunning(false)
      setCurrentPhase(0)
    }
  }

  const runAllPhases = async () => {
    for (let i = 1; i <= TOTAL_PHASES; i++) {
      setError(i, null)
    }
    await runFromPhase(1)
  }

  const handleContinue = async () => {
    const lastCompleted = getLastCompletedPhase()
    await runFromPhase(lastCompleted + 1)
  }

  const runSinglePhase = async (phaseNumber: number) => {
    setIsRunning(true)
    try {
      await runPhase(phaseNumber)
    } catch (error) {
      console.error(`Phase ${phaseNumber} failed:`, error)
    } finally {
      setIsRunning(false)
      setCurrentPhase(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Neural Pulse Bar - AI Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <NeuralPulseBar
          isActive={showSplitView}
          currentPhase={executingPhase || currentPhase || getLastCompletedPhase()}
          totalPhases={TOTAL_PHASES}
          status={showSplitView ? `Phase ${executingPhase || currentPhase} 분석 중...` : 'AI Engine Ready'}
        />
      </motion.div>

      {/* Algorithmic Art Canvas - Building Animation with Split View */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={`grid gap-4 ${showSplitView ? 'grid-cols-5' : 'grid-cols-1'}`}>
          {/* Original Image Panel (40% = 2/5 columns) - Only shown during analysis */}
          <AnimatePresence>
            {showSplitView && (
              <motion.div
                className="col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-warmGray/10 shadow-neo">
                  {/* Header */}
                  <div className="p-3 bg-gradient-to-r from-primary-gold/10 to-transparent border-b border-neutral-warmGray/10">
                    <h4 className="text-sm font-serif font-semibold text-primary-navy flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      원본 도면
                    </h4>
                  </div>

                  {/* Image Container */}
                  <motion.div
                    className="relative p-3 cursor-pointer group"
                    onClick={() => setLightboxOpen(true)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-neutral-warmGray/5 border border-neutral-warmGray/10">
                      <img
                        src={imageBase64}
                        alt="Original floor plan"
                        className="w-full h-auto max-h-[280px] object-contain transition-transform group-hover:scale-105"
                      />

                      {/* Scanning Effect Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-primary-crimson/20 via-transparent to-transparent pointer-events-none"
                        animate={{ y: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-primary-navy/0 group-hover:bg-primary-navy/10 transition-colors flex items-center justify-center">
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg"
                          initial={{ scale: 0.9 }}
                          whileHover={{ scale: 1 }}
                        >
                          <span className="text-xs font-medium text-primary-navy flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                            확대
                          </span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Analysis Status */}
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-warmGray">
                      <span className="flex items-center gap-1">
                        <motion.span
                          className="w-2 h-2 rounded-full bg-primary-crimson"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        분석 중...
                      </span>
                      <span>Phase {executingPhase || currentPhase}/{TOTAL_PHASES}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Algorithmic Art Canvas (60% = 3/5 columns when running, full width otherwise) */}
          <div className={showSplitView ? 'col-span-3' : 'col-span-1'}>
            <AlgorithmicArtCanvas
              currentPhase={executingPhase || currentPhase || getLastCompletedPhase()}
              totalPhases={TOTAL_PHASES}
              isRunning={showSplitView}
              confidenceScores={confidenceScores}
            />
          </div>
        </div>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-neutral-warmGray/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-serif font-bold text-primary-navy">
            AI 파이프라인
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-navy/5">
            <span className="text-sm text-neutral-warmGray">
              {getLastCompletedPhase()}/{TOTAL_PHASES} 완료
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-neutral-warmGray/20">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'cards'
                  ? 'bg-primary-navy text-white'
                  : 'bg-white text-neutral-warmGray hover:bg-neutral-warmGray/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('orbital')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'orbital'
                  ? 'bg-primary-navy text-white'
                  : 'bg-white text-neutral-warmGray hover:bg-neutral-warmGray/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <MagneticButton
            variant="primary"
            onClick={runAllPhases}
            disabled={isRunning}
            loading={isRunning}
            icon={isRunning ? undefined : "🚀"}
          >
            {isRunning ? '실행 중...' : '전체 실행'}
          </MagneticButton>

          {showContinueButton && (
            <MagneticButton
              variant="secondary"
              onClick={handleContinue}
              disabled={isRunning}
              icon="▶️"
            >
              Phase {lastCompletedPhase + 1}부터
            </MagneticButton>
          )}
        </div>
      </motion.div>

      {/* Pipeline Error Message */}
      <AnimatePresence>
        {pipelineError && (
          <motion.div
            className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 flex items-start gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                Phase {pipelineError.phase}에서 오류 발생
              </p>
              <p className="text-sm text-red-600 mt-1">{pipelineError.message}</p>
              <button
                onClick={() => runFromPhase(pipelineError.phase)}
                className="mt-2 text-sm text-red-700 underline hover:text-red-800"
              >
                이 Phase부터 재시도
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.div
            key="cards"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {PHASES.map((phase, index) => (
              <motion.div
                key={phase.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassPhaseCard
                  phaseNumber={phase.number}
                  phaseName={phase.name}
                  description={phase.description}
                  status={phaseStatuses[phase.number]}
                  confidence={confidenceScores[phase.number]}
                  onRun={() => runSinglePhase(phase.number)}
                  disabled={!canExecutePhase(phase.number) || isRunning}
                  prerequisites={
                    PHASE_DEPENDENCIES[phase.number]?.map(dep => ({
                      phase: dep,
                      completed: !!results[`phase${dep}` as keyof typeof results]
                    })) || []
                  }
                  metadata={{
                    executionTime: metadata[`phase${phase.number}` as keyof typeof metadata]?.executionTime,
                    itemCount: (() => {
                      const result = results[`phase${phase.number}` as keyof typeof results] as any
                      if (!result) return undefined
                      // 각 Phase별 아이템 수 계산
                      if (result.walls) return result.walls.length
                      if (result.spaces) return result.spaces.length
                      if (result.doors || result.windows) return (result.doors?.length || 0) + (result.windows?.length || 0)
                      if (result.building) return Object.values(result.building).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
                      return undefined
                    })()
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="orbital"
            className="flex justify-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <OrbitalProgress
              phases={orbitalPhases}
              currentPhase={currentPhase || getLastCompletedPhase()}
              onPhaseClick={(phaseNum) => {
                if (canExecutePhase(phaseNum) && !isRunning) {
                  runSinglePhase(phaseNum)
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Celebration */}
      <AnimatePresence>
        {getLastCompletedPhase() === TOTAL_PHASES && !isRunning && (
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-emerald/10 via-primary-gold/10 to-accent-sapphire/10 border border-accent-emerald/30 p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Celebration particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#C5A059', '#00A86B', '#0066CC'][i % 3]
                  }}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{
                    y: '-100%',
                    opacity: [0, 1, 0],
                    x: Math.sin(i) * 50
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center gap-4">
              <motion.div
                className="text-5xl"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-primary-navy">
                  모든 분석이 완료되었습니다!
                </h3>
                <p className="text-neutral-warmGray mt-1">
                  결과 확인 탭에서 상세 데이터를 확인하거나, 3D 뷰어에서 모델을 확인하세요.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox for Split View */}
      <ImageLightbox
        isOpen={lightboxOpen}
        imageSrc={imageBase64}
        onClose={() => setLightboxOpen(false)}
        title="원본 도면"
        alt="Original floor plan"
      />
    </div>
  )
}
