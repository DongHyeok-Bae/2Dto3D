/**
 * Google Gemini API Client
 *
 * Phase 1-7 파이프라인에서 사용되는 Gemini AI 호출 유틸리티
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 이 파일의 역할:                                                   │
 * │ - 2D 건축 도면 이미지를 Gemini AI에 전송                          │
 * │ - AI가 분석한 결과(JSON)를 받아서 반환                            │
 * │ - Phase 1~7 각각의 분석 요청을 처리                               │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 주요 함수:
 * - analyzeWithGemini(): Phase 1-5용 (이미지 + 프롬프트 → JSON)
 * - verifyWithGemini(): Phase 6용 (이미지 + 이전 결과 검증)
 * - generateMasterJSON(): Phase 7용 (텍스트만, 최종 BIM JSON 생성)
 * - checkGeminiStatus(): API 상태 확인
 */

import { GoogleGenAI, MediaResolution, ThinkingLevel } from '@google/genai'
import { GeminiDebugger } from './gemini-debugger'

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
// 메인 함수 1: analyzeWithGemini (Phase 1-5용)
// ============================================================================
/**
 * Gemini 3 Pro Preview 모델로 이미지 + 프롬프트 분석
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
// 메인 함수 2: verifyWithGemini (Phase 6용)
// ============================================================================
/**
 * Phase 6: Human-in-the-Loop 검증
 *
 * 【사용 Phase】Phase 6
 * 【목적】이전 Phase(1-5) 결과를 종합 검증하여 오류/누락 사항 확인
 * 【특징】이전 Phase 결과를 프롬프트에 포함하여 AI가 전체 맥락 이해
 *
 * @param imageBase64 - 원본 건축 도면 이미지
 * @param prompt - Phase 6 검증 프롬프트
 * @param previousResults - Phase 1-5의 분석 결과 (JSON 객체들)
 * @returns 검증 결과 JSON (수정 제안, 오류 지적 등)
 *
 * 【analyzeWithGemini()와의 차이점】
 * - previousResults를 프롬프트에 추가하여 이전 결과 참조
 * - 이미지 해상도를 MEDIUM으로 낮춤 (이미 분석된 이미지이므로)
 */
export async function verifyWithGemini(
  imageBase64: string,
  prompt: string,
  previousResults: {
    phase1?: any  // 좌표계 정규화 결과
    phase2?: any  // 공간 인식 결과
    phase3?: any  // 구조 요소 인식 결과
    phase4?: any  // 개구부 인식 결과
    phase5?: any  // 설비 인식 결과
  }
): Promise<any> {
  // 디버깅용 로거 초기화 (Phase 6)
  const geminiDebugger = new GeminiDebugger(6)

  try {
    // ────────────────────────────────────────────────────────────────
    // Step 1: 이미지 파싱 (analyzeWithGemini와 동일)
    // ────────────────────────────────────────────────────────────────
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    // ────────────────────────────────────────────────────────────────
    // Step 2: API 설정 (systemInstruction 포함)
    // ────────────────────────────────────────────────────────────────
    const config = {
      temperature: 0.95,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      // HIGH: 검증 단계에서도 고해상도로 정확한 분석 수행
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
      // systemInstruction: 시스템 프롬프트 (공식 형식 준수)
      systemInstruction: [{ text: prompt }],
    }

    // ────────────────────────────────────────────────────────────────
    // Step 3: 콘텐츠 구조 (이미지 + 이전 결과 JSON + 실행 트리거)
    // ────────────────────────────────────────────────────────────────
    // AI가 Phase 1-5 결과를 검토할 수 있도록 JSON 형태로 추가
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
          // 이전 Phase 결과 (데이터)
          {
            text: `## 이전 Phase 결과:\n${JSON.stringify(previousResults, null, 2)}`,
          },
          // 실행 트리거 멘트
          {
            text: '위 이미지와 이전 Phase 결과를 검증하여 시스템 지시에 따라 JSON을 생성해주세요.',
          },
        ],
      },
    ]

    // ✅ API 요청 데이터 로깅
    geminiDebugger.logRequest(config, contents)

    // 응답 시간 측정 시작
    const startTime = Date.now()

    // ────────────────────────────────────────────────────────────────
    // Step 4: API 호출 및 응답 수집 (analyzeWithGemini와 동일)
    // ────────────────────────────────────────────────────────────────
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    // 스트리밍 응답 수집
    let fullText = ''
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text
      }
    }

    // JSON 추출 및 반환
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
    let parsedResult

    if (jsonMatch) {
      parsedResult = JSON.parse(jsonMatch[1])
    } else {
      parsedResult = JSON.parse(fullText)
    }

    // ✅ API 응답 로깅
    geminiDebugger.logResponse(parsedResult, Date.now() - startTime)

    return parsedResult
  } catch (error) {
    console.error('[Phase 6] Gemini API Error:', error)
    // 원본 에러 타입 보존하여 상위에서 적절한 처리 가능
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
}

