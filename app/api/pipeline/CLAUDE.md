# app/api/pipeline - AI 파이프라인 API 엔드포인트

**생성일**: 2024-11-22
**Phase**: 3 - AI 파이프라인 구현
**최종 수정**: 2024-11-27 (6단계 파이프라인 축소)

## 📌 목적
Phase 1-6 AI 분석 API 제공

## 📁 폴더 구조

```
app/api/pipeline/
├── phase1/
│   └── route.ts      # Normalization (좌표계 설정)
├── phase2/
│   └── route.ts      # Structure (구조 추출)
├── phase3/
│   └── route.ts      # Openings (개구부 인식)
├── phase4/
│   └── route.ts      # Spaces (공간 분석)
├── phase5/
│   └── route.ts      # Dimensions (치수 계산)
└── phase6/
    └── route.ts      # Master JSON (최종 BIM JSON 생성)
```

## 🎯 API 공통 사항

### Request Body (Phase 1-5)
```typescript
{
  imageBase64: string         // Base64 이미지 (필수)
  promptVersion?: string      // 프롬프트 버전 (선택)
  previousResults?: any       // 이전 Phase 결과 (Phase 2-5)
}
```

### Response
```typescript
{
  success: boolean
  phase: number
  result: any                 // 검증된 결과
  resultUrl: string           // Blob Storage URL
  metadata: {
    promptVersion: string
    timestamp: string
    ...
  }
}
```

### Error Response
```typescript
{
  error: string
  code?: string
  errors?: string[]
}
```

## 📋 Phase별 특징

### Phase 1-5: 이미지 분석
- POST 메서드
- Gemini API 호출
- Schema 검증
- 결과 저장

### Phase 6: Master JSON 생성
- POST 메서드
- Phase 1-5 결과 종합
- 최종 BIM JSON 생성 (이미지 불필요)

**Request Body:**
```typescript
{
  promptVersion?: string
  allResults: {
    phase1: any
    phase2: any
    phase3: any
    phase4: any
    phase5: any
  }
}
```

## 🔧 처리 흐름

1. **입력 검증**: 필수 파라미터 확인
2. **프롬프트 로드**: Blob Storage에서 활성 프롬프트 가져오기
3. **Gemini API 호출**: 이미지 + 프롬프트 분석 (Phase 1-5) 또는 결과 종합 (Phase 6)
4. **Schema 검증**: Zod로 응답 검증
5. **결과 저장**: Blob Storage에 저장
6. **응답 반환**: 검증된 결과 + 메타데이터

## 🚀 사용 예시

```typescript
// Phase 1 호출
const response = await fetch('/api/pipeline/phase1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageBase64: '...',
    promptVersion: '1.0.0',
  }),
})

const data = await response.json()
console.log('Phase 1 결과:', data.result)

// Phase 6 호출 (Master JSON)
const phase6Response = await fetch('/api/pipeline/phase6', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    allResults: {
      phase1: {...},
      phase2: {...},
      phase3: {...},
      phase4: {...},
      phase5: {...},
    },
  }),
})
```

## 🔍 API 추적 통합 (Phase 8) ✅

Phase 1-6 API에 분석 추적 코드가 통합되었습니다.

### 사용 패턴
```typescript
import { createPipelineTracker } from '@/lib/analytics/api-tracker'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const tracker = createPipelineTracker(1) // Phase 번호

  try {
    // 기존 로직...
    tracker.trackSuccess(Date.now() - startTime)
    return successResponse(...)
  } catch (error) {
    tracker.trackError(Date.now() - startTime)
    return errorResponse(error)
  }
}
```

**특징:**
- 비동기 비차단 추적 (분석 실패가 본 기능에 영향 X)
- Phase별 호출 수, 성공/실패, 응답 시간 기록
- `/admin/analytics` 페이지에서 시각화

## 📋 다음 작업
- Rate limiting
- 응답 캐싱
- WebSocket 진행 상황 스트리밍
- 배치 처리 지원
