/**
 * Phase 6: Confidence API
 *
 * Human-in-the-Loop 검증 및 신뢰도 평가
 */

import { NextRequest } from 'next/server'
import { verifyWithGemini } from '@/lib/ai/gemini-client'
import { validatePhaseResult } from '@/lib/validation/schemas'
import { errorResponse, successResponse, ValidationError, GeminiError, PromptNotFoundError } from '@/lib/error/handlers'
import { list } from '@vercel/blob'
import { saveExecutionResult } from '@/lib/config/blob-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, promptVersion, previousResults } = body

    if (!imageBase64) {
      throw new ValidationError('이미지가 필요합니다.')
    }

    if (!previousResults || !previousResults.phase1 || !previousResults.phase2) {
      throw new ValidationError('Phase 1-5 결과가 필요합니다.')
    }

    // 프롬프트 가져오기
    const { blobs } = await list({ prefix: 'prompts/phase6/' })
    if (blobs.length === 0) {
      throw new PromptNotFoundError(6)
    }
    const latestBlob = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const response = await fetch(latestBlob.url)
    const promptContent = await response.text()

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

    // 결과 검증
    const validation = validatePhaseResult(6, result)
    if (!validation.valid) {
      throw new ValidationError('Phase 6 결과 검증 실패', validation.errors)
    }

    // 실행 결과 저장
    const resultUrl = await saveExecutionResult(
      6,
      promptVersion || 'latest',
      validation.data,
      { timestamp: new Date().toISOString() }
    )

    return successResponse({
      success: true,
      phase: 6,
      result: validation.data,
      resultUrl,
      metadata: {
        promptVersion: promptVersion || 'latest',
        timestamp: new Date().toISOString(),
        requiresUserReview: validation.data.verification.overallConfidence < 0.8,
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
