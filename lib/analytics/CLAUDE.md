# lib/analytics - 분석 모듈

**생성일**: 2024-12-08
**Phase**: 8 - 관리자 대시보드 분석 기능

## 📌 목적
DAU, API 호출 수, Phase별 사용 현황, 에러율 등 분석 데이터 수집 및 저장

## 📁 파일 목록

### `analytics-storage.ts`
Vercel Blob Storage 기반 분석 데이터 저장소

#### 주요 함수:
- `getDailyAnalytics(date)` - 일별 데이터 조회 (없으면 생성)
- `saveDailyAnalytics(data)` - 일별 데이터 저장
- `getAnalyticsRange(days)` - 기간별 데이터 조회
- `calculateSummary(dailyData)` - 요약 통계 계산

#### 환경별 저장소:
- **로컬**: `globalThis` 메모리 Map (HMR 안전)
- **Vercel**: Blob Storage (`analytics/daily/YYYY-MM-DD.json`)

### `api-tracker.ts`
서버 사이드 API 호출 추적기

#### 주요 함수:
- `trackApiCall(params)` - 일반 API 호출 추적
- `createPipelineTracker(phase)` - Phase별 추적기 팩토리

#### 추적 데이터:
- 엔드포인트, 메서드, 상태 코드
- 응답 시간, Phase 번호
- 성공/실패 카운트

### `visitor-tracker.ts`
클라이언트 사이드 방문자 추적기

#### 주요 함수:
- `trackVisit()` - 페이지 방문 기록
- `getVisitorId()` - 고유 방문자 ID 생성/조회

#### 특징:
- localStorage 기반 방문자 ID 영속화
- UUID v4 기반 고유 ID 생성

## 🔧 데이터 구조

```typescript
interface DailyAnalytics {
  date: string                    // "2024-12-08"
  visitors: {
    total: number                 // 총 방문 수
    unique: number                // DAU (순 방문자)
    visitorIds: string[]          // 고유 ID 목록
  }
  apiCalls: {
    total: number
    byEndpoint: Record<string, number>
    byPhase: Record<number, number>
    errors: number
    totalResponseTime: number
  }
  pipeline: {
    total: number
    successful: number
    failed: number
  }
  updatedAt: string
}
```

## 📋 보관 정책
- 30일 데이터 보관
- 자동 정리 (구현 예정)

## 🔧 사용 예시

```typescript
// API 추적 (서버)
import { createPipelineTracker } from '@/lib/analytics/api-tracker'

const tracker = createPipelineTracker(1) // Phase 번호
tracker.trackSuccess(responseTime)
tracker.trackError(responseTime)

// 방문 추적 (클라이언트)
import { trackVisit } from '@/lib/analytics/visitor-tracker'
trackVisit()
```
