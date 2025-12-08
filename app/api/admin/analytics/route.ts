/**
 * GET /api/admin/analytics
 *
 * 분석 데이터 조회 API
 * 관리자 대시보드에서 사용합니다.
 *
 * Query Parameters:
 * - range: 조회 기간 (7d, 14d, 30d) - 기본값 7d
 * - startDate, endDate: 커스텀 날짜 범위 (YYYY-MM-DD)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsRange, cleanupOldAnalytics } from '@/lib/analytics/analytics-storage'
import { getStorageEnvironment } from '@/lib/config/environment'
import { calculateSummary } from '@/types/analytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')

    // 날짜 범위 계산
    let startDate: Date
    let endDate = new Date()

    if (customStart && customEnd) {
      // 커스텀 날짜 범위
      startDate = new Date(customStart)
      endDate = new Date(customEnd)
    } else {
      // range 파라미터 파싱 (예: "7d", "14d", "30d")
      const days = parseInt(range.replace('d', ''), 10) || 7
      startDate = new Date()
      startDate.setDate(endDate.getDate() - days + 1)
    }

    // 데이터 조회
    const dailyData = await getAnalyticsRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    // 요약 계산
    const summary = calculateSummary(dailyData)

    // 30일 이전 데이터 정리 (백그라운드)
    cleanupOldAnalytics().catch(err =>
      console.error('[analytics cleanup]', err)
    )

    return NextResponse.json({
      success: true,
      environment: getStorageEnvironment(),
      data: {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
        summary,
        daily: dailyData,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/analytics]', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
