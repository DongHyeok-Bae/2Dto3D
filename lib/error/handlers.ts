/**
 * 에러 핸들링 유틸리티
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: string[]) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class GeminiError extends APIError {
  constructor(message: string) {
    super(message, 500, 'GEMINI_ERROR')
    this.name = 'GeminiError'
  }
}

export class PromptNotFoundError extends APIError {
  constructor(phaseNumber: number) {
    super(`Phase ${phaseNumber} 프롬프트를 찾을 수 없습니다.`, 404, 'PROMPT_NOT_FOUND')
    this.name = 'PromptNotFoundError'
  }
}

/**
 * Next.js API Route 에러 응답
 */
export function errorResponse(error: unknown) {
  // 개발 환경 여부 확인
  const isDevelopment = process.env.NODE_ENV === 'development'

  console.error('API Error:', error)

  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { errors: error.errors }),
        // 개발 환경에서는 스택 트레이스 포함
        ...(isDevelopment && { stack: error.stack, name: error.name }),
      },
      { status: error.statusCode }
    )
  }

  // Unknown error - 개발 환경에서 더 많은 정보 제공
  const message = error instanceof Error ? error.message : 'Internal server error'
  const errorName = error instanceof Error ? error.name : 'Unknown'
  const errorStack = error instanceof Error ? error.stack : undefined

  return Response.json(
    {
      error: message,
      code: 'INTERNAL_ERROR',
      // 개발 환경에서는 상세 정보 포함
      ...(isDevelopment && {
        name: errorName,
        stack: errorStack,
        raw: String(error)
      }),
    },
    { status: 500 }
  )
}

/**
 * 성공 응답
 */
export function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status })
}
