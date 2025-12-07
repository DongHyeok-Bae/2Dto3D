import { NextResponse } from 'next/server'
import { defaultPromptTemplate } from '@/lib/prompt-storage'
import { getActivePrompt } from '@/lib/config/prompt-manager'
import { getStorageEnvironment } from '@/lib/config/environment'

// GET /api/admin/prompts/[phase] - 특정 phase의 활성 프롬프트 조회
export async function GET(
  request: Request,
  { params }: { params: { phase: string } }
) {
  try {
    const phaseNumber = parseInt(params.phase.replace('phase', ''), 10)

    // 활성 프롬프트 조회 (없으면 최신 버전 fallback)
    const activePrompt = await getActivePrompt(phaseNumber)

    // 저장된 프롬프트가 없으면 기본 템플릿 반환
    if (!activePrompt) {
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
      version: activePrompt.version,
      content: activePrompt.content,
      isActive: activePrompt.isActive,
      environment: getStorageEnvironment(),
      createdAt: activePrompt.createdAt,
      updatedAt: activePrompt.updatedAt
    })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}
