/**
 * Phase 6: Confidence API
 *
 * Human-in-the-Loop 검증 및 신뢰도 평가
 */

// Vercel Serverless Function 타임아웃 설정
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { verifyWithGemini } from '@/lib/ai/gemini-client'
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

    if (!previousResults || !previousResults.phase1 || !previousResults.phase2) {
      throw new ValidationError('Phase 1-5 결과가 필요합니다.')
    }

    // 프롬프트 가져오기 (환경 자동 감지)
    const promptData = await getLatestPrompt(6, promptVersion)

    if (!promptData) {
      throw new PromptNotFoundError(6)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // Gemini API 호출 (Phase 1-5 결과 포함)
    let result
    try {
      result = await verifyWithGemini(imageBase64, promptContent, {
        phase1: previousResults.phase1,
        phase2: previousResults.phase2,
        phase3: previousResults.phase3,
        phase4: previousResults.phase4,
        phase5: previousResults.phase5,
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // Safe Validation: 검증 실패해도 원본 데이터 저장
    const validation = validatePhaseResultSafe(6, result)

    // 실행 결과 저장 (검증 실패해도 저장됨)
    const resultUrl = await saveExecutionResult(
      6,
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
      phase: 6,
      result: validation.data,
      resultUrl,
      metadata: {
        promptVersion: actualVersion,
        timestamp: new Date().toISOString(),
        validated: validation.valid, // 검증 여부 표시
        validationWarnings: validation.warning ? validation.errors : undefined,
        requiresUserReview: validation.data?.verification?.overallConfidence < 0.8,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * PUT: 사용자 피드백 제출
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { phase6Result, userFeedback } = body

    if (!phase6Result || !userFeedback) {
      throw new ValidationError('Phase 6 결과와 사용자 피드백이 필요합니다.')
    }

    // 사용자 피드백을 Phase 6 결과에 병합
    const updatedResult = {
      ...phase6Result,
      userFeedback,
    }

    // 업데이트된 결과 저장
    const resultUrl = await saveExecutionResult(
      6,
      'latest',
      updatedResult,
      {
        timestamp: new Date().toISOString(),
        userApproved: userFeedback.approved,
      }
    )

    return successResponse({
      success: true,
      phase: 6,
      result: updatedResult,
      resultUrl,
      message: userFeedback.approved
        ? '사용자 승인이 완료되었습니다.'
        : '수정 사항이 반영되었습니다.',
    })
  } catch (error) {
    return errorResponse(error)
  }
}
