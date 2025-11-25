import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Phase1Result,
  Phase2Result,
  Phase3Result,
  Phase4Result,
  Phase5Result,
  Phase6Result,
  MasterJSON,
} from '@/types'

// Phase 결과 메타데이터 인터페이스
export interface PhaseMetadata {
  validated?: boolean // 검증 성공 여부
  validationErrors?: string[] // 검증 에러 (있으면)
  timestamp: string // 저장 시각
  promptVersion?: string // 프롬프트 버전
  [key: string]: any // 추가 메타데이터
}

interface PipelineState {
  // 현재 상태
  currentPhase: number
  uploadedImage: string | null
  uploadedImageName: string | null

  // 각 Phase 결과
  results: {
    phase1?: Phase1Result
    phase2?: Phase2Result
    phase3?: Phase3Result
    phase4?: Phase4Result
    phase5?: Phase5Result
    phase6?: Phase6Result
    phase7?: MasterJSON
  }

  // 각 Phase 메타데이터
  metadata: {
    phase1?: PhaseMetadata
    phase2?: PhaseMetadata
    phase3?: PhaseMetadata
    phase4?: PhaseMetadata
    phase5?: PhaseMetadata
    phase6?: PhaseMetadata
    phase7?: PhaseMetadata
  }

  // 실행 상태
  executing: Record<number, boolean>
  errors: Record<number, string | null>

  // 액션
  setCurrentPhase: (phase: number) => void
  setUploadedImage: (image: string, filename?: string) => void
  setPhaseResult: (phase: number, result: any, metadata?: PhaseMetadata) => void
  setExecuting: (phase: number, executing: boolean) => void
  setError: (phase: number, error: string | null) => void
  reset: () => void
  resetFromPhase: (phase: number) => void
}

const initialState = {
  currentPhase: 0,
  uploadedImage: null,
  uploadedImageName: null,
  results: {},
  metadata: {},
  executing: {},
  errors: {},
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    set => ({
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
          currentPhase: phase < 7 ? phase + 1 : phase,
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

      reset: () => set(initialState),

      resetFromPhase: phase =>
        set(state => {
          const newResults = { ...state.results }
          const newMetadata = { ...state.metadata }

          // phase부터 이후 결과 모두 삭제
          for (let i = phase; i <= 7; i++) {
            delete newResults[`phase${i}` as keyof typeof newResults]
            delete newMetadata[`phase${i}` as keyof typeof newMetadata]
          }

          return {
            results: newResults,
            metadata: newMetadata,
            currentPhase: phase - 1,
          }
        }),
    }),
    {
      name: 'pipeline-storage',
      partialize: state => ({
        currentPhase: state.currentPhase,
        uploadedImage: state.uploadedImage,
        uploadedImageName: state.uploadedImageName,
        results: state.results,
        metadata: state.metadata,
      }),
    }
  )
)
