/**
 * Phase 4: Spaces API
 *
 * 공간 분석 및 분류
 */

import { NextRequest } from 'next/server'
import { analyzeWithGemini } from '@/lib/ai/gemini-client'
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

    // 프롬프트 가져오기
    const { blobs } = await list({ prefix: 'prompts/phase4/' })
    if (blobs.length === 0) {
      throw new PromptNotFoundError(4)
    }
    const latestBlob = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const response = await fetch(latestBlob.url)
    let promptContent = await response.text()

    // 이전 Phase 결과 추가
    if (previousResults) {
      promptContent += `\n\n## 이전 Phase 결과:\n${JSON.stringify(previousResults, null, 2)}`
    }

    // Gemini API 호출
    let result
    try {
      result = await analyzeWithGemini(imageBase64, promptContent, 4)
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // 결과 검증
    const validation = validatePhaseResult(4, result)
    if (!validation.valid) {
      throw new ValidationError('Phase 4 결과 검증 실패', validation.errors)
    }

    // 실행 결과 저장
    const resultUrl = await saveExecutionResult(
      4,
      promptVersion || 'latest',
      validation.data,
      { timestamp: new Date().toISOString() }
    )

    return successResponse({
      success: true,
      phase: 4,
      result: validation.data,
      resultUrl,
      metadata: {
        promptVersion: promptVersion || 'latest',
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
