/**
 * Phase 중앙 설정 파일
 *
 * 모든 Phase 관련 설정을 한 곳에서 관리합니다.
 * Phase가 추가/제거되면 이 파일만 수정하면 전체 시스템에 반영됩니다.
 *
 * 변경 이력:
 * - 2024-12-08: 초기 생성 (7단계 → 6단계 피봇 정리)
 *   - 기존 Phase 6 (Human-in-the-loop Validation) 제거
 *   - 기존 Phase 7 (Master JSON Assembly)가 Phase 6으로 승격
 */

export interface PhaseConfig {
  number: number
  name: string
  description: string
  requiresImage: boolean
}

/**
 * 중앙 Phase 설정
 * - 여기만 수정하면 전체 UI, API, Store에 자동 반영
 */
export const PHASES: PhaseConfig[] = [
  { number: 1, name: 'Normalization', description: '좌표계 설정', requiresImage: true },
  { number: 2, name: 'Structure', description: '구조 추출', requiresImage: true },
  { number: 3, name: 'Openings', description: '개구부 인식', requiresImage: true },
  { number: 4, name: 'Spaces', description: '공간 분석', requiresImage: true },
  { number: 5, name: 'Dimensions', description: '치수 계산', requiresImage: true },
  { number: 6, name: 'Master JSON', description: '최종 BIM JSON 생성', requiresImage: false },
]

// ==================== 편의 상수 및 함수 ====================

/** 총 Phase 개수 */
export const TOTAL_PHASES = PHASES.length

/** 최대 Phase 번호 */
export const MAX_PHASE = Math.max(...PHASES.map(p => p.number))

/** Phase 번호 → 이름 매핑 */
export const PHASE_NAMES: Record<number, string> = Object.fromEntries(
  PHASES.map(p => [p.number, p.name])
)

/** Phase 번호 → 설명 매핑 */
export const PHASE_DESCRIPTIONS: Record<number, string> = Object.fromEntries(
  PHASES.map(p => [p.number, p.description])
)

/**
 * Phase 의존성 (동적 생성)
 * - Phase 1: 의존성 없음 (이미지만 필요)
 * - Phase N: Phase 1 ~ N-1 필요
 */
export const PHASE_DEPENDENCIES: Record<number, number[]> = Object.fromEntries(
  PHASES.map(p => [
    p.number,
    p.number === 1 ? [] : Array.from({ length: p.number - 1 }, (_, i) => i + 1)
  ])
)

/** 이미지가 필요한 Phase 목록 */
export const PHASES_REQUIRING_IMAGE = PHASES.filter(p => p.requiresImage).map(p => p.number)

/** 마지막 Phase (Master JSON 생성) */
export const FINAL_PHASE = PHASES[PHASES.length - 1]

// ==================== 유틸리티 함수 ====================

/**
 * Phase 번호로 Phase 설정 조회
 */
export function getPhase(phaseNumber: number): PhaseConfig | undefined {
  return PHASES.find(p => p.number === phaseNumber)
}

/**
 * Phase 번호가 유효한지 검증
 */
export function isValidPhase(phaseNumber: number): boolean {
  return phaseNumber >= 1 && phaseNumber <= MAX_PHASE
}

/**
 * Phase가 이미지를 필요로 하는지 확인
 */
export function phaseRequiresImage(phaseNumber: number): boolean {
  const phase = getPhase(phaseNumber)
  return phase?.requiresImage ?? true
}
