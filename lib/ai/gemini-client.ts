/**
 * Google Gemini API Client
 *
 * Phase 1-7 파이프라인에서 사용되는 Gemini AI 호출 유틸리티
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini API 인스턴스
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

/**
 * Gemini 1.5 Pro 모델로 이미지 + 프롬프트 분석
 *
 * @param imageBase64 - Base64 인코딩된 이미지 (data:image/png;base64,... 형식)
 * @param prompt - Phase별 프롬프트 내용
 * @param phaseNumber - Phase 번호 (1-7)
 * @returns JSON 형태의 분석 결과
 */
export async function analyzeWithGemini(
  imageBase64: string,
  prompt: string,
  phaseNumber: number
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Base64에서 MIME 타입과 데이터 분리
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    // Gemini API 호출
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      prompt,
    ])

    const response = await result.response
    const text = response.text()

    // JSON 추출 (```json ... ``` 형식 처리)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    // 순수 JSON 응답 처리
    return JSON.parse(text)
  } catch (error) {
    console.error(`[Phase ${phaseNumber}] Gemini API Error:`, error)
    throw new Error(`Gemini API 호출 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Phase 6: Human-in-the-Loop 검증
 * 이전 Phase들의 결과를 종합하여 최종 검증 프롬프트 생성
 */
export async function verifyWithGemini(
  imageBase64: string,
  prompt: string,
  previousResults: {
    phase1?: any
    phase2?: any
    phase3?: any
    phase4?: any
    phase5?: any
  }
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    // 이전 결과를 프롬프트에 포함
    const fullPrompt = `${prompt}

## 이전 Phase 결과:
${JSON.stringify(previousResults, null, 2)}
`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      fullPrompt,
    ])

    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    return JSON.parse(text)
  } catch (error) {
    console.error('[Phase 6] Gemini API Error:', error)
    throw new Error(`Gemini API 호출 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Phase 7: Master JSON 생성
 * Phase 1-6의 모든 결과를 종합하여 최종 BIM JSON 생성
 */
export async function generateMasterJSON(
  prompt: string,
  allResults: {
    phase1: any
    phase2: any
    phase3: any
    phase4: any
    phase5: any
    phase6: any
  }
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const fullPrompt = `${prompt}

## Phase 1-6 결과:
${JSON.stringify(allResults, null, 2)}
`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    return JSON.parse(text)
  } catch (error) {
    console.error('[Phase 7] Gemini API Error:', error)
    throw new Error(`Gemini API 호출 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * API 상태 확인
 */
export async function checkGeminiStatus(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent('Hello')
    await result.response
    return true
  } catch (error) {
    console.error('Gemini API Status Check Failed:', error)
    return false
  }
}
