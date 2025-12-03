'use client'

import { useState, useMemo } from 'react'
import { usePipelineStore, PHASE_DEPENDENCIES } from '@/store/pipelineStore'

interface PhaseRunnerProps {
  imageBase64: string
  onComplete?: (results: any) => void
}

// 6단계 파이프라인 (기존 Phase 6 검증 제거, Phase 7이 Phase 6으로 승격)
const PHASES = [
  { number: 1, name: 'Normalization', description: '좌표계 설정' },
  { number: 2, name: 'Structure', description: '구조 추출' },
  { number: 3, name: 'Openings', description: '개구부 인식' },
  { number: 4, name: 'Spaces', description: '공간 분석' },
  { number: 5, name: 'Dimensions', description: '치수 계산' },
  { number: 6, name: 'Master JSON', description: '최종 BIM JSON 생성' },
]

export default function PhaseRunner({ imageBase64, onComplete }: PhaseRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)

  const {
    setPhaseResult,
    results,
    executing,
    errors: storeErrors,
    setExecuting,
    setError,
    canExecutePhase,
  } = usePipelineStore()

  // 파생 상태: results, executing, errors에서 phaseStatuses 계산
  const phaseStatuses = useMemo(() => {
    const statuses: Record<number, 'pending' | 'running' | 'completed' | 'error'> = {}
    for (let i = 1; i <= 6; i++) {
      const phaseKey = `phase${i}` as keyof typeof results
      if (executing[i]) {
        statuses[i] = 'running'
      } else if (storeErrors[i]) {
        statuses[i] = 'error'
      } else if (results[phaseKey]) {
        statuses[i] = 'completed'
      } else {
        statuses[i] = 'pending'
      }
    }
    return statuses
  }, [results, executing, storeErrors])

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
        body.previousResults = {
          phase1: results.phase1,
          phase2: results.phase2,
          phase3: results.phase3,
          phase4: results.phase4,
        }
      }

      // Phase 6: Master JSON 생성 - Phase 1-5 결과 포함 (이미지 없음)
      if (phaseNumber === 6) {
        body.allResults = {
          phase1: results.phase1,
          phase2: results.phase2,
          phase3: results.phase3,
          phase4: results.phase4,
          phase5: results.phase5,
        }
        delete body.imageBase64 // Phase 6은 이미지 불필요
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

      return data.result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      setError(phaseNumber, errorMessage)
      setExecuting(phaseNumber, false)
      throw error
    }
  }

  const runAllPhases = async () => {
    setIsRunning(true)
    // 모든 Phase 에러 초기화
    for (let i = 1; i <= 6; i++) {
      setError(i, null)
    }

    try {
      for (let i = 1; i <= 6; i++) { // 6단계 파이프라인
        await runPhase(i)
        // 각 Phase 사이에 약간의 딜레이 (UI 업데이트를 위해)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // 완료 콜백
      if (onComplete) {
        onComplete(results)
      }
    } catch (error) {
      console.error('Pipeline execution failed:', error)
    } finally {
      setIsRunning(false)
      setCurrentPhase(0)
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <div className="w-5 h-5 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin" />
        )
      case 'completed':
        return (
          <svg className="w-5 h-5 text-accent-emerald" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-neutral-warmGray/30" />
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-primary-navy">
          AI 파이프라인 실행
        </h2>
        <button
          onClick={runAllPhases}
          disabled={isRunning}
          className="btn-primary"
        >
          {isRunning ? '실행 중...' : '전체 실행'}
        </button>
      </div>

      {/* Phase List */}
      <div className="space-y-3">
        {PHASES.map(phase => (
          <div
            key={phase.number}
            className={`
              card-hover flex items-center gap-4 p-4
              ${phaseStatuses[phase.number] === 'running' ? 'ring-2 ring-primary-crimson' : ''}
            `}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {getStatusIcon(phaseStatuses[phase.number])}
            </div>

            {/* Phase Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-navy">
                  Phase {phase.number}: {phase.name}
                </span>
                {phaseStatuses[phase.number] === 'running' && (
                  <span className="text-xs text-primary-crimson font-medium">
                    실행 중...
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-warmGray">{phase.description}</p>

              {/* 선수 조건 체크마크 */}
              {PHASE_DEPENDENCIES[phase.number]?.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-neutral-warmGray mr-1">선수조건:</span>
                  {PHASE_DEPENDENCIES[phase.number].map(dep => {
                    const phaseKey = `phase${dep}` as keyof typeof results
                    const isCompleted = !!results[phaseKey]
                    return (
                      <span
                        key={dep}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-accent-emerald/20 text-accent-emerald'
                            : 'bg-neutral-warmGray/20 text-neutral-warmGray'
                        }`}
                      >
                        P{dep} {isCompleted ? '✓' : '○'}
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Error Message */}
              {storeErrors[phase.number] && (
                <p className="text-sm text-red-600 mt-1">{storeErrors[phase.number]}</p>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => runSinglePhase(phase.number)}
              disabled={!canExecutePhase(phase.number) || isRunning}
              className={`btn-secondary text-sm ${
                !canExecutePhase(phase.number) && !isRunning
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              title={
                !canExecutePhase(phase.number)
                  ? '선수 Phase를 먼저 실행하세요'
                  : undefined
              }
            >
              {phaseStatuses[phase.number] === 'completed' ? '재실행' : '단독 실행'}
            </button>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="card bg-primary-navy/5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-navy">
                Phase {currentPhase} 처리 중...
              </p>
              <div className="mt-2 w-full bg-neutral-warmGray/20 rounded-full h-2">
                <div
                  className="bg-gradient-royal h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPhase / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
