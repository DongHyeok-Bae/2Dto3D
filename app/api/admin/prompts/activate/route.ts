import { NextRequest, NextResponse } from 'next/server'
import { setActivePrompt } from '@/lib/config/prompt-manager'
import { getStorageEnvironment } from '@/lib/config/environment'

/**
 * POST /api/admin/prompts/activate
 * 특정 프롬프트 버전을 활성화
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phaseNumber, key, url } = body

    const keyOrUrl = key || url
    if (!phaseNumber || !keyOrUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: phaseNumber, key/url' },
        { status: 400 }
      )
    }

    if (phaseNumber < 1 || phaseNumber > 7) {
      return NextResponse.json(
        { error: 'Phase must be between 1 and 7' },
        { status: 400 }
      )
    }

    // 통합 레이어 사용
    const result = await setActivePrompt(phaseNumber, keyOrUrl)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to activate prompt' },
        { status: 400 }
      )
    }

    console.log('[POST /api/admin/prompts/activate] Activated:', { phaseNumber, keyOrUrl })

    return NextResponse.json({
      success: true,
      environment: getStorageEnvironment(),
      message: `Prompt activated successfully for Phase ${phaseNumber}`,
    })
  } catch (error) {
    console.error('[POST /api/admin/prompts/activate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to activate prompt' },
      { status: 500 }
    )
  }
}
