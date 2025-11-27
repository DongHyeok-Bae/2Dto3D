/**
 * Phase 6: Master JSON API (기존 Phase 7 승격)
 *
 * 최종 BIM JSON 생성 - Phase 1-5 결과를 종합하여 3D 렌더링용 데이터 생성
 *
 * 변경 이력:
 * - 기존 Phase 6 (Human-in-the-loop Validation) 제거
 * - 기존 Phase 7 (Master JSON Assembly)가 Phase 6으로 승격
 */

// Vercel Serverless Function 타임아웃 설정
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { executePhase6 } from '@/lib/ai/gemini-client'
import { validatePhaseResult } from '@/lib/validation/schemas'
import { errorResponse, successResponse, ValidationError, GeminiError, PromptNotFoundError } from '@/lib/error/handlers'
import { getLatestPrompt } from '@/lib/config/prompt-manager'
import { saveExecutionResult } from '@/lib/config/result-manager'
import { initializeLocalPrompts } from '@/lib/config/prompt-loader'

export async function POST(request: NextRequest) {
  try {
    // 로컬 프롬프트 자동 로드 (첫 호출 시에만 실행됨)
    await initializeLocalPrompts()

    const body = await request.json()
    const { promptVersion, allResults } = body

    // Phase 1-5 결과 검증 (Phase 6은 더 이상 필요하지 않음)
    if (
      !allResults ||
      !allResults.phase1 ||
      !allResults.phase2 ||
      !allResults.phase3 ||
      !allResults.phase4 ||
      !allResults.phase5
    ) {
      throw new ValidationError('Phase 1-5의 모든 결과가 필요합니다.')
    }

    // 프롬프트 가져오기 (환경 자동 감지)
    const promptData = await getLatestPrompt(6, promptVersion)

    if (!promptData) {
      throw new PromptNotFoundError(6)
    }

    const promptContent = promptData.content
    const actualVersion = promptData.version

    // Gemini API 호출 (executePhase6 - Phase 1-5 결과를 User Message에 포함)
    let result
    try {
      result = await executePhase6({
        prompt: promptContent,
        allResults: {
          phase1: allResults.phase1,
          phase2: allResults.phase2,
          phase3: allResults.phase3,
          phase4: allResults.phase4,
          phase5: allResults.phase5,
        },
      })
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // 결과 검증
    const validation = validatePhaseResult(6, result)
    if (!validation.valid) {
      throw new ValidationError('Phase 6 결과 검증 실패', validation.errors)
    }

    // 최종 결과 저장 (환경 자동 감지)
    const resultUrl = await saveExecutionResult(
      6,
      actualVersion,
      validation.data,
      {
        timestamp: new Date().toISOString(),
        isFinal: true,
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
        isFinal: true,
        message: '최종 BIM JSON이 생성되었습니다.',
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
