import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { promptStorage, defaultPromptTemplate } from '@/lib/prompt-storage'
import { listPrompts, savePrompt, deletePrompt, updatePromptVersion, getActivePrompt } from '@/lib/config/prompt-manager'
import { getStorageEnvironment } from '@/lib/config/environment'

/**
 * GET /api/admin/prompts?phase=1
 * 특정 Phase의 모든 프롬프트 버전 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phase = searchParams.get('phase')

    if (!phase) {
      return NextResponse.json(
        { error: 'Phase number is required' },
        { status: 400 }
      )
    }

    const phaseNumber = parseInt(phase, 10)

    if (phaseNumber < 1 || phaseNumber > 7) {
      return NextResponse.json(
        { error: 'Phase must be between 1 and 7' },
        { status: 400 }
      )
    }

    // 통합 레이어 사용 (환경 자동 감지)
    const versions = await listPrompts(phaseNumber)

    // 버전이 없으면 기본 템플릿 반환
    if (versions.length === 0) {
      const defaultContent = defaultPromptTemplate.replace(/{phase}/g, phaseNumber.toString())
      return NextResponse.json({
        success: true,
        phase: phaseNumber,
        environment: getStorageEnvironment(),
        versions: [{
          id: 'default',
          version: '1.0.0',
          content: defaultContent,
          phaseNumber,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })
    }

    return NextResponse.json({
      success: true,
      phase: phaseNumber,
      environment: getStorageEnvironment(),
      versions,
    })
  } catch (error) {
    console.error('[GET /api/admin/prompts]', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt versions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/prompts
 * 새로운 프롬프트 버전 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phaseNumber, version, content, isActive } = body

    console.log('[POST /api/admin/prompts] Request body:', { phaseNumber, version, contentLength: content?.length, isActive })

    if (!phaseNumber || !version || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: phaseNumber, version, content' },
        { status: 400 }
      )
    }

    if (phaseNumber < 1 || phaseNumber > 7) {
      return NextResponse.json(
        { error: 'Phase must be between 1 and 7' },
        { status: 400 }
      )
    }

    const id = uuidv4()
    const now = new Date().toISOString()

    // 통합 레이어 사용 (환경 자동 감지)
    const result = await savePrompt(phaseNumber, version, content, {
      id,
      isActive: isActive || false,
      createdAt: now,
      updatedAt: now,
    })

    console.log('[POST /api/admin/prompts] Prompt saved successfully:', result)

    return NextResponse.json({
      success: true,
      environment: getStorageEnvironment(),
      prompt: {
        id,
        key: result.key,      // 로컬: key 반환
        url: result.url,      // Vercel: url 반환
        phaseNumber,
        version,
        isActive,
        createdAt: now,
        updatedAt: now,
      },
    })
  } catch (error) {
    console.error('[POST /api/admin/prompts] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt version' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/prompts?key=... (로컬) 또는 ?url=... (Vercel)
 * 프롬프트 버전 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyOrUrl = searchParams.get('key') || searchParams.get('url')

    if (!keyOrUrl) {
      return NextResponse.json(
        { error: 'Prompt key or url is required' },
        { status: 400 }
      )
    }

    // 통합 레이어 사용 (환경 자동 감지)
    const deleted = await deletePrompt(keyOrUrl)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    console.log('[DELETE /api/admin/prompts] Prompt deleted:', keyOrUrl)

    return NextResponse.json({
      success: true,
      environment: getStorageEnvironment(),
      message: 'Prompt deleted successfully',
    })
  } catch (error) {
    console.error('[DELETE /api/admin/prompts] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/prompts
 * 프롬프트 버전 번호 수정
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { phaseNumber, key, url, newVersion } = body

    const keyOrUrl = key || url
    if (!keyOrUrl || !newVersion || !phaseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: phaseNumber, key/url, newVersion' },
        { status: 400 }
      )
    }

    // 버전 형식 검증 (semver)
    const semverRegex = /^\d+\.\d+\.\d+$/
    if (!semverRegex.test(newVersion)) {
      return NextResponse.json(
        { error: 'Invalid version format. Use semver (e.g., 1.0.0)' },
        { status: 400 }
      )
    }

    // 통합 레이어 사용
    const result = await updatePromptVersion(phaseNumber, keyOrUrl, newVersion)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update version' },
        { status: 400 }
      )
    }

    console.log('[PATCH /api/admin/prompts] Version updated:', { from: keyOrUrl, newVersion })

    return NextResponse.json({
      success: true,
      environment: getStorageEnvironment(),
      newKey: result.newKey,
      newUrl: result.newUrl,
    })
  } catch (error) {
    console.error('[PATCH /api/admin/prompts] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt version' },
      { status: 500 }
    )
  }
}
