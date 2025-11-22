/**
 * Phase 3: Openings API
 *
 * 개구부 인식 (문, 창문)
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
    const { imageBase64, promptVersion, phase1Result, phase2Result } = body

    if (!imageBase64) {
      throw new ValidationError('이미지가 필요합니다.')
    }

    // 프롬프트 가져오기
    const { blobs } = await list({ prefix: 'prompts/phase3/' })
    if (blobs.length === 0) {
      throw new PromptNotFoundError(3)
    }
    const latestBlob = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const response = await fetch(latestBlob.url)
    let promptContent = await response.text()

    // 이전 Phase 결과 추가
    if (phase1Result || phase2Result) {
      promptContent += `\n\n## 이전 Phase 결과:\n`
      if (phase1Result) promptContent += `### Phase 1:\n${JSON.stringify(phase1Result, null, 2)}\n`
      if (phase2Result) promptContent += `### Phase 2:\n${JSON.stringify(phase2Result, null, 2)}\n`
    }

    // Gemini API 호출
    let result
    try {
      result = await analyzeWithGemini(imageBase64, promptContent, 3)
    } catch (error) {
      throw new GeminiError(error instanceof Error ? error.message : 'Gemini API 호출 실패')
    }

    // 결과 검증
    const validation = validatePhaseResult(3, result)
    if (!validation.valid) {
      throw new ValidationError('Phase 3 결과 검증 실패', validation.errors)
    }

    // 실행 결과 저장
    const resultUrl = await saveExecutionResult(
      3,
      promptVersion || 'latest',
      validation.data,
      { timestamp: new Date().toISOString() }
    )

    return successResponse({
      success: true,
      phase: 3,
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
