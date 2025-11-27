/**
 * Phase 3: Openings API
 *
 * 개구부 인식 (문, 창문)
 */

// Vercel Serverless Function 타임아웃 설정
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { executePhase3 } from '@/lib/ai/gemini-client'
import { validatePhaseResultSafe } from '@/lib/validation/schemas'
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
    const { imageBase64, promptVersion, previousResults } = body

    if (!imageBase64) {
      throw new ValidationError('이미지가 필요합니다.')
    }

    // 프롬프트 가져오기 (환경 자동 감지)
    const promptData = await getLatestPrompt(3, promptVersion)

    if (!promptData) {
      throw new PromptNotFoundError(3)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // 이전 Phase 결과 검증
    if (!previousResults?.phase1 || !previousResults?.phase2) {
      throw new ValidationError('Phase 1-2 결과가 필요합니다.')
    }

    // Gemini API 호출 (executePhase3 - Phase1-2 결과를 User Message에 포함)
    let result
    try {
      result = await executePhase3({
        prompt: promptContent,
        imageBase64,
        phase1Result: previousResults.phase1,
        phase2Result: previousResults.phase2,
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // Safe Validation: 검증 실패해도 원본 데이터 저장
    const validation = validatePhaseResultSafe(3, result)

    // 실행 결과 저장 (검증 실패해도 저장됨)
    const resultUrl = await saveExecutionResult(
      3,
      actualVersion,
      validation.data, // 원본 또는 검증된 데이터
      {
        timestamp: new Date().toISOString(),
        validated: validation.valid, // 검증 여부 메타데이터
        validationErrors: validation.errors, // 검증 에러 (있으면)
      }
    )

    return successResponse({
      success: true,
      phase: 3,
      result: validation.data,
      resultUrl,
      metadata: {
        promptVersion: actualVersion,
        timestamp: new Date().toISOString(),
        validated: validation.valid, // 검증 여부 표시
        validationWarnings: validation.warning ? validation.errors : undefined,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
