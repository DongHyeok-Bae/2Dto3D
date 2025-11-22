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

## 🔒 보안
현재 인증 없음 (개발 초기 단계)
→ Phase 7에서 관리자 인증 추가 예정

## 🚀 다음 작업
- `execute/` - 프롬프트 테스트 실행 API
- `compare/` - 프롬프트 버전 비교 API
- 인증/권한 시스템
