/**
 * Phase 7: Master JSON API
 *
 * 최종 BIM JSON 생성
 */

import { NextRequest } from 'next/server'
import { generateMasterJSON } from '@/lib/ai/gemini-client'
import { validatePhaseResult } from '@/lib/validation/schemas'
import { errorResponse, successResponse, ValidationError, GeminiError, PromptNotFoundError } from '@/lib/error/handlers'
import { list } from '@vercel/blob'
import { getLatestPrompt } from '@/lib/config/prompt-manager'
import { saveExecutionResult } from '@/lib/config/result-manager'
import { initializeLocalPrompts } from '@/lib/config/prompt-loader'

export async function POST(request: NextRequest) {
  try {
    // 로컬 프롬프트 자동 로드 (첫 호출 시에만 실행됨)
    await initializeLocalPrompts()

    const body = await request.json()
    const { promptVersion, allResults } = body

    // Phase 1-6 결과 검증
    if (
      !allResults ||
      !allResults.phase1 ||
      !allResults.phase2 ||
      !allResults.phase3 ||
      !allResults.phase4 ||
      !allResults.phase5 ||
      !allResults.phase6
    ) {
      throw new ValidationError('Phase 1-6의 모든 결과가 필요합니다.')
    }

    // 프롬프트 가져오기 (환경 자동 감지)
    const promptData = await getLatestPrompt(7, promptVersion)

    if (!promptData) {
      throw new PromptNotFoundError(7)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // Gemini API 호출 (Phase 1-6 결과 종합)
    let result
    try {
      result = await generateMasterJSON(promptContent, {
        phase1: allResults.phase1,
        phase2: allResults.phase2,
        phase3: allResults.phase3,
        phase4: allResults.phase4,
        phase5: allResults.phase5,
        phase6: allResults.phase6,
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // 결과 검증
    const validation = validatePhaseResult(7, result)
    if (!validation.valid) {
      throw new ValidationError('Phase 7 결과 검증 실패', validation.errors)
    }

    // 최종 결과 저장 (환경 자동 감지)
    const resultUrl = await saveExecutionResult(
      7,
      actualVersion,
      validation.data,
      {
        timestamp: new Date().toISOString(),
        isFinal: true,
      }
    )

    return successResponse({
      success: true,
      phase: 7,
      result: validation.data,
      resultUrl,
      metadata: {
        promptVersion: actualVersion,
        timestamp: new Date().toISOString(),
        message: '최종 BIM JSON이 생성되었습니다.',
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
