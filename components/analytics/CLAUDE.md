# components/analytics - 분석 차트 컴포넌트

**생성일**: 2024-12-08
**Phase**: 8 - 관리자 대시보드 분석 기능

## 📌 목적
Recharts 기반 분석 데이터 시각화 컴포넌트

## 📁 컴포넌트 목록

### `VisitorChart.tsx`
DAU 라인 차트

#### Props:
- `data: DailyAnalytics[]` - 일별 분석 데이터

#### 특징:
- Recharts LineChart
- Primary Crimson (#9A212D) 색상
- 반응형 컨테이너
- 날짜별 순 방문자 수 표시

### `ApiCallChart.tsx`
API 호출 바 차트

#### Props:
- `data: DailyAnalytics[]` - 일별 분석 데이터

#### 특징:
- Recharts BarChart
- Primary Navy (#1A2B50) 색상
- 날짜별 총 API 호출 수 표시

### `PhaseUsageChart.tsx`
Phase별 사용 현황 파이 차트

#### Props:
- `data: DailyAnalytics[]` - 일별 분석 데이터

#### 특징:
- Recharts PieChart
- 6색 팔레트 (Phase 1-6)
- 전체 기간 Phase별 호출 비율 표시

### `ErrorRateChart.tsx`
에러율 추이 라인 차트

#### Props:
- `data: DailyAnalytics[]` - 일별 분석 데이터

#### 특징:
- Recharts LineChart
- Red (#DC2626) 색상
- 날짜별 에러율 (%) 표시

### `VisitTracker.tsx`
방문 추적 컴포넌트 (클라이언트 컴포넌트)

#### 특징:
- `'use client'` 지시문
- `useEffect`에서 `trackVisit()` 호출
- UI 없음 (`return null`)
- `app/layout.tsx`에서 사용

### `index.ts`
컴포넌트 배럴 파일

```typescript
export { default as VisitorChart } from './VisitorChart'
export { default as ApiCallChart } from './ApiCallChart'
export { default as PhaseUsageChart } from './PhaseUsageChart'
export { default as ErrorRateChart } from './ErrorRateChart'
```

## 🎨 색상 시스템

| 컴포넌트 | 색상 | 코드 |
|----------|------|------|
| VisitorChart | Crimson | #9A212D |
| ApiCallChart | Navy | #1A2B50 |
| PhaseUsageChart | 6색 팔레트 | - |
| ErrorRateChart | Red | #DC2626 |

## 📋 사용 예시

```typescript
import {
  VisitorChart,
  ApiCallChart,
  PhaseUsageChart,
  ErrorRateChart,
} from '@/components/analytics'

<VisitorChart data={dailyData} />
<ApiCallChart data={dailyData} />
<PhaseUsageChart data={dailyData} />
<ErrorRateChart data={dailyData} />
```
