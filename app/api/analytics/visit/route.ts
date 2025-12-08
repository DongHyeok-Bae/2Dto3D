/**
 * POST /api/analytics/visit
 *
 * 방문 기록 저장 API
 * 클라이언트에서 페이지 방문 시 호출됩니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { recordVisit } from '@/lib/analytics/analytics-storage'
import { getStorageEnvironment } from '@/lib/config/environment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, path } = body

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId is required' },
        { status: 400 }
      )
    }

    // 방문 기록 저장
    const result = await recordVisit(visitorId, path || '/')

    return NextResponse.json({
      success: true,
      environment: getStorageEnvironment(),
      isNewVisitor: result.isNewVisitor,
    })
  } catch (error) {
    console.error('[POST /api/analytics/visit]', error)
    return NextResponse.json(
      { error: 'Failed to record visit' },
      { status: 500 }
    )
  }
}
