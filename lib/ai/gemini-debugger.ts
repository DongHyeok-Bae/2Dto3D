/**
 * Gemini API 전용 디버거
 * API 호출 전/후 상세 로깅
 */

import { debugLogger } from '@/lib/utils/debug-logger'

export class GeminiDebugger {
  private startTime: number = 0
  private phaseNumber: number

  constructor(phaseNumber: number) {
    this.phaseNumber = phaseNumber
  }

  /**
   * 요청 시작 로깅
   */
  logRequestStart(prompt: string, promptVersion: string, imageBase64?: string): void {
    this.startTime = Date.now()

    const context = {
      module: 'gemini-client',
      function: 'analyzeWithGemini',
      phase: this.phaseNumber,
      timestamp: new Date().toISOString()
    }

    console.log(`\n${'='.repeat(80)}`)
    console.log(`[Phase ${this.phaseNumber}] ⏱️  REQUEST STARTED AT ${context.timestamp}`)
    console.log('='.repeat(80))

    // 프롬프트 로깅
    debugLogger.logPrompt(context, prompt, promptVersion)

    // 이미지 정보
    if (imageBase64) {
      const imageSize = imageBase64.length
      const imageMimeType = this.extractMimeType(imageBase64)
      const estimatedFileSize = Math.ceil(imageSize * 0.75) // Base64는 원본보다 약 33% 큼

      console.log(`[Phase ${this.phaseNumber}] 🖼️  IMAGE INFO:`)
      console.log(`[Phase ${this.phaseNumber}]   MIME Type: ${imageMimeType}`)
      console.log(`[Phase ${this.phaseNumber}]   Base64 Size: ${this.formatBytes(imageSize)}`)
      console.log(`[Phase ${this.phaseNumber}]   Estimated File Size: ${this.formatBytes(estimatedFileSize)}`)
    }
  }

  /**
   * API 설정 로깅
   */
  logAPIConfig(config: any): void {
    console.log(`[Phase ${this.phaseNumber}] 🔧 API CONFIGURATION:`)

    const configDetails = {
      temperature: config.temperature,
      thinkingLevel: config.thinkingConfig?.thinkingLevel,
      mediaResolution: config.mediaResolution,
      tools: config.tools?.map((t: any) => Object.keys(t)).flat()
    }

    Object.entries(configDetails).forEach(([key, value]) => {
      if (value !== undefined) {
        console.log(`[Phase ${this.phaseNumber}]   ${key}: ${JSON.stringify(value)}`)
      }
    })
  }

  /**
   * 스트리밍 청크 수신 로깅
   */
  logStreamChunk(chunkNumber: number, chunkText: string): void {
    if (process.env.DEBUG_LEVEL === 'verbose') {
      console.log(`[Phase ${this.phaseNumber}] 📦 Stream Chunk #${chunkNumber}: ${chunkText.length} chars`)
      if (chunkText.length < 200) {
        console.log(`[Phase ${this.phaseNumber}]   Content: ${chunkText}`)
      }
    }
  }

  /**
   * 응답 완료 로깅
   */
  logResponseComplete(fullText: string, parsedResult: any): void {
    const duration = Date.now() - this.startTime

    console.log(`\n[Phase ${this.phaseNumber}] ✅ RESPONSE COMPLETED`)
    console.log(`[Phase ${this.phaseNumber}] ⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`)
    console.log(`[Phase ${this.phaseNumber}] 📝 Response Text Length: ${fullText.length} chars`)

    // JSON 구조 분석
    if (parsedResult) {
      const keys = Object.keys(parsedResult)
      console.log(`[Phase ${this.phaseNumber}] 📊 Parsed JSON Structure:`)
      console.log(`[Phase ${this.phaseNumber}]   Root Keys: ${keys.join(', ')}`)

      // 각 키의 타입과 크기 표시
      keys.forEach(key => {
        const value = parsedResult[key]
        const valueType = Array.isArray(value) ? 'array' : typeof value
        let valueInfo = valueType

        if (Array.isArray(value)) {
          valueInfo += ` (${value.length} items)`
        } else if (typeof value === 'object' && value !== null) {
          valueInfo += ` (${Object.keys(value).length} properties)`
        } else if (typeof value === 'string') {
          valueInfo += ` (${value.length} chars)`
        }

        console.log(`[Phase ${this.phaseNumber}]     ${key}: ${valueInfo}`)
      })
    }

    // 토큰 사용량 추정
    const estimatedInputTokens = this.estimateTokens(fullText)
    const estimatedCost = this.estimateCost(estimatedInputTokens, 0) // 입력 토큰만 추정

    console.log(`[Phase ${this.phaseNumber}] 🎫 ESTIMATED TOKEN USAGE:`)
    console.log(`[Phase ${this.phaseNumber}]   Output Tokens: ~${estimatedInputTokens}`)
    console.log(`[Phase ${this.phaseNumber}] 💰 ESTIMATED COST:`)
    console.log(`[Phase ${this.phaseNumber}]   Total: ~$${estimatedCost.toFixed(6)} USD`)

    console.log('='.repeat(80))
  }

