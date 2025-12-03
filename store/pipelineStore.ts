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

// Phase 결과 메타데이터 인터페이스
export interface PhaseMetadata {
  validated?: boolean // 검증 성공 여부
  validationErrors?: string[] // 검증 에러 (있으면)
  timestamp: string // 저장 시각
  promptVersion?: string // 프롬프트 버전
  [key: string]: any // 추가 메타데이터
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

          // phase부터 이후 결과 모두 삭제 (6단계 파이프라인)
          for (let i = phase; i <= 6; i++) {
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
      version: 2, // 버전 업그레이드 (7단계 → 6단계 마이그레이션)
      partialize: state => ({
        sessionId: state.sessionId,
        currentPhase: state.currentPhase,
        uploadedImage: state.uploadedImage,
        uploadedImageName: state.uploadedImageName,
        results: state.results,
        metadata: state.metadata,
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
