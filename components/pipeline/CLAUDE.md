# components/pipeline - 파이프라인 실행 컴포넌트

**생성일**: 2024-11-22
**Phase**: 4 - 사용자 인터페이스 개발
**최종 수정**: 2024-11-27 (6단계 파이프라인 축소)

## 📌 목적
Phase 1-6 AI 파이프라인 실행 및 진행 상황 표시

## 📁 컴포넌트

### `PhaseRunner.tsx`
순차적 Phase 실행 및 상태 관리

#### Props:
```typescript
{
  imageBase64: string                   // 처리할 이미지
  onComplete?: (results: any) => void   // 완료 콜백
}
```

#### 주요 기능:

**실행 모드:**
- 전체 실행: Phase 1-6 순차 실행
- 단독 실행: 개별 Phase만 실행

**상태 관리:**
- pending: 대기 중
- running: 실행 중
- completed: 완료
- error: 실패

**진행 표시:**
- Phase별 상태 아이콘
- 진행률 바
- 실시간 업데이트
- 에러 메시지

#### API 통합:
```typescript
// Phase 1-5
POST /api/pipeline/phase{N}
{
  imageBase64,
  promptVersion,
  previousResults
}

// Phase 6 (Master JSON)
POST /api/pipeline/phase6
{
  allResults: { phase1-5 }
}
```

## 🎨 UI 특징

- Phase 카드 레이아웃
- 상태별 색상 코딩:
  - 대기: Gray
  - 실행: Crimson (애니메이션)
  - 완료: Emerald
  - 실패: Red
- Gradient Royal 진행률 바
- 실시간 상태 업데이트

## 🔄 실행 흐름

1. Phase 1 실행 → 결과 저장
2. Phase 2 실행 (Phase 1 결과 포함) → 결과 저장
3. Phase 3-5 순차 실행
4. Phase 6 Master JSON 생성 (Phase 1-5 결과 종합)

## 🚀 사용 예시

```typescript
<PhaseRunner
  imageBase64={uploadedImage}
  onComplete={(results) => {
    console.log('파이프라인 완료:', results)
    // 결과 페이지로 이동
  }}
/>
```

## 📋 다음 작업
- 일시정지/재개 기능
- 특정 Phase부터 재실행
- WebSocket 실시간 업데이트
- 에러 복구 옵션
