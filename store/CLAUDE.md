# store - Zustand 상태 관리

**생성일**: 2024-11-22
**Phase**: 1 - 프롬프트 관리 인프라

## 📌 목적
Zustand를 사용한 글로벌 상태 관리. 프롬프트 버전과 파이프라인 실행 상태를 관리합니다.

## 📁 파일 목록

### `promptStore.ts`
프롬프트 버전 관리 스토어

#### 상태:
- `prompts`: Phase별 프롬프트 버전 목록
- `activePromptIds`: Phase별 활성 프롬프트 ID
- `loading`: 로딩 상태
- `error`: 에러 메시지

#### 주요 액션:
- `setPrompts()`: 프롬프트 목록 설정
- `addPrompt()`: 새 프롬프트 추가
- `updatePrompt()`: 프롬프트 수정
- `deletePrompt()`: 프롬프트 삭제
- `setActivePrompt()`: 활성 프롬프트 설정
- `getActivePrompt()`: 활성 프롬프트 조회

#### 특징:
- LocalStorage에 자동 저장 (persist middleware)
- Phase별로 프롬프트 버전 관리
- 활성 프롬프트 자동 선택

### `pipelineStore.ts`
파이프라인 실행 상태 관리 스토어

#### 상태:
- `currentPhase`: 현재 실행 중인 Phase
- `uploadedImage`: 업로드된 이미지 (Base64)
- `results`: Phase 1-7 실행 결과
- `executing`: Phase별 실행 상태
- `errors`: Phase별 에러 메시지

#### 주요 액션:
- `setCurrentPhase()`: 현재 Phase 설정
- `setUploadedImage()`: 이미지 업로드
- `setPhaseResult()`: Phase 결과 저장
- `setExecuting()`: 실행 상태 설정
- `setError()`: 에러 설정
- `reset()`: 전체 초기화
- `resetFromPhase()`: 특정 Phase부터 초기화

#### 특징:
- LocalStorage에 자동 저장
- Phase 결과 캐싱
- 부분 재실행 지원 (resetFromPhase)

## 🔧 사용 예시

```typescript
import { usePromptStore } from '@/store/promptStore'
import { usePipelineStore } from '@/store/pipelineStore'

// 프롬프트 관리
const { prompts, activePromptIds, addPrompt } = usePromptStore()

// 파이프라인 실행
const { currentPhase, results, setPhaseResult } = usePipelineStore()

// Phase 1 결과 저장
setPhaseResult(1, {
  normalization: {
    imageBounds: { width: 1000, height: 800, unit: 'px' },
    origin: { x: 0, y: 0 },
    status: 'Coordinates established',
  },
})
```

## 💡 설계 포인트

### 1. 데이터 지속성
LocalStorage를 통해 새로고침 시에도 데이터 유지

### 2. 타입 안정성
TypeScript로 모든 상태와 액션 타입 정의

### 3. 최적화
- `partialize`로 필요한 상태만 저장
- Phase별로 독립적인 상태 관리

## 🚀 다음 작업
- 실행 결과 히스토리 관리
- 비교 분석을 위한 스토어 추가
