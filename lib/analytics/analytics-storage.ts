/**
 * 분석 데이터 Blob Storage 유틸리티
 *
 * 기존 blob-storage.ts 패턴을 따릅니다.
 * - 로컬: Map 메모리 저장소
 * - Vercel: Blob Storage
 */

import { put, list, del } from '@vercel/blob'
import { getStorageEnvironment } from '@/lib/config/environment'
import {
  DailyAnalytics,
  createEmptyDailyAnalytics,
  getDateRange,
} from '@/types/analytics'

// 메모리 저장소 (로컬 환경용) - HMR에서도 유지되도록 global 사용
const globalForAnalytics = globalThis as unknown as {
  analyticsStore: Map<string, DailyAnalytics> | undefined
}

if (!globalForAnalytics.analyticsStore) {
  globalForAnalytics.analyticsStore = new Map<string, DailyAnalytics>()
}

const memoryStore = globalForAnalytics.analyticsStore

// 데이터 보관 기간 (일)
const RETENTION_DAYS = 30

/**
 * 일별 분석 데이터 조회 또는 생성
 */
export async function getDailyAnalytics(date: string): Promise<DailyAnalytics> {
  const env = getStorageEnvironment()

  if (env === 'local') {
    const existing = memoryStore.get(date)
    if (existing) {
      return existing
    }
    const empty = createEmptyDailyAnalytics(date)
    memoryStore.set(date, empty)
    return empty
  }

  // Vercel: Blob에서 조회
  const path = `analytics/daily/${date}.json`
  try {
    const { blobs } = await list({ prefix: path })
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.error('[analytics-storage] Failed to get daily analytics:', error)
  }

  return createEmptyDailyAnalytics(date)
}

/**
 * 일별 분석 데이터 저장
 */
export async function saveDailyAnalytics(data: DailyAnalytics): Promise<void> {
  const env = getStorageEnvironment()

  // 업데이트 시간 갱신
  data.updatedAt = new Date().toISOString()

  if (env === 'local') {
    memoryStore.set(data.date, data)
    return
  }

  // Vercel: Blob에 저장
  const path = `analytics/daily/${data.date}.json`
  try {
    await put(path, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    })
  } catch (error) {
    console.error('[analytics-storage] Failed to save daily analytics:', error)
    throw error
  }
}

/**
 * 기간별 분석 데이터 조회
 */
export async function getAnalyticsRange(
  startDate: string,
  endDate: string
): Promise<DailyAnalytics[]> {
  const dates = getDateRange(startDate, endDate)
  const results: DailyAnalytics[] = []

  // 병렬로 조회하여 성능 향상
  const promises = dates.map(date => getDailyAnalytics(date))
  const data = await Promise.all(promises)

  for (const item of data) {
    results.push(item)
  }

  return results
}

/**
 * 30일 이전 데이터 삭제 (cleanup)
 */
export async function cleanupOldAnalytics(): Promise<number> {
  const env = getStorageEnvironment()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)
  const cutoff = cutoffDate.toISOString().split('T')[0]

  if (env === 'local') {
    let deleted = 0
    for (const [date] of memoryStore) {
      if (date < cutoff) {
        memoryStore.delete(date)
        deleted++
      }
    }
    return deleted
  }

  // Vercel: Blob에서 삭제
  try {
    const { blobs } = await list({ prefix: 'analytics/daily/' })
    let deleted = 0

    for (const blob of blobs) {
      const match = blob.pathname.match(/(\d{4}-\d{2}-\d{2})\.json/)
      if (match && match[1] < cutoff) {
        await del(blob.url)
        deleted++
      }
    }

    console.log(`[analytics-storage] Cleaned up ${deleted} old analytics files`)
    return deleted
  } catch (error) {
    console.error('[analytics-storage] Failed to cleanup old analytics:', error)
    return 0
  }
}

/**
 * 방문자 기록 추가 (DAU 계산용)
 */
export async function recordVisit(
  visitorId: string,
  _path: string
): Promise<{ isNewVisitor: boolean }> {
  const today = new Date().toISOString().split('T')[0]
  const data = await getDailyAnalytics(today)

  // 총 방문 수 증가
  data.visitors.total++

  // 순 방문자 체크 (오늘 처음 방문한 경우)
  const isNewVisitor = !data.visitors.visitorIds.includes(visitorId)
  if (isNewVisitor) {
    data.visitors.visitorIds.push(visitorId)
    data.visitors.unique++
  }

  await saveDailyAnalytics(data)

  return { isNewVisitor }
}

/**
 * API 호출 기록 추가
 */
export async function recordApiCall(params: {
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  phaseNumber?: number
}): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const data = await getDailyAnalytics(today)

  // API 호출 통계 업데이트
  data.apiCalls.total++
  data.apiCalls.byEndpoint[params.endpoint] =
    (data.apiCalls.byEndpoint[params.endpoint] || 0) + 1

  // Phase별 통계 (파이프라인 API인 경우)
  if (params.phaseNumber) {
    data.apiCalls.byPhase[params.phaseNumber] =
      (data.apiCalls.byPhase[params.phaseNumber] || 0) + 1

    // 파이프라인 실행 통계
    data.pipeline.total++
    if (params.statusCode < 400) {
      data.pipeline.successful++
    } else {
      data.pipeline.failed++
    }
  }

  // 응답 시간 누적 (평균 계산용)
  data.apiCalls.totalResponseTime += params.responseTime

  // 에러 카운트
  if (params.statusCode >= 400) {
    data.apiCalls.errors++
  }

  await saveDailyAnalytics(data)
}

/**
 * 저장소 통계 조회 (디버깅용)
 */
export function getStorageStats() {
  const env = getStorageEnvironment()

  if (env === 'local') {
    return {
      environment: env,
      totalDays: memoryStore.size,
      dates: Array.from(memoryStore.keys()).sort(),
    }
  }

  return {
    environment: env,
    totalDays: 'unknown (check Blob Storage)',
    dates: [],
  }
}
