/**
 * 통합 디버깅 로거
 * 환경 변수로 로그 레벨 제어
 */

export enum LogLevel {
  MINIMAL = 'minimal',    // 에러만
  STANDARD = 'standard',  // 에러 + 요약
  VERBOSE = 'verbose'     // 모든 상세 정보
}

export interface LogContext {
  module: string
  function: string
  phase?: number
  timestamp?: string
  sessionId?: string
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface CostEstimate {
  inputCost: number
  outputCost: number
  totalCost: number
  currency: string
}

// Next.js HMR에서도 싱글톤 유지
declare global {
  var __debugLogger: DebugLogger | undefined
}

export class DebugLogger {
  private static instance: DebugLogger
  private enabled: boolean
  private level: LogLevel
  private logToFile: boolean
  private logPath: string
  private logPrompts: boolean
  private logImages: boolean
  private logResponses: boolean

  private constructor() {
    this.enabled = process.env.DEBUG_GEMINI === 'true'
    this.level = (process.env.DEBUG_LEVEL as LogLevel) || LogLevel.STANDARD
    this.logToFile = process.env.DEBUG_LOG_TO_FILE === 'true'
    this.logPath = process.env.DEBUG_LOG_PATH || './logs/gemini'
    this.logPrompts = process.env.DEBUG_LOG_PROMPTS === 'true'
    this.logImages = process.env.DEBUG_LOG_IMAGES === 'true'
    this.logResponses = process.env.DEBUG_LOG_RESPONSES === 'true'

    if (this.enabled) {
      console.log(`[DebugLogger] Initialized - Level: ${this.level}`)
    }
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger()
    }
    return DebugLogger.instance
  }

  /**
   * 프롬프트 로깅
   */
  logPrompt(context: LogContext, prompt: string, version: string): void {
    if (!this.enabled) return
    if (!this.logPrompts && this.level !== LogLevel.VERBOSE) return

    const prefix = this.getPrefix(context)

    console.log(`${prefix} 📄 Prompt Version: ${version}`)
    console.log(`${prefix} 📏 Prompt Length: ${prompt.length} chars`)

    if (this.level === LogLevel.VERBOSE || this.logPrompts) {
      console.log(`${prefix} 📝 Prompt Content:`)
      console.log('─'.repeat(80))
      console.log(prompt)
      console.log('─'.repeat(80))
    } else {
      // Preview만 표시
      console.log(`${prefix} 📝 Prompt Preview: ${prompt.substring(0, 150)}...`)
    }
  }

  /**
   * API 요청 로깅
   */
  logAPIRequest(context: LogContext, config: any, imageSize?: number): void {
    if (!this.enabled) return

    const prefix = this.getPrefix(context)

    console.log(`${prefix} 🚀 API Request Started`)
    console.log(`${prefix} 🔧 Config:`, JSON.stringify(config, null, 2))

    if (imageSize && this.logImages) {
      console.log(`${prefix} 🖼️  Image Size: ${this.formatBytes(imageSize)}`)
    }
  }

  /**
   * API 응답 로깅
   */
  logAPIResponse(context: LogContext, response: any, duration: number): void {
    if (!this.enabled) return

    const prefix = this.getPrefix(context)

    console.log(`${prefix} ✅ API Response Received`)
    console.log(`${prefix} ⏱️  Duration: ${duration}ms`)

    if (this.logResponses && this.level !== LogLevel.MINIMAL) {
      console.log(`${prefix} 📊 Response:`, JSON.stringify(response, null, 2))
    }
  }

  /**
   * 에러 로깅 (전체 컨텍스트 포함)
   */
  logError(context: LogContext, error: Error, fullContext?: any): void {
    if (!this.enabled && this.level !== LogLevel.MINIMAL) return

    const prefix = this.getPrefix(context)

    console.error(`${prefix} ❌ ERROR OCCURRED`)
    console.error(`${prefix} Error Name: ${error.name}`)
    console.error(`${prefix} Error Message: ${error.message}`)

    if (this.level !== LogLevel.MINIMAL) {
      console.error(`${prefix} Stack Trace:`)
      console.error(error.stack)

      if (fullContext) {
        console.error(`${prefix} Full Context:`)
        console.error(JSON.stringify(fullContext, null, 2))
      }
    }
  }

  /**
   * 토큰 사용량 로깅
   */
  logTokenUsage(context: LogContext, usage: TokenUsage): void {
    if (!this.enabled) return
    if (this.level === LogLevel.MINIMAL) return

    const prefix = this.getPrefix(context)

    console.log(`${prefix} 🎫 Token Usage:`)
    console.log(`${prefix}   Input: ${usage.inputTokens}`)
    console.log(`${prefix}   Output: ${usage.outputTokens}`)
    console.log(`${prefix}   Total: ${usage.totalTokens}`)
  }

  /**
   * 비용 추정 로깅
   */
  logCostEstimate(context: LogContext, cost: CostEstimate): void {
    if (!this.enabled) return
    if (this.level === LogLevel.MINIMAL) return

    const prefix = this.getPrefix(context)

    console.log(`${prefix} 💰 Cost Estimate:`)
    console.log(`${prefix}   Input: ${cost.inputCost} ${cost.currency}`)
    console.log(`${prefix}   Output: ${cost.outputCost} ${cost.currency}`)
    console.log(`${prefix}   Total: ${cost.totalCost} ${cost.currency}`)
  }

  /**
   * 일반 정보 로깅
   */
  log(context: LogContext, message: string, data?: any): void {
    if (!this.enabled) return

    const prefix = this.getPrefix(context)
    console.log(`${prefix} ${message}`)

    if (data && this.level !== LogLevel.MINIMAL) {
      console.log(`${prefix} Data:`, JSON.stringify(data, null, 2))
    }
  }

  /**
   * 경고 로깅
   */
  warn(context: LogContext, message: string, data?: any): void {
    if (!this.enabled) return

    const prefix = this.getPrefix(context)
    console.warn(`${prefix} ⚠️  ${message}`)

    if (data && this.level !== LogLevel.MINIMAL) {
      console.warn(`${prefix} Data:`, JSON.stringify(data, null, 2))
    }
  }

  /**
   * 로그 prefix 생성
   */
  private getPrefix(context: LogContext): string {
    const phase = context.phase ? `Phase ${context.phase}` : context.module
    const func = context.function
    const timestamp = context.timestamp || new Date().toISOString()

    if (this.level === LogLevel.VERBOSE) {
      return `[${timestamp}] [${phase}/${func}]`
    }

    return `[${phase}]`
  }

  /**
   * 바이트 포맷팅
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

// 전역 싱글톤 인스턴스 export
export const debugLogger =
  global.__debugLogger ??
  (global.__debugLogger = DebugLogger.getInstance())