// ============================================================================
// 메인 함수 3: generateMasterJSON (Phase 7용)
// ============================================================================
/**
 * Phase 7: Master JSON 생성
 *
 * 【사용 Phase】Phase 7 (최종 단계)
 * 【목적】Phase 1-6 결과를 종합하여 최종 BIM JSON 생성
 * 【특징】이미지 없이 텍스트만 사용 (이미 모든 분석 완료됨)
 *
 * @param prompt - Phase 7 프롬프트 (최종 JSON 생성 지침)
 * @param allResults - Phase 1-6의 모든 분석 결과
 * @returns 최종 BIM JSON (Three.js 렌더링용)
 *
 * 【다른 함수와의 차이점】
 * - 이미지를 전송하지 않음 (텍스트 전용)
 * - mediaResolution 설정 없음
 * - Phase 1-6 모든 결과를 프롬프트에 포함
 */
export async function generateMasterJSON(
  prompt: string,
  allResults: {
    phase1: any  // 좌표계 정규화
    phase2: any  // 공간 인식
    phase3: any  // 구조 요소 인식
    phase4: any  // 개구부 인식
    phase5: any  // 설비 인식
    phase6: any  // Human-in-the-Loop 검증 결과
  }
): Promise<any> {
  // 디버깅용 로거 초기화 (Phase 7)
  const geminiDebugger = new GeminiDebugger(7)

  try {
    // ────────────────────────────────────────────────────────────────
    // Step 1: API 설정 (systemInstruction 포함)
    // ────────────────────────────────────────────────────────────────
    const config = {
      temperature: 0.95,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      // mediaResolution: 텍스트 전용이지만 설정 통일
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
      // systemInstruction: 시스템 프롬프트 (공식 형식 준수)
      systemInstruction: [{ text: prompt }],
    }

    // ────────────────────────────────────────────────────────────────
    // Step 2: 콘텐츠 구조 (Phase 1-6 결과 JSON + 실행 트리거)
    // ────────────────────────────────────────────────────────────────
    // Phase 1-6의 모든 분석 결과를 AI에게 전달
    // AI는 이 데이터를 기반으로 최종 BIM JSON 생성
    const contents = [
      {
        role: 'user',
        parts: [
          // Phase 1-6 결과 (데이터)
          {
            text: `## Phase 1-6 결과:\n${JSON.stringify(allResults, null, 2)}`,
          },
          // 실행 트리거 멘트
          {
            text: '위 Phase 1-6 결과를 기반으로 시스템 지시에 따라 최종 Master JSON을 생성해주세요.',
          },
        ],
      },
    ]

    // ✅ API 요청 데이터 로깅
    geminiDebugger.logRequest(config, contents)

    // 응답 시간 측정 시작
    const startTime = Date.now()

    // ────────────────────────────────────────────────────────────────
    // Step 3: API 호출 및 응답 수집
    // ────────────────────────────────────────────────────────────────
    const response = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config,
      contents,
    })

    // 스트리밍 응답 수집
    let fullText = ''
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text
      }
    }

    // JSON 추출 및 반환 (최종 BIM JSON)
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
    let parsedResult

    if (jsonMatch) {
      parsedResult = JSON.parse(jsonMatch[1])
    } else {
      parsedResult = JSON.parse(fullText)
    }

    // ✅ API 응답 로깅
    geminiDebugger.logResponse(parsedResult, Date.now() - startTime)

    return parsedResult
  } catch (error) {
    console.error('[Phase 7] Gemini API Error:', error)
    // 원본 에러 타입 보존
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Gemini API 호출 실패: ${String(error)}`)
  }
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
