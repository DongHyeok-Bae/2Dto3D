/**
 * Google Gemini API Client
 *
 * Phase 1-7 파이프라인에서 사용되는 Gemini AI 호출 유틸리티
 */

import { GoogleGenAI, MediaResolution, ThinkingLevel } from '@google/genai'
import { GeminiDebugger } from './gemini-debugger'

// API 키 검증
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('ERROR: Gemini API key is not configured')
  throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable must be set')
}

// Gemini API 인스턴스
const genAI = new GoogleGenAI({
  apiKey
})

/**
 * Gemini 3 Pro Preview 모델로 이미지 + 프롬프트 분석
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
  // 디버거 초기화
  const geminiDebugger = new GeminiDebugger(phaseNumber)

  try {
    // ✅ 요청 시작 로깅
    geminiDebugger.logRequestStart(prompt, 'from-api-call', imageBase64)

    // Base64에서 MIME 타입과 데이터 분리
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    geminiDebugger.logStep('Parsing image', `MIME: ${mimeType}, Data length: ${base64Data.length}`)

    // API 설정 (공식 코드 기준)
    const config = {
      temperature: 0.95,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      tools: [
        {
          googleSearch: {}
        }
      ],
    }

    // ✅ API 설정 로깅
    geminiDebugger.logAPIConfig(config)

    // 콘텐츠 구조 생성
    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ]

    geminiDebugger.logStep('Calling Gemini API', 'Model: gemini-3-pro-preview')

    // Gemini API 호출
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    geminiDebugger.logStep('Receiving stream response')

    // 스트림 응답 수집
    let fullText = ''
    let chunkCount = 0
    for await (const chunk of response) {
      if (chunk.text) {
        chunkCount++
        fullText += chunk.text
        geminiDebugger.logStreamChunk(chunkCount, chunk.text)
      }
    }

    geminiDebugger.logStep('Stream complete', `Total chunks: ${chunkCount}`)

    // JSON 추출 (```json ... ``` 형식 처리)
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
    let parsedResult

    if (jsonMatch) {
      geminiDebugger.logStep('Parsing JSON', 'Format: code block')
      parsedResult = JSON.parse(jsonMatch[1])
    } else {
      geminiDebugger.logStep('Parsing JSON', 'Format: raw JSON')
      parsedResult = JSON.parse(fullText)
    }

    // ✅ 응답 완료 로깅
    geminiDebugger.logResponseComplete(fullText, parsedResult)

    return parsedResult

  } catch (error) {
    // ✅ 에러 로깅 (전체 컨텍스트 포함)
    geminiDebugger.logError(
      error instanceof Error ? error : new Error(String(error)),
      prompt,
      imageBase64
    )

    // 원본 에러 보존
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
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
    // Base64에서 MIME 타입과 데이터 분리
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

    // API 설정 (공식 코드 기준)
    const config = {
      temperature: 0.95,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      tools: [
        {
          googleSearch: {}
        }
      ],
    }

    // 콘텐츠 구조 생성
    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
    ]

    // Gemini API 호출
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    // 스트림 응답 수집
    let fullText = ''
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text
      }
    }

    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    return JSON.parse(fullText)
  } catch (error) {
    console.error('[Phase 6] Gemini API Error:', error)
    // 원본 에러 보존
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
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
    const fullPrompt = `${prompt}

## Phase 1-6 결과:
${JSON.stringify(allResults, null, 2)}
`

    // API 설정 (공식 코드 기준, 이미지 없으므로 mediaResolution 제외)
    const config = {
      temperature: 0.95,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      tools: [
        {
          googleSearch: {}
        }
      ],
    }

    // 콘텐츠 구조 생성 (텍스트만 포함)
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ]

    // Gemini API 호출
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    // 스트림 응답 수집
    let fullText = ''
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text
      }
    }

    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    return JSON.parse(fullText)
  } catch (error) {
    console.error('[Phase 7] Gemini API Error:', error)
    // 원본 에러 보존
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

/**
 * API 상태 확인
 */
export async function checkGeminiStatus(): Promise<boolean> {
  try {
    // API 설정
    const config = {
      temperature: 0.5,
      tools: [
        {
          googleSearch: {}
        }
      ],
    }

    // 콘텐츠 구조 생성
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 'Hello',
          },
        ],
      },
    ]

    // Gemini API 호출
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    // 응답 확인
    for await (const chunk of response) {
      if (chunk.text) {
        return true
      }
    }

    return true
  } catch (error) {
    console.error('Gemini API Status Check Failed:', error)
    return false
  }
}
