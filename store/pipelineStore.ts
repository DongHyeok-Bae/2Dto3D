import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Phase1Result,
  Phase2Result,
  Phase3Result,
  Phase4Result,
  Phase5Result,
  MasterJSON,
} from '@/types'

// Phase 의존성 정의
export const PHASE_DEPENDENCIES: Record<number, number[]> = {
  1: [],              // 의존성 없음 (이미지만 필요)
  2: [1],             // Phase 1 필요
  3: [1, 2],          // Phase 1-2 필요
  4: [1, 2, 3],       // Phase 1-3 필요
  5: [1, 2, 3, 4],    // Phase 1-4 필요
  6: [1, 2, 3, 4, 5], // Phase 1-5 필요 (이미지 불필요)
}

// 이미지가 필요한 Phase 목록
export const PHASES_REQUIRING_IMAGE = [1, 2, 3, 4, 5]

// 선수 조건 상태 인터페이스
export interface PrerequisiteStatus {
  canExecute: boolean
  completedPrereqs: number[]
  missingPrereqs: number[]
  requiresImage: boolean
  hasImage: boolean
}

// Phase 결과 메타데이터 인터페이스
export interface PhaseMetadata {
  validated?: boolean // 검증 성공 여부
  validationErrors?: string[] // 검증 에러 (있으면)
  timestamp: string // 저장 시각
  promptVersion?: string // 프롬프트 버전
  [key: string]: any // 추가 메타데이터
}

// 파이프라인 에러 인터페이스
export interface PipelineError {
  phase: number // 에러가 발생한 Phase
  message: string // 에러 메시지
}

interface PipelineState {
  // 세션 ID (새로고침 감지용)
  sessionId: string | null

  // 현재 상태
  currentPhase: number
  uploadedImage: string | null
  uploadedImageName: string | null

  // 각 Phase 결과 (6단계 파이프라인)
  results: {
    phase1?: Phase1Result
    phase2?: Phase2Result
    phase3?: Phase3Result
    phase4?: Phase4Result
    phase5?: Phase5Result
    phase6?: MasterJSON // Phase 6 = Master JSON Assembly (기존 Phase 7)
  }

  // 각 Phase 메타데이터
  metadata: {
    phase1?: PhaseMetadata
    phase2?: PhaseMetadata
    phase3?: PhaseMetadata
    phase4?: PhaseMetadata
    phase5?: PhaseMetadata
    phase6?: PhaseMetadata
  }

  // 실행 상태
  executing: Record<number, boolean>
  errors: Record<number, string | null>

  // 파이프라인 에러 (전체 실행 중 발생한 에러)
  pipelineError: PipelineError | null

  // 실행 횟수 추적
  executionCounts: Record<number, number>

  // 액션
  setCurrentPhase: (phase: number) => void
  setUploadedImage: (image: string, filename?: string) => void
  setPhaseResult: (phase: number, result: any, metadata?: PhaseMetadata) => void
  setExecuting: (phase: number, executing: boolean) => void
  setError: (phase: number, error: string | null) => void
  reset: () => void
  resetFromPhase: (phase: number) => void
  initSession: () => void
  clearAll: () => void

  // 선수 조건 체크 함수
  canExecutePhase: (phaseNumber: number) => boolean
  getPrerequisiteStatus: (phaseNumber: number) => PrerequisiteStatus

  // 실행 횟수 증가
  incrementExecutionCount: (phase: number) => void

  // 파이프라인 에러 관리
  setPipelineError: (error: PipelineError | null) => void

  // 마지막으로 완료된 Phase 번호 조회 (결과 기반 계산)
  getLastCompletedPhase: () => number
}

