import { NextResponse } from 'next/server'
import { promptStorage, defaultPromptTemplate } from '@/lib/prompt-storage'

// GET /api/admin/prompts/[phase] - 특정 phase의 최신 프롬프트 조회
export async function GET(
  request: Request,
  { params }: { params: { phase: string } }
) {
  try {
    const phaseNumber = parseInt(params.phase.replace('phase', ''), 10)

    // 저장된 프롬프트 찾기
    const latestPrompt = promptStorage.getLatestByPhase(phaseNumber)

    // 저장된 프롬프트가 없으면 기본 템플릿 반환
    if (!latestPrompt) {
      const defaultContent = defaultPromptTemplate.replace(/{phase}/g, phaseNumber.toString())

      return NextResponse.json({
        phaseNumber,
        version: '1.0.0',
        content: defaultContent,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json(latestPrompt)
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}