import { NextResponse } from 'next/server'
import { clearSessionResults } from '@/lib/config/blob-storage'
import { getStorageEnvironment } from '@/lib/config/environment'

/**
 * 특정 세션의 Blob Storage 결과물 삭제 API
 */
export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const env = getStorageEnvironment()

    if (env === 'vercel') {
      const deleted = await clearSessionResults(sessionId)
      return NextResponse.json({
        success: true,
        message: `Cleared ${deleted} files from session ${sessionId}`,
        deleted,
        environment: env,
      })
    }

    // 로컬 환경에서는 Blob Storage가 없으므로 성공 반환
    return NextResponse.json({
      success: true,
      message: 'Local environment - no blob storage to clear',
      deleted: 0,
      environment: env,
    })
  } catch (error) {
    console.error('[API] Failed to clear session:', error)
    return NextResponse.json(
      { error: 'Failed to clear session storage' },
      { status: 500 }
    )
  }
}
