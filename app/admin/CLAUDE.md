# app/admin - 관리자 대시보드 페이지

**생성일**: 2024-11-22
**최종 수정**: 2024-12-08
**Phase**: 2 - 관리자 대시보드, Phase 9 - 인증 시스템

## 📌 목적
프롬프트 관리, 실행 결과 조회, 성능 분석을 위한 관리자 인터페이스

## 🔒 접근 제어 (Phase 9)
- **로그인 필수**: `/admin/*` 경로는 인증된 사용자만 접근 가능
- **미들웨어**: `middleware.ts`에서 세션 쿠키 검증
- **미인증 시**: `/login`으로 자동 리다이렉트

## 📁 페이지 구조

```
app/admin/
├── layout.tsx           # 관리자 레이아웃 (네비게이션)
├── page.tsx             # 대시보드 홈
├── prompts/
│   ├── page.tsx         # 프롬프트 목록
│   └── [phase]/
│       └── page.tsx     # Phase별 편집 페이지
├── results/             # 실행 결과 (예정)
└── analytics/
    └── page.tsx         # 성능 분석 대시보드 ✅
```

## 🎨 UI 디자인

### 레이아웃
- 상단 네비게이션: Primary Navy 배경
- 로고 및 메뉴
- 최대 너비: 7xl
- **로그아웃 버튼**: 네비게이션 오른쪽에 위치 (Phase 9)

### 페이지
- **대시보드 홈**: 빠른 통계 + 카드형 메뉴
- **프롬프트 목록**: 7개 Phase 카드
- **프롬프트 편집**: Monaco Editor + 저장 기능

## 🔧 주요 기능

### 프롬프트 관리
- Phase별 프롬프트 조회
- Monaco Editor로 편집
- 버전 관리 (v1.0.0)
- Blob Storage에 저장

### 빠른 통계
- 총 프롬프트 버전
- 실행 횟수
- 평균 실행 시간
- 성공률

## 📊 성능 분석 페이지 (Phase 8) ✅

### `analytics/page.tsx`
성능 분석 대시보드

#### 기능:
- DAU 평균, 총 API 호출, 평균 응답 시간, 성공률 통계
- DAU 라인 차트 (Recharts LineChart)
- API 호출 바 차트 (Recharts BarChart)
- Phase별 사용 현황 파이 차트 (Recharts PieChart)
- 에러율 추이 라인 차트
- 기간 선택 (7일/14일/30일)

#### 사용 컴포넌트:
- `@/components/analytics` (VisitorChart, ApiCallChart, PhaseUsageChart, ErrorRateChart)

## 🚀 다음 작업
- 실행 결과 페이지
- 비교 분석 도구
