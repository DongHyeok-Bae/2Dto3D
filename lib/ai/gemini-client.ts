/**
 * Google Gemini API Client
 *
 * Phase 1-6 파이프라인에서 사용되는 Gemini AI 호출 유틸리티
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 이 파일의 역할:                                                   │
 * │ - 2D 건축 도면 이미지를 Gemini AI에 전송                          │
 * │ - AI가 분석한 결과(JSON)를 받아서 반환                            │
 * │ - Phase 1~6 각각의 분석 요청을 처리                               │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 주요 함수:
 * - analyzeWithGemini(): Phase 1-5용 (이미지 + 프롬프트 → JSON)
 * - executePhase6(): Phase 6용 (텍스트만, 최종 BIM JSON 생성)
 * - checkGeminiStatus(): API 상태 확인
 */

import { GoogleGenAI, MediaResolution, ThinkingLevel } from '@google/genai'
import { GeminiDebugger } from './gemini-debugger'
import type {
  Phase1Input,
  Phase2Input,
  Phase3Input,
  Phase4Input,
  Phase5Input,
  Phase6Input,
  AIContextInfo,
} from './types/phase-handlers'
import type {
  Phase1Result,
  Phase2Result,
  Phase3Result,
  Phase4Result,
  Phase5Result,
  MasterJSON,
} from '@/types'

// ============================================================================
// API 키 설정
// ============================================================================
// 환경 변수에서 API 키를 읽어옴 (GOOGLE_AI_API_KEY 또는 GEMINI_API_KEY 중 하나)
// .env.local 파일에 설정되어 있어야 함
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('ERROR: Gemini API key is not configured')
  throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable must be set')
}

// ============================================================================
// Gemini API 클라이언트 초기화
// ============================================================================
// GoogleGenAI: Google의 공식 AI SDK 클라이언트
// 이 인스턴스를 통해 모든 API 호출이 이루어짐
const genAI = new GoogleGenAI({
  apiKey
})

// ============================================================================
// 내부 유틸리티 함수
// ============================================================================

/**
 * Base64 이미지 파싱
 * @returns { mimeType, base64Data } 또는 에러
 */
function parseBase64Image(imageBase64: string): { mimeType: string; base64Data: string } {
  const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid base64 image format')
  }
  return {
    mimeType: matches[1],
    base64Data: matches[2],
  }
}

/**
 * Gemini API 설정 생성
 */
function createGeminiConfig(prompt: string) {
  return {
    temperature: 0.95,
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.HIGH,
    },
    mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
    systemInstruction: [{ text: prompt }],
  }
}

/**
 * Gemini 스트리밍 호출 및 JSON 파싱
 */
async function executeGeminiCall(config: any, contents: any[]): Promise<any> {
  const response = await genAI.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    config,
    contents,
  })

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
}

/**
 * 이전 Phase 결과를 User Message용 텍스트로 포맷팅
 */
function formatPreviousResultsForUserMessage(results: Record<string, any>): string {
  return JSON.stringify(results, null, 2)
}

// ============================================================================
// Phase별 전용 핸들러 함수 (executePhase1 ~ executePhase7)
// ============================================================================

/**
 * Phase 1: 좌표계 정규화
 * - 의존성: 없음
 * - 입력: 이미지 + 프롬프트
 * - 출력: Phase1Result
 */
