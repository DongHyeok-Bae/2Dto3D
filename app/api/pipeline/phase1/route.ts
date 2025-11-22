/**
 * Phase 1: Normalization API
 *
 * 좌표계 설정 및 정규화
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
    const { imageBase64, promptVersion } = body

    // 입력 검증
    if (!imageBase64) {
      throw new ValidationError('이미지가 필요합니다.')
    }

    // 프롬프트 가져오기
    let promptContent: string

    if (promptVersion) {
      // 특정 버전 프롬프트 사용
      const { blobs } = await list({ prefix: `prompts/phase1/v${promptVersion}` })
      if (blobs.length === 0) {
        throw new PromptNotFoundError(1)
      }
      const response = await fetch(blobs[0].url)
      promptContent = await response.text()
    } else {
      // 활성 프롬프트 사용 (v1.0.0 기본)
      const { blobs } = await list({ prefix: 'prompts/phase1/' })
      if (blobs.length === 0) {
        throw new PromptNotFoundError(1)
      }
      // 가장 최근 프롬프트 사용
      const latestBlob = blobs.sort((a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0]
      const response = await fetch(latestBlob.url)
      promptContent = await response.text()
    }

    // Gemini API 호출
    let result
    try {
      result = await analyzeWithGemini(imageBase64, promptContent, 1)
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // 결과 검증
    const validation = validatePhaseResult(1, result)
    if (!validation.valid) {
      throw new ValidationError('Phase 1 결과 검증 실패', validation.errors)
    }

    // 실행 결과 저장
    const resultUrl = await saveExecutionResult(
      1,
      promptVersion || 'latest',
      validation.data,
      {
        timestamp: new Date().toISOString(),
        imageSize: imageBase64.length,
      }
    )

    return successResponse({
      success: true,
      phase: 1,
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
