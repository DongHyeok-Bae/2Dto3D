/**
 * 분석 데이터 타입 정의
 *
 * DAU, API 호출 수, Phase별 사용 현황 등을 추적합니다.
 */

/**
 * 일별 분석 데이터
 */
export interface DailyAnalytics {
  date: string                    // ISO date: "2024-12-08"

  // 방문자 통계
  visitors: {
    total: number                 // 총 방문 수
    unique: number                // 순 방문자 수 (DAU)
    visitorIds: string[]          // 고유 방문자 ID 목록 (중복 체크용)
  }

  // API 호출 통계
  apiCalls: {
    total: number                 // 총 API 호출 수
    byEndpoint: Record<string, number>  // 엔드포인트별 호출 수
    byPhase: Record<number, number>     // Phase별 파이프라인 호출 수
    errors: number                // 에러 발생 수
    totalResponseTime: number     // 총 응답 시간 (ms) - 평균 계산용
  }

  // 파이프라인 실행 통계
  pipeline: {
    total: number                 // 총 실행 횟수
    successful: number            // 성공 횟수
    failed: number                // 실패 횟수
  }

  // 메타데이터
  updatedAt: string               // 마지막 업데이트 시간
}

/**
 * 분석 요약 데이터 (대시보드용)
 */
export interface AnalyticsSummary {
  avgDau: number                  // 평균 DAU
  totalVisitors: number           // 총 방문자
  totalUniqueVisitors: number     // 총 순 방문자
  totalApiCalls: number           // 총 API 호출
  avgResponseTime: number         // 평균 응답 시간 (ms)
  successRate: number             // 성공률 (%)
  errorRate: number               // 에러율 (%)
}

/**
 * 분석 API 응답
 */
export interface AnalyticsResponse {
  success: boolean
  environment: 'local' | 'vercel'
  data: {
    dateRange: {
      start: string
      end: string
    }
    summary: AnalyticsSummary
    daily: DailyAnalytics[]
  }
}

/**
 * 방문 기록 요청
 */
export interface VisitRequest {
  visitorId: string               // 방문자 고유 ID
  path: string                    // 방문 페이지 경로
  referrer?: string               // 유입 경로
}

/**
 * API 호출 추적 파라미터
 */
export interface ApiCallParams {
  endpoint: string                // API 엔드포인트
  method: string                  // HTTP 메서드
  statusCode: number              // HTTP 상태 코드
  responseTime: number            // 응답 시간 (ms)
  phaseNumber?: number            // 파이프라인 Phase (해당시)
}

/**
 * 차트 데이터 포맷 (Recharts용)
 */
export interface ChartDataPoint {
  date: string                    // X축 레이블
  value: number                   // Y축 값
  [key: string]: string | number  // 추가 데이터
}

/**
 * Phase별 사용 현황 데이터 (파이 차트용)
 */
export interface PhaseUsageData {
  name: string                    // Phase 이름
  value: number                   // 호출 수
  phase: number                   // Phase 번호
}

/**
 * 빈 일별 분석 데이터 생성
 */
export function createEmptyDailyAnalytics(date: string): DailyAnalytics {
  return {
    date,
    visitors: {
      total: 0,
      unique: 0,
      visitorIds: [],
    },
    apiCalls: {
      total: 0,
      byEndpoint: {},
      byPhase: {},
      errors: 0,
      totalResponseTime: 0,
    },
    pipeline: {
      total: 0,
      successful: 0,
      failed: 0,
    },
    updatedAt: new Date().toISOString(),
  }
}

/**
 * 날짜 범위 생성 유틸리티
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 분석 요약 계산
 */
export function calculateSummary(dailyData: DailyAnalytics[]): AnalyticsSummary {
  if (dailyData.length === 0) {
    return {
      avgDau: 0,
      totalVisitors: 0,
      totalUniqueVisitors: 0,
      totalApiCalls: 0,
      avgResponseTime: 0,
      successRate: 0,
      errorRate: 0,
    }
  }

  const totals = dailyData.reduce(
    (acc, day) => ({
      visitors: acc.visitors + day.visitors.total,
      unique: acc.unique + day.visitors.unique,
      apiCalls: acc.apiCalls + day.apiCalls.total,
      responseTime: acc.responseTime + day.apiCalls.totalResponseTime,
      errors: acc.errors + day.apiCalls.errors,
      pipelineTotal: acc.pipelineTotal + day.pipeline.total,
      pipelineSuccess: acc.pipelineSuccess + day.pipeline.successful,
    }),
    {
      visitors: 0,
      unique: 0,
      apiCalls: 0,
      responseTime: 0,
      errors: 0,
      pipelineTotal: 0,
      pipelineSuccess: 0,
    }
  )

  return {
    avgDau: Math.round(totals.unique / dailyData.length),
    totalVisitors: totals.visitors,
    totalUniqueVisitors: totals.unique,
    totalApiCalls: totals.apiCalls,
    avgResponseTime: totals.apiCalls > 0
      ? Math.round(totals.responseTime / totals.apiCalls)
      : 0,
    successRate: totals.pipelineTotal > 0
      ? Math.round((totals.pipelineSuccess / totals.pipelineTotal) * 1000) / 10
      : 0,
    errorRate: totals.apiCalls > 0
      ? Math.round((totals.errors / totals.apiCalls) * 1000) / 10
      : 0,
  }
}
