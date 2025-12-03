/**
 * Phase 2: Structure API
 *
 * 구조 요소 추출 (벽, 기둥)
 */

// Vercel Serverless Function 타임아웃 설정
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { executePhase2 } from '@/lib/ai/gemini-client'
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
    const promptData = await getLatestPrompt(2, promptVersion)

    if (!promptData) {
      throw new PromptNotFoundError(2)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // Phase 1 결과 검증
    if (!previousResults?.phase1) {
      throw new ValidationError('Phase 1 결과가 필요합니다.')
    }

    // Gemini API 호출 (executePhase2 - Phase1 결과를 User Message에 포함)
    let result
    try {
      result = await executePhase2({
        prompt: promptContent,
        imageBase64,
        phase1Result: previousResults.phase1,
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // Safe Validation: 검증 실패해도 원본 데이터 저장
    const validation = validatePhaseResultSafe(2, result)

    // 실행 결과 저장 (검증 실패해도 저장됨)
    const resultUrl = await saveExecutionResult(
      2,
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
      phase: 2,
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