export async function executePhase1(input: Phase1Input): Promise<Phase1Result> {
  const geminiDebugger = new GeminiDebugger(1)

  try {
    const { mimeType, base64Data } = parseBase64Image(input.imageBase64)
    const config = createGeminiConfig(input.prompt)

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
            text: '위 건축 도면 이미지를 분석하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    // 컨텍스트 정보 (Phase 1은 이전 결과 없음)
    const contextInfo: AIContextInfo = {
      userMessagePhases: [],
      hasImage: true,
    }

    geminiDebugger.logRequestWithContext(config, contents, contextInfo)

    const startTime = Date.now()
    const result = await executeGeminiCall(config, contents)

    geminiDebugger.logResponse(result, Date.now() - startTime)

    return result as Phase1Result
  } catch (error) {
    console.error('[Phase 1] Gemini API Error:', error)
    if (error instanceof Error) throw error
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

/**
 * Phase 2: 구조 요소 추출
 * - 의존성: Phase 1
 * - 입력: 이미지 + 프롬프트 + Phase1Result
 * - 출력: Phase2Result
 */
export async function executePhase2(input: Phase2Input): Promise<Phase2Result> {
  const geminiDebugger = new GeminiDebugger(2)

  try {
    const { mimeType, base64Data } = parseBase64Image(input.imageBase64)
    const config = createGeminiConfig(input.prompt)

    // Phase 1 결과를 User Message에 포함
    const previousResultsText = formatPreviousResultsForUserMessage({
      phase1: input.phase1Result,
    })

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
            text: `## 이전 Phase 결과:\n${previousResultsText}`,
          },
          {
            text: '위 건축 도면 이미지와 이전 Phase 결과를 참고하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    const contextInfo: AIContextInfo = {
      userMessagePhases: [1],
      hasImage: true,
    }

    geminiDebugger.logRequestWithContext(config, contents, contextInfo)

    const startTime = Date.now()
    const result = await executeGeminiCall(config, contents)

    geminiDebugger.logResponse(result, Date.now() - startTime)

    return result as Phase2Result
  } catch (error) {
    console.error('[Phase 2] Gemini API Error:', error)
    if (error instanceof Error) throw error
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

/**
 * Phase 3: 개구부 인식
 * - 의존성: Phase 1-2
 * - 입력: 이미지 + 프롬프트 + Phase1Result + Phase2Result
 * - 출력: Phase3Result
 */
export async function executePhase3(input: Phase3Input): Promise<Phase3Result> {
  const geminiDebugger = new GeminiDebugger(3)

  try {
    const { mimeType, base64Data } = parseBase64Image(input.imageBase64)
    const config = createGeminiConfig(input.prompt)

    const previousResultsText = formatPreviousResultsForUserMessage({
      phase1: input.phase1Result,
      phase2: input.phase2Result,
    })

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
            text: `## 이전 Phase 결과:\n${previousResultsText}`,
          },
          {
            text: '위 건축 도면 이미지와 이전 Phase 결과를 참고하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    const contextInfo: AIContextInfo = {
      userMessagePhases: [1, 2],
      hasImage: true,
    }

    geminiDebugger.logRequestWithContext(config, contents, contextInfo)

    const startTime = Date.now()
    const result = await executeGeminiCall(config, contents)

    geminiDebugger.logResponse(result, Date.now() - startTime)

    return result as Phase3Result
  } catch (error) {
    console.error('[Phase 3] Gemini API Error:', error)
    if (error instanceof Error) throw error
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

/**
 * Phase 4: 공간 분석
 * - 의존성: Phase 1-3
 * - 입력: 이미지 + 프롬프트 + previousResults (phase1, phase2, phase3)
 * - 출력: Phase4Result
 */
export async function executePhase4(input: Phase4Input): Promise<Phase4Result> {
  const geminiDebugger = new GeminiDebugger(4)

  try {
    const { mimeType, base64Data } = parseBase64Image(input.imageBase64)
    const config = createGeminiConfig(input.prompt)

    const previousResultsText = formatPreviousResultsForUserMessage({
      phase1: input.previousResults.phase1,
      phase2: input.previousResults.phase2,
      phase3: input.previousResults.phase3,
    })

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
            text: `## 이전 Phase 결과:\n${previousResultsText}`,
          },
          {
            text: '위 건축 도면 이미지와 이전 Phase 결과를 참고하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    const contextInfo: AIContextInfo = {
      userMessagePhases: [1, 2, 3],
      hasImage: true,
    }

    geminiDebugger.logRequestWithContext(config, contents, contextInfo)

    const startTime = Date.now()
    const result = await executeGeminiCall(config, contents)

    geminiDebugger.logResponse(result, Date.now() - startTime)

    return result as Phase4Result
  } catch (error) {
    console.error('[Phase 4] Gemini API Error:', error)
    if (error instanceof Error) throw error
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

/**
 * Phase 5: 치수 계산
 * - 의존성: Phase 1-4
 * - 입력: 이미지 + 프롬프트 + previousResults (phase1-4)
 * - 출력: Phase5Result
 */
export async function executePhase5(input: Phase5Input): Promise<Phase5Result> {
  const geminiDebugger = new GeminiDebugger(5)

  try {
    const { mimeType, base64Data } = parseBase64Image(input.imageBase64)
    const config = createGeminiConfig(input.prompt)

    const previousResultsText = formatPreviousResultsForUserMessage({
      phase1: input.previousResults.phase1,
      phase2: input.previousResults.phase2,
      phase3: input.previousResults.phase3,
      phase4: input.previousResults.phase4,
    })

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
            text: `## 이전 Phase 결과:\n${previousResultsText}`,
          },
          {
            text: '위 건축 도면 이미지와 이전 Phase 결과를 참고하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    const contextInfo: AIContextInfo = {
      userMessagePhases: [1, 2, 3, 4],
      hasImage: true,
    }

    geminiDebugger.logRequestWithContext(config, contents, contextInfo)

    const startTime = Date.now()
    const result = await executeGeminiCall(config, contents)

    geminiDebugger.logResponse(result, Date.now() - startTime)

    return result as Phase5Result
  } catch (error) {
    console.error('[Phase 5] Gemini API Error:', error)
    if (error instanceof Error) throw error
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

/**
 * Phase 6: Master JSON 생성 (기존 Phase 7)
 * - 의존성: Phase 1-5
 * - 입력: 프롬프트 + allResults (phase1-5) (이미지 없음)
 * - 출력: MasterJSON
 */
export async function executePhase6(input: Phase6Input): Promise<MasterJSON> {
  const geminiDebugger = new GeminiDebugger(6)

  try {
    const config = createGeminiConfig(input.prompt)

    const allResultsText = formatPreviousResultsForUserMessage({
      phase1: input.allResults.phase1,
      phase2: input.allResults.phase2,
      phase3: input.allResults.phase3,
      phase4: input.allResults.phase4,
      phase5: input.allResults.phase5,
    })

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `## Phase 1-5 결과:\n${allResultsText}`,
          },
          {
            text: '위 Phase 1-5 결과를 기반으로 시스템 지시에 따라 최종 Master JSON을 생성해주세요.',
          },
        ],
      },
    ]

    const contextInfo: AIContextInfo = {
      userMessagePhases: [1, 2, 3, 4, 5],
      hasImage: false,
    }

    geminiDebugger.logRequestWithContext(config, contents, contextInfo)

    const startTime = Date.now()
    const result = await executeGeminiCall(config, contents)

    geminiDebugger.logResponse(result, Date.now() - startTime)

    return result as MasterJSON
  } catch (error) {
    console.error('[Phase 6] Gemini API Error:', error)
    if (error instanceof Error) throw error
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

// ============================================================================
// 레거시 함수 (하위 호환성 유지, 향후 제거 예정)
// ============================================================================

// ============================================================================
// 메인 함수 1: analyzeWithGemini (Phase 1-5용)
// ============================================================================
/**
 * Gemini 3 Pro Preview 모델로 이미지 + 프롬프트 분석
 *
 * @deprecated executePhase1 ~ executePhase5 사용을 권장합니다.
 * 이 함수는 하위 호환성을 위해 유지되며, 향후 제거될 예정입니다.
 *
 * 【사용 Phase】Phase 1, 2, 3, 4, 5
 * 【입력】건축 도면 이미지(Base64) + 분석 프롬프트
 * 【출력】AI가 분석한 JSON 데이터
 *
 * @param imageBase64 - Base64 인코딩된 이미지 (data:image/png;base64,... 형식)
 * @param prompt - Phase별 프롬프트 내용 (lib/ai/prompts/phase{N}.md 파일 내용)
 * @param phaseNumber - Phase 번호 (1-7)
 * @returns JSON 형태의 분석 결과
 *
 * 【처리 흐름】
 * 1. 이미지 데이터 파싱 (Base64 → MIME타입 + 순수 데이터)
 * 2. Gemini API 설정 구성 (temperature, thinkingLevel 등)
 * 3. API 호출 (스트리밍 방식)
 * 4. 응답 수집 및 JSON 파싱
 * 5. 결과 반환
 */
export async function analyzeWithGemini(
  imageBase64: string,
  prompt: string,
  phaseNumber: number
): Promise<any> {
  // 디버깅용 로거 초기화
  const geminiDebugger = new GeminiDebugger(phaseNumber)

  try {
    // ────────────────────────────────────────────────────────────────
    // Step 1: Base64 이미지 파싱
    // ────────────────────────────────────────────────────────────────
    // 입력 형식: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
    // 분리 결과: mimeType = "image/png", base64Data = "iVBORw0KGgoAAAANSUhEUg..."
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]   // 예: "image/png", "image/jpeg"
    const base64Data = matches[2]  // 순수 Base64 문자열 (data: 접두사 제외)

    // ────────────────────────────────────────────────────────────────
    // Step 2: Gemini API 설정
    // ────────────────────────────────────────────────────────────────
    const config = {
      // temperature: AI 응답의 창의성/무작위성 조절 (0.0~2.0)
      // 0.95: 건축 도면 분석에 적합한 높은 창의성 (다양한 해석 허용)
      temperature: 0.95,

      // thinkingConfig: AI의 "생각" 깊이 설정
      // - HIGH: 복잡한 문제에 대해 더 깊이 생각 (건축 분석에 필수)
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },

      // mediaResolution: 이미지 분석 해상도
      // - HIGH: 고해상도 분석 (도면의 세부 사항 인식에 중요)
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,

      // systemInstruction: 시스템 프롬프트 (공식 형식 준수)
      // Phase별 프롬프트를 시스템 지시로 전달하여 AI가 역할/규칙을 명확히 인식
      systemInstruction: [{ text: prompt }],
    }

    // ────────────────────────────────────────────────────────────────
    // Step 3: API 요청 데이터 구성
    // ────────────────────────────────────────────────────────────────
    // Gemini API에 보낼 메시지 구조 (이미지 + 실행 트리거 멘트)
    // 시스템 프롬프트는 config.systemInstruction으로 분리됨
    const contents = [
      {
        role: 'user',  // 사용자 역할로 메시지 전송
        parts: [
          // Part 1: 건축 도면 이미지
          {
            inlineData: {
              mimeType,        // 이미지 타입 (png/jpeg 등)
              data: base64Data, // Base64 인코딩된 이미지 데이터
            },
          },
          // Part 2: 실행 트리거 멘트
          {
            text: '위 건축 도면 이미지를 분석하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    // ✅ API 요청 데이터 로깅
    geminiDebugger.logRequest(config, contents)

    // 응답 시간 측정 시작
    const startTime = Date.now()

    // ────────────────────────────────────────────────────────────────
    // Step 4: Gemini API 호출 (스트리밍 방식)
    // ────────────────────────────────────────────────────────────────
    // generateContentStream: 응답을 실시간으로 받는 스트리밍 API
    // - 장점: 긴 응답도 조각(chunk)으로 나눠서 받음
    // - 단점: 전체 응답이 올 때까지 기다려야 JSON 파싱 가능
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',  // 사용 모델: Gemini 3 Pro Preview
      config,   // 위에서 설정한 API 옵션
      contents, // 이미지 + 프롬프트 데이터
    })

    // ────────────────────────────────────────────────────────────────
    // Step 5: 스트리밍 응답 수집
    // ────────────────────────────────────────────────────────────────
    // AI 응답이 여러 조각(chunk)으로 나눠서 도착함
    // 모든 조각을 모아서 하나의 완성된 텍스트로 합침
    let fullText = ''
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text  // 조각들을 이어붙임
      }
    }

    // ────────────────────────────────────────────────────────────────
    // Step 6: JSON 추출 및 파싱
    // ────────────────────────────────────────────────────────────────
    // AI 응답 형식 2가지:
    // 형식 1: ```json { ... } ``` (마크다운 코드 블록)
    // 형식 2: { ... } (순수 JSON)
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
    let parsedResult

    if (jsonMatch) {
      // 마크다운 코드 블록에서 JSON 추출
      parsedResult = JSON.parse(jsonMatch[1])
    } else {
      // 순수 JSON으로 직접 파싱
      parsedResult = JSON.parse(fullText)
    }

    // ✅ API 응답 로깅
    geminiDebugger.logResponse(parsedResult, Date.now() - startTime)

    return parsedResult  // JSON 객체 반환 (Phase별 스키마에 맞는 데이터)

  } catch (error) {
    console.error(`[Phase ${phaseNumber}] Gemini API Error:`, error)
    // 원본 에러 보존
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

// ============================================================================
// 레거시 함수 2: generateMasterJSON (기존 Phase 7용 → 현재 Phase 6)
// ============================================================================
/**
 * Master JSON 생성 (레거시 래퍼)
 *
 * @deprecated executePhase6 사용을 권장합니다.
 * 이 함수는 하위 호환성을 위해 유지되며, 향후 제거될 예정입니다.
 *
 * 참고: 기존 Phase 7이 Phase 6으로 승격되었으며,
 * 기존 Phase 6 (Human-in-the-loop Validation)은 제거되었습니다.
 *
 * @param prompt - Phase 6 프롬프트 (최종 JSON 생성 지침)
 * @param allResults - Phase 1-5의 모든 분석 결과
 * @returns 최종 BIM JSON (Three.js 렌더링용)
 */
export async function generateMasterJSON(
  prompt: string,
  allResults: {
    phase1: any
    phase2: any
    phase3: any
    phase4: any
    phase5: any
  }
): Promise<any> {
  console.warn('[DEPRECATED] generateMasterJSON은 deprecated입니다. executePhase6을 사용하세요.')
  return executePhase6({
    prompt,
    allResults,
  })
}

// verifyWithGemini 함수는 제거됨 (기존 Phase 6 Human-in-the-loop Validation 삭제)

// ============================================================================
// 레거시 함수 3: 하위 호환성을 위한 executePhase7 alias
// ============================================================================
/**
 * @deprecated Phase 7이 Phase 6으로 승격되었습니다. executePhase6을 사용하세요.
 */
export async function executePhase7(input: {
  prompt: string
  allResults: {
    phase1: any
    phase2: any
    phase3: any
    phase4: any
    phase5: any
  }
}): Promise<MasterJSON> {
  console.warn('[DEPRECATED] executePhase7은 deprecated입니다. executePhase6을 사용하세요.')
  return executePhase6(input as Phase6Input)
}

// ============================================================================
// 유틸리티 함수: checkGeminiStatus (상태 확인용)
// ============================================================================
/**
 * Gemini API 상태 확인
 *
 * 【목적】API 키가 유효하고 서비스가 정상 작동하는지 확인
 * 【사용 시점】애플리케이션 시작 시, 또는 API 오류 발생 후 상태 확인
 *
 * @returns true = API 정상, false = API 오류
 *
 * 【작동 방식】
 * - 간단한 "Hello" 메시지를 전송
 * - 응답이 오면 API 정상 작동 (true)
 * - 오류 발생하면 API 문제 (false)
 */
export async function checkGeminiStatus(): Promise<boolean> {
  try {
    // 최소한의 API 설정 (상태 확인용 - 가벼운 설정)
    const config = {
      temperature: 0.5,  // 낮은 창의성 (빠른 응답)
      // thinkingConfig 없음: 간단한 확인이므로 불필요
      // mediaResolution 없음: 이미지 없음
      tools: [
        {
          googleSearch: {}
        }
      ],
    }

    // 간단한 테스트 메시지
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 'Hello',  // 가장 간단한 테스트 메시지
          },
        ],
      },
    ]

    // API 호출 시도
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    // 응답이 하나라도 오면 성공
    for await (const chunk of response) {
      if (chunk.text) {
        return true  // ✅ API 정상 작동
      }
    }

    return true
  } catch (error) {
    // ❌ API 오류 (키 문제, 네트워크 오류, 할당량 초과 등)
    console.error('Gemini API Status Check Failed:', error)
    return false
  }
}