const initialState = {
  sessionId: null as string | null,
  currentPhase: 0,
  uploadedImage: null as string | null,
  uploadedImageName: null as string | null,
  results: {},
  metadata: {},
  executing: {},
  errors: {},
  pipelineError: null as PipelineError | null,
  executionCounts: {} as Record<number, number>,
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      ...initialState,
      metadata: {},

      setCurrentPhase: phase => set({ currentPhase: phase }),

      setUploadedImage: (image, filename) =>
        set({
          uploadedImage: image,
          uploadedImageName: filename || null,
          currentPhase: 1,
        }),

      setPhaseResult: (phase, result, metadata) =>
        set(state => ({
          results: {
            ...state.results,
            [`phase${phase}`]: result,
          },
          metadata: {
            ...state.metadata,
            [`phase${phase}`]: metadata || {
              timestamp: new Date().toISOString(),
            },
          },
          currentPhase: phase < 6 ? phase + 1 : phase, // 6단계 파이프라인
        })),

      setExecuting: (phase, executing) =>
        set(state => ({
          executing: {
            ...state.executing,
            [phase]: executing,
          },
        })),

      setError: (phase, error) =>
        set(state => ({
          errors: {
            ...state.errors,
            [phase]: error,
          },
        })),

      incrementExecutionCount: (phase: number) =>
        set(state => ({
          executionCounts: {
            ...state.executionCounts,
            [phase]: (state.executionCounts[phase] || 0) + 1,
          },
        })),

      setPipelineError: (error: PipelineError | null) =>
        set({ pipelineError: error }),

      getLastCompletedPhase: () => {
        const { results } = get()
        let lastCompleted = 0

        for (let i = 1; i <= 6; i++) {
          const phaseKey = `phase${i}` as keyof typeof results
          if (results[phaseKey]) {
            lastCompleted = i
          } else {
            break // 중간에 빈 결과가 있으면 중단
          }
        }

        return lastCompleted
      },

      reset: () => set(initialState),

      initSession: () =>
        set({ sessionId: crypto.randomUUID() }),

      clearAll: () => {
        set(initialState)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pipeline-storage')
        }
      },

      resetFromPhase: phase =>
        set(state => {
          const newResults = { ...state.results }
          const newMetadata = { ...state.metadata }
          const newErrors = { ...state.errors }
          const newExecuting = { ...state.executing }

          // phase부터 이후 결과 모두 삭제 (6단계 파이프라인)
          for (let i = phase; i <= 6; i++) {
            delete newResults[`phase${i}` as keyof typeof newResults]
            delete newMetadata[`phase${i}` as keyof typeof newMetadata]
            newErrors[i] = null
            newExecuting[i] = false
          }

          return {
            results: newResults,
            metadata: newMetadata,
            errors: newErrors,
            executing: newExecuting,
            currentPhase: phase - 1,
          }
        }),

      // 선수 조건 체크: 해당 Phase를 실행할 수 있는지 확인
      canExecutePhase: (phaseNumber: number) => {
        const state = get()
        const dependencies = PHASE_DEPENDENCIES[phaseNumber] || []

        // 모든 선수 Phase가 완료되었는지 확인
        const allPrereqsCompleted = dependencies.every(dep => {
          const phaseKey = `phase${dep}` as keyof typeof state.results
          return state.results[phaseKey] !== undefined
        })

        // 이미지 필요 여부 확인
        const requiresImage = PHASES_REQUIRING_IMAGE.includes(phaseNumber)
        const hasImage = !!state.uploadedImage

        return allPrereqsCompleted && (!requiresImage || hasImage)
      },

      // 선수 조건 상세 상태 조회
      getPrerequisiteStatus: (phaseNumber: number): PrerequisiteStatus => {
        const state = get()
        const dependencies = PHASE_DEPENDENCIES[phaseNumber] || []

        const completedPrereqs = dependencies.filter(dep => {
          const phaseKey = `phase${dep}` as keyof typeof state.results
          return state.results[phaseKey] !== undefined
        })

        const missingPrereqs = dependencies.filter(dep => !completedPrereqs.includes(dep))

        const requiresImage = PHASES_REQUIRING_IMAGE.includes(phaseNumber)
        const hasImage = !!state.uploadedImage

        return {
          canExecute: missingPrereqs.length === 0 && (!requiresImage || hasImage),
          completedPrereqs,
          missingPrereqs,
          requiresImage,
          hasImage,
        }
      },
    }),
    {
      name: 'pipeline-storage',
      version: 2, // 버전 업그레이드 (7단계 → 6단계 마이그레이션)
      partialize: state => ({
        sessionId: state.sessionId,
        currentPhase: state.currentPhase,
        uploadedImage: state.uploadedImage,
        uploadedImageName: state.uploadedImageName,
        results: state.results,
        metadata: state.metadata,
        executionCounts: state.executionCounts,
      }),
      // localStorage 마이그레이션: 기존 7단계 데이터를 6단계로 변환
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState?.results) {
          // 기존 phase7 (MasterJSON) 데이터가 있으면 phase6으로 이동
          if (persistedState.results.phase7) {
            persistedState.results.phase6 = persistedState.results.phase7
            delete persistedState.results.phase7
          }
          // 기존 phase6이 confidence 구조(검증 데이터)이면 삭제
          else if (persistedState.results.phase6?.confidence || persistedState.results.phase6?.verification) {
            delete persistedState.results.phase6
          }
          // 메타데이터도 마이그레이션
          if (persistedState.metadata?.phase7) {
            persistedState.metadata.phase6 = persistedState.metadata.phase7
            delete persistedState.metadata.phase7
          }
          // currentPhase가 7이면 6으로 조정
          if (persistedState.currentPhase === 7) {
            persistedState.currentPhase = 6
          }
        }
        return persistedState
      },
    }
  )
)
