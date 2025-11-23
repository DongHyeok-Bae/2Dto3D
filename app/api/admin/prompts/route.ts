import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { promptStorage, defaultPromptTemplate } from '@/lib/prompt-storage'

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

    const versions = promptStorage.getByPhase(phaseNumber)

    // 버전이 없으면 기본 템플릿 반환
    if (versions.length === 0) {
      const defaultContent = defaultPromptTemplate.replace(/{phase}/g, phaseNumber.toString())
      return NextResponse.json({
        success: true,
        phase: phaseNumber,
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

    const key = promptStorage.save(phaseNumber, version, content, {
      id,
      version,
      phaseNumber,
      isActive: isActive || false,
      createdAt: now,
      updatedAt: now,
    })

    console.log('[POST /api/admin/prompts] Prompt saved successfully:', key)

    return NextResponse.json({
      success: true,
      prompt: {
        id,
        key, // URL 대신 key 반환
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
 * DELETE /api/admin/prompts?key=...
 * 프롬프트 버전 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Prompt key is required' },
        { status: 400 }
      )
    }

    const deleted = promptStorage.delete(key)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    console.log('[DELETE /api/admin/prompts] Prompt deleted:', key)

    return NextResponse.json({
      success: true,
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
