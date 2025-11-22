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
import { saveExecutionResult } from '@/lib/config/blob-storage'

export async function POST(request: NextRequest) {
  try {
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

    // 프롬프트 가져오기
    const { blobs } = await list({ prefix: 'prompts/phase7/' })
    if (blobs.length === 0) {
      throw new PromptNotFoundError(7)
    }
    const latestBlob = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const response = await fetch(latestBlob.url)
    const promptContent = await response.text()

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

    // 최종 결과 저장
    const resultUrl = await saveExecutionResult(
      7,
      promptVersion || 'latest',
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
        promptVersion: promptVersion || 'latest',
        timestamp: new Date().toISOString(),
        message: '최종 BIM JSON이 생성되었습니다.',
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
