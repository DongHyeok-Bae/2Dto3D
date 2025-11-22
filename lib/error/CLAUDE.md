# lib/error - 에러 핸들링 유틸리티

**생성일**: 2024-11-22
**Phase**: 3 - AI 파이프라인 구현

## 📌 목적
API 에러 처리 및 일관된 에러 응답

## 📁 파일 구조

### `handlers.ts`
커스텀 에러 클래스 및 응답 핸들러

## 🎯 에러 클래스

### `APIError`
기본 API 에러 (statusCode, code 포함)

```typescript
throw new APIError('에러 메시지', 500, 'ERROR_CODE')
```

### `ValidationError`
입력 검증 실패 (400 Bad Request)

```typescript
throw new ValidationError('검증 실패', ['field1: 필수 값', 'field2: 잘못된 형식'])
```

### `GeminiError`
Gemini API 호출 실패 (500 Internal Server Error)

```typescript
throw new GeminiError('Gemini API 호출 실패')
```

### `PromptNotFoundError`
프롬프트를 찾을 수 없음 (404 Not Found)

```typescript
throw new PromptNotFoundError(1) // Phase 1 프롬프트 없음
```

## 🔧 응답 함수

### `errorResponse(error)`
에러를 적절한 HTTP 응답으로 변환

**응답 형식:**
```typescript
{
  error: string        // 에러 메시지
  code?: string        // 에러 코드
  errors?: string[]    // 검증 에러 목록
}
```

### `successResponse(data, status)`
성공 응답 생성

## 🚀 사용 예시

```typescript
import { errorResponse, successResponse, ValidationError } from '@/lib/error/handlers'

export async function POST(request: NextRequest) {
  try {
    // 로직
    if (!imageBase64) {
      throw new ValidationError('이미지가 필요합니다.')
    }

    return successResponse({ result: data })
  } catch (error) {
    return errorResponse(error)
  }
}
```

## 📋 다음 작업
- 에러 로깅
- Sentry 통합
- 에러 추적 ID
