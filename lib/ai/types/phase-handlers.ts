/**
 * Phase Handler Types
 *
 * 각 Phase 핸들러의 입력/출력 타입 정의
 * Clean Architecture: 명시적 의존성 선언
 */

import type {
  Phase1Result,
  Phase2Result,
  Phase3Result,
  Phase4Result,
  Phase5Result,
  MasterJSON,
} from '@/types'

// ============================================================================
// Phase 번호 타입 (6단계 파이프라인)
// ============================================================================
export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6

// ============================================================================
// Phase 결과 타입 맵
// ============================================================================
export type PhaseResultMap = {
  1: Phase1Result
  2: Phase2Result
  3: Phase3Result
  4: Phase4Result
  5: Phase5Result
  6: MasterJSON // Phase 6 = Master JSON Assembly (기존 Phase 7)
}

// ============================================================================
// 기본 입력 타입
// ============================================================================
export interface BasePhaseInput {
  /** 시스템 프롬프트 (prompts/phaseN.md 파일 내용) */
  prompt: string
}

export interface ImagePhaseInput extends BasePhaseInput {
  /** Base64 인코딩된 이미지 (data:image/png;base64,... 형식) */
  imageBase64: string
}

// ============================================================================
// Phase별 입력 타입 - 명시적 의존성 선언
// ============================================================================

/** Phase 1: 좌표계 정규화 - 의존성 없음 */
export interface Phase1Input extends ImagePhaseInput {}

/** Phase 2: 구조 요소 추출 - Phase 1 의존 */
export interface Phase2Input extends ImagePhaseInput {
  phase1Result: Phase1Result
}

/** Phase 3: 개구부 인식 - Phase 1-2 의존 */
export interface Phase3Input extends ImagePhaseInput {
  phase1Result: Phase1Result
  phase2Result: Phase2Result
}

/** Phase 4: 공간 분석 - Phase 1-3 의존 */
export interface Phase4Input extends ImagePhaseInput {
  previousResults: {
    phase1: Phase1Result
    phase2: Phase2Result
    phase3: Phase3Result
  }
}

/** Phase 5: 치수 계산 - Phase 1-4 의존 */
export interface Phase5Input extends ImagePhaseInput {
  previousResults: {
    phase1: Phase1Result
    phase2: Phase2Result
    phase3: Phase3Result
    phase4: Phase4Result
  }
}

/** Phase 6: Master JSON 생성 - 이미지 없음, Phase 1-5 의존 (기존 Phase 7) */
export interface Phase6Input extends BasePhaseInput {
  allResults: {
    phase1: Phase1Result
    phase2: Phase2Result
    phase3: Phase3Result
    phase4: Phase4Result
    phase5: Phase5Result
  }
}

// ============================================================================
// 로깅용 컨텍스트 정보 타입
// ============================================================================
export interface AIContextInfo {
  /** User Message에 포함된 Phase 결과 번호 배열 (예: [1, 2, 3]) */
  userMessagePhases: number[]
  /** 이미지 포함 여부 */
  hasImage: boolean
}

// 참고: System Instruction에는 순수 프롬프트만 포함됨
// 모든 Phase 결과 데이터는 User Message에 포함