  /**
   * 에러 로깅 (전체 컨텍스트)
   */
  logError(error: Error, prompt?: string, imageBase64?: string): void {
    const duration = Date.now() - this.startTime

    console.error(`\n${'='.repeat(80)}`)
    console.error(`[Phase ${this.phaseNumber}] ❌ ERROR OCCURRED`)
    console.error('='.repeat(80))
    console.error(`[Phase ${this.phaseNumber}] Error Name: ${error.name}`)
    console.error(`[Phase ${this.phaseNumber}] Error Message: ${error.message}`)
    console.error(`[Phase ${this.phaseNumber}] Duration Before Error: ${duration}ms`)

    if (process.env.DEBUG_LEVEL !== 'minimal') {
      console.error(`\n[Phase ${this.phaseNumber}] Stack Trace:`)
      console.error(error.stack)
    }

    // 전체 컨텍스트
    const fullContext: any = {
      timestamp: new Date().toISOString(),
      phase: this.phaseNumber,
      duration: `${duration}ms`
    }

    if (prompt) {
      fullContext.promptLength = prompt.length
      fullContext.promptPreview = prompt.substring(0, 200) + '...'
    }

    if (imageBase64) {
      fullContext.imageSize = imageBase64.length
      fullContext.imageMimeType = this.extractMimeType(imageBase64)
    }

    console.error(`\n[Phase ${this.phaseNumber}] Full Context:`)
    console.error(JSON.stringify(fullContext, null, 2))
    console.error('='.repeat(80))

    // DebugLogger로도 기록
    debugLogger.logError(
      {
        module: 'gemini-client',
        function: 'analyzeWithGemini',
        phase: this.phaseNumber,
        timestamp: new Date().toISOString()
      },
      error,
      fullContext
    )
  }

  /**
   * Base64에서 MIME 타입 추출
   */
  private extractMimeType(base64: string): string {
    const match = base64.match(/^data:(.+?);base64,/)
    return match ? match[1] : 'unknown'
  }

  /**
   * 바이트 포맷팅
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  /**
   * 토큰 수 추정 (간단한 알고리즘)
   * 실제 토큰화는 더 복잡하지만, 대략적인 추정
   */
  private estimateTokens(text: string): number {
    // 영어: 약 4자당 1토큰
    // 한글: 약 2-3자당 1토큰
    // 혼합 텍스트는 평균 3.5자당 1토큰으로 추정
    return Math.ceil(text.length / 3.5)
  }

  /**
   * 비용 추정 (Gemini API 가격 기준)
   * 2024년 기준 대략적인 가격
   */
  private estimateCost(inputTokens: number, outputTokens: number): number {
    // Gemini Pro 가격 (대략):
    // Input: $0.00025 / 1K tokens
    // Output: $0.0005 / 1K tokens
    const INPUT_COST_PER_1K = 0.00025
    const OUTPUT_COST_PER_1K = 0.0005

    const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K
    const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K

    return inputCost + outputCost
  }

  /**
   * 단계별 진행 상황 로깅
   */
  logStep(step: string, details?: string): void {
    console.log(`[Phase ${this.phaseNumber}] 📍 ${step}${details ? `: ${details}` : ''}`)
  }
}
