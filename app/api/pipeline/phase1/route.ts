/**
 * Phase 1: Normalization API
 *
 * 좌표계 설정 및 정규화
 */

// Vercel Serverless Function 타임아웃 설정
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { executePhase1 } from '@/lib/ai/gemini-client'
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
    const { imageBase64, promptVersion } = body

    // 입력 검증
    if (!imageBase64) {
      throw new ValidationError('이미지가 필요합니다.')
    }

    // 프롬프트 가져오기 (환경 자동 감지)
    const promptData = await getLatestPrompt(1, promptVersion)

    if (!promptData) {
      throw new PromptNotFoundError(1)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // Gemini API 호출 (executePhase1 사용)
    let result
    try {
      result = await executePhase1({
        prompt: promptContent,
        imageBase64,
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // Safe Validation: 검증 실패해도 원본 데이터 저장
    const validation = validatePhaseResultSafe(1, result)

    // 실행 결과 저장 (검증 실패해도 저장됨)
    const resultUrl = await saveExecutionResult(
      1,
      actualVersion,
      validation.data, // 원본 또는 검증된 데이터
      {
        timestamp: new Date().toISOString(),
        imageSize: imageBase64.length,
        validated: validation.valid, // 검증 여부 메타데이터
        validationErrors: validation.errors, // 검증 에러 (있으면)
      }
    )

    return successResponse({
      success: true,
      phase: 1,
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
