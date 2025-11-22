import { NextRequest, NextResponse } from 'next/server'
import { listPromptVersions, uploadPrompt, deletePrompt } from '@/lib/config/blob-storage'
import { v4 as uuidv4 } from 'uuid'

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

    const versions = await listPromptVersions(phaseNumber)

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

    const url = await uploadPrompt(phaseNumber, version, content, {
      id,
      version,
      phaseNumber,
      isActive: isActive || false,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      success: true,
      prompt: {
        id,
        url,
        phaseNumber,
        version,
        isActive,
        createdAt: now,
        updatedAt: now,
      },
    })
  } catch (error) {
    console.error('[POST /api/admin/prompts]', error)
    return NextResponse.json(
      { error: 'Failed to create prompt version' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/prompts?url=...
 * 프롬프트 버전 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'Prompt URL is required' },
        { status: 400 }
      )
    }

    await deletePrompt(url)

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    })
  } catch (error) {
    console.error('[DELETE /api/admin/prompts]', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
