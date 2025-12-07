/**
 * Phase 4: Spaces API
 *
 * 공간 분석 및 분류
 */

// Vercel Serverless Function 타임아웃 설정
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { executePhase4 } from '@/lib/ai/gemini-client'
import { validatePhaseResultSafe } from '@/lib/validation/schemas'
import { errorResponse, successResponse, ValidationError, GeminiError, PromptNotFoundError } from '@/lib/error/handlers'
import { list } from '@vercel/blob'
import { getLatestPrompt, getActivePrompt } from '@/lib/config/prompt-manager'
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
    // 특정 버전이 지정되면 해당 버전, 아니면 활성 프롬프트 사용
    let promptData
    if (promptVersion && promptVersion !== 'latest') {
      promptData = await getLatestPrompt(4, promptVersion)
    } else {
      const activePrompt = await getActivePrompt(4)
      promptData = activePrompt ? { content: activePrompt.content, version: activePrompt.version } : null
    }

    if (!promptData) {
      throw new PromptNotFoundError(4)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // 이전 Phase 결과 검증
    if (!previousResults || !previousResults.phase1 || !previousResults.phase2 || !previousResults.phase3) {
      throw new ValidationError('Phase 1-3 결과가 필요합니다.')
    }

    // Gemini API 호출 (executePhase4 - Phase1-3 결과를 User Message에 포함)
    let result
    try {
      result = await executePhase4({
        prompt: promptContent,
        imageBase64,
        previousResults: {
          phase1: previousResults.phase1,
          phase2: previousResults.phase2,
          phase3: previousResults.phase3,
        },
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // Safe Validation: 검증 실패해도 원본 데이터 저장
    const validation = validatePhaseResultSafe(4, result)

    // 실행 결과 저장 (검증 실패해도 저장됨)
    const resultUrl = await saveExecutionResult(
      4,
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
      phase: 4,
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
