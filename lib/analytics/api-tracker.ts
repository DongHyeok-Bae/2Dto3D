/**
 * API 호출 추적 유틸리티 (서버 사이드)
 *
 * 파이프라인 API에서 호출하여 API 사용량을 추적합니다.
 * 분석 실패가 본 기능에 영향을 주지 않도록 설계되었습니다.
 */

import { recordApiCall } from './analytics-storage'
import type { ApiCallParams } from '@/types/analytics'

/**
 * API 호출 추적
 *
 * 사용 예시:
 * ```typescript
 * const startTime = Date.now()
 * try {
 *   // API 로직...
 *   trackApiCall({
 *     endpoint: '/api/pipeline/phase1',
 *     method: 'POST',
 *     statusCode: 200,
 *     responseTime: Date.now() - startTime,
 *     phaseNumber: 1,
 *   }).catch(() => {})  // 실패해도 무시
 *   return successResponse(...)
 * } catch (error) {
 *   trackApiCall({...}).catch(() => {})
 *   return errorResponse(error)
 * }
 * ```
 */
export async function trackApiCall(params: ApiCallParams): Promise<void> {
  try {
    await recordApiCall({
      endpoint: params.endpoint,
      method: params.method,
      statusCode: params.statusCode,
      responseTime: params.responseTime,
      phaseNumber: params.phaseNumber,
    })
  } catch (error) {
    // 분석 실패는 조용히 로그만 남김 (본 기능에 영향 X)
    console.error('[api-tracker] Failed to track API call:', error)
    // 에러를 다시 던지지 않음
  }
}

/**
 * 파이프라인 API 추적용 헬퍼
 * Phase 번호를 자동으로 포함합니다.
 */
export function createPipelineTracker(phaseNumber: number) {
  return {
    /**
     * 성공 시 호출
     */
    trackSuccess: (responseTime: number) =>
      trackApiCall({
        endpoint: `/api/pipeline/phase${phaseNumber}`,
        method: 'POST',
        statusCode: 200,
        responseTime,
        phaseNumber,
      }).catch(() => {}),

    /**
     * 실패 시 호출
     */
    trackError: (responseTime: number, statusCode: number = 500) =>
      trackApiCall({
        endpoint: `/api/pipeline/phase${phaseNumber}`,
        method: 'POST',
        statusCode,
        responseTime,
        phaseNumber,
      }).catch(() => {}),
  }
}
