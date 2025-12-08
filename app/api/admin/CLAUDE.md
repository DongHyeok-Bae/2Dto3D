# app/api/admin - 관리자 API

**생성일**: 2024-11-22
**Phase**: 1 - 프롬프트 관리 인프라

## 📌 목적
관리자 전용 API 엔드포인트. 프롬프트 관리, 실행 결과 조회, 비교 분석 기능 제공

## 📁 API 엔드포인트

### `/api/admin/prompts`
프롬프트 버전 CRUD

#### GET - 프롬프트 목록 조회
```typescript
GET /api/admin/prompts?phase=1

Response:
{
  success: true,
  phase: 1,
  versions: [
    {
      url: "...",
      pathname: "prompts/phase1/v1.0.0.md",
      size: 1024,
      uploadedAt: "2024-11-22T10:00:00Z"
    }
  ]
}
```

#### POST - 새 프롬프트 생성
```typescript
POST /api/admin/prompts

Body:
{
  phaseNumber: 1,
  version: "1.0.0",
  content: "프롬프트 내용...",
  isActive: true
}

Response:
{
  success: true,
  prompt: {
    id: "uuid",
    url: "...",
    phaseNumber: 1,
    version: "1.0.0",
    isActive: true,
    createdAt: "...",
    updatedAt: "..."
  }
}
```

#### DELETE - 프롬프트 삭제
```typescript
DELETE /api/admin/prompts?url=https://...

Response:
{
  success: true,
  message: "Prompt deleted successfully"
}
```

## 🔒 보안 (Phase 9 구현 완료)
- ✅ **미들웨어 인증**: `/admin/*` 경로는 `middleware.ts`에서 보호
- ✅ **세션 기반**: httpOnly 쿠키로 세션 관리
- ✅ **인증 API**: `/api/auth/login`, `/api/auth/logout`
- **참고**: API 엔드포인트 자체는 미들웨어 범위 외이므로 필요시 개별 인증 추가 가능

### `/api/admin/analytics` ✅ (Phase 8)
분석 데이터 조회 API

#### GET - 분석 데이터 조회
```typescript
GET /api/admin/analytics?range=7d

Response:
{
  success: true,
  environment: "local" | "vercel",
  data: {
    summary: {
      avgDau: number,
      totalApiCalls: number,
      avgResponseTime: number,
      successRate: number
    },
    daily: DailyAnalytics[]
  }
}
```

#### 쿼리 파라미터:
- `range`: 조회 기간 (기본: 7d)
  - `1d`: 1일
  - `7d`: 7일
  - `14d`: 14일
  - `30d`: 30일

## 🚀 다음 작업
- `execute/` - 프롬프트 테스트 실행 API
- `compare/` - 프롬프트 버전 비교 API
- 인증/권한 시스템
