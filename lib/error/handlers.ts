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
  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { errors: error.errors }),
      },
      { status: error.statusCode }
    )
  }

  // Unknown error
  console.error('Unexpected error:', error)
  return Response.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
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
