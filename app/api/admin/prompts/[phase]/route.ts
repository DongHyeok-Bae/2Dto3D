import { NextResponse } from 'next/server'
import { promptStorage, defaultPromptTemplate } from '@/lib/prompt-storage'
import { getLatestPrompt } from '@/lib/config/prompt-manager'
import { getStorageEnvironment } from '@/lib/config/environment'

// GET /api/admin/prompts/[phase] - 특정 phase의 최신 프롬프트 조회
export async function GET(
  request: Request,
  { params }: { params: { phase: string } }
) {
  try {
    const phaseNumber = parseInt(params.phase.replace('phase', ''), 10)

    // 통합 레이어 사용 (환경 자동 감지)
    const latestPrompt = await getLatestPrompt(phaseNumber)

    // 저장된 프롬프트가 없으면 기본 템플릿 반환
    if (!latestPrompt) {
      const defaultContent = defaultPromptTemplate.replace(/{phase}/g, phaseNumber.toString())

      return NextResponse.json({
        phaseNumber,
        version: '1.0.0',
        content: defaultContent,
        isActive: true,
        environment: getStorageEnvironment(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      phaseNumber,
      version: latestPrompt.version,
      content: latestPrompt.content,
      isActive: true,
      environment: getStorageEnvironment(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}
