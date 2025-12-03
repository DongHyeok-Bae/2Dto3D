# Phase 선수 조건 시스템 구현 계획

## 1. 현재 상태 분석

### 1.1 현재 코드 구조

**PhaseRunner.tsx (components/pipeline/PhaseRunner.tsx)**
- `PHASES` 배열: 6개 Phase 정의 (number, name, description)
- `phaseStatuses`: useMemo로 계산된 파생 상태 (pending/running/completed/error)
- `runSinglePhase`: 단독 실행 함수 - 현재 `disabled={isRunning}`만 체크

**pipelineStore.ts (store/pipelineStore.ts)**
- `PipelineState` 인터페이스: results, metadata, executing, errors 상태 포함
- `initialState`: 모든 상태를 빈 객체로 초기화
- `resetFromPhase`: results와 metadata만 초기화 (errors 누락!)

### 1.2 현재 문제점

1. **선수 조건 체크 없음**: `runSinglePhase` 버튼이 `isRunning`만 체크
2. **초기화 불완전**: `resetFromPhase`가 `errors` 상태를 초기화하지 않음
3. **선수 Phase 표시 없음**: UI에 선수 조건 충족 여부 시각화 없음

---

## 2. Phase 의존성 정의

### 2.1 의존성 상수 정의 (새 파일 또는 기존 파일에 추가)

```typescript
// lib/constants/phaseDependencies.ts 또는 PhaseRunner.tsx 상단

export const PHASE_DEPENDENCIES: Record<number, number[]> = {
  1: [],           // Phase 1: 의존성 없음 (이미지만 필요)
  2: [1],          // Phase 2: Phase 1 필요
  3: [1, 2],       // Phase 3: Phase 1-2 필요
  4: [1, 2, 3],    // Phase 4: Phase 1-3 필요
  5: [1, 2, 3, 4], // Phase 5: Phase 1-4 필요
  6: [1, 2, 3, 4, 5], // Phase 6: Phase 1-5 필요 (이미지 불필요)
}

// Phase 6은 이미지 없이 실행 가능
export const PHASES_REQUIRING_IMAGE = [1, 2, 3, 4, 5]
```

### 2.2 확장된 PHASES 배열

```typescript
const PHASES = [
  { number: 1, name: 'Normalization', description: '좌표계 설정', requiresImage: true },
  { number: 2, name: 'Structure', description: '구조 추출', requiresImage: true },
  { number: 3, name: 'Openings', description: '개구부 인식', requiresImage: true },
  { number: 4, name: 'Spaces', description: '공간 분석', requiresImage: true },
  { number: 5, name: 'Dimensions', description: '치수 계산', requiresImage: true },
  { number: 6, name: 'Master JSON', description: '최종 BIM JSON 생성', requiresImage: false },
]
```

---

## 3. 선수 조건 체크 함수 설계

### 3.1 Store에 헬퍼 함수 추가 (pipelineStore.ts)

```typescript
// PipelineState 인터페이스에 추가
interface PipelineState {
  // ... 기존 필드
  
  // 새 헬퍼 함수
  canExecutePhase: (phaseNumber: number) => boolean
  getPrerequisiteStatus: (phaseNumber: number) => PrerequisiteStatus
}

interface PrerequisiteStatus {
  canExecute: boolean
  completedPrereqs: number[]
  missingPrereqs: number[]
  requiresImage: boolean
  hasImage: boolean
}
```

### 3.2 선수 조건 체크 로직

```typescript
// store에 추가
canExecutePhase: (phaseNumber: number) => {
  const state = get()
  const dependencies = PHASE_DEPENDENCIES[phaseNumber] || []
  
  // 모든 선수 Phase가 completed 상태인지 확인
  const allPrereqsCompleted = dependencies.every(dep => {
    const phaseKey = `phase${dep}` as keyof typeof state.results
    return state.results[phaseKey] !== undefined
  })
  
  // 이미지 필요 여부 확인 (Phase 1-5)
  const requiresImage = PHASES_REQUIRING_IMAGE.includes(phaseNumber)
  const hasImage = !!state.uploadedImage
  
  return allPrereqsCompleted && (!requiresImage || hasImage)
}

getPrerequisiteStatus: (phaseNumber: number) => {
  const state = get()
  const dependencies = PHASE_DEPENDENCIES[phaseNumber] || []
  
  const completedPrereqs: number[] = []
  const missingPrereqs: number[] = []
  
  dependencies.forEach(dep => {
    const phaseKey = `phase${dep}` as keyof typeof state.results
    if (state.results[phaseKey]) {
      completedPrereqs.push(dep)
    } else {
      missingPrereqs.push(dep)
    }
  })
  
  const requiresImage = PHASES_REQUIRING_IMAGE.includes(phaseNumber)
  const hasImage = !!state.uploadedImage
  
  return {
    canExecute: missingPrereqs.length === 0 && (!requiresImage || hasImage),
    completedPrereqs,
    missingPrereqs,
    requiresImage,
    hasImage,
  }
}
```

### 3.3 PhaseRunner에서 사용

```typescript
// PhaseRunner.tsx에서
const { canExecutePhase, getPrerequisiteStatus } = usePipelineStore()

// 각 Phase에 대해
const prereqStatus = getPrerequisiteStatus(phase.number)
const canRun = canExecutePhase(phase.number) && !isRunning
```

---

## 4. UI 변경 사항 설계

### 4.1 선수 조건 체크마크 표시

각 Phase 카드에 선수 조건 상태 표시:

```tsx
{/* Prerequisites Status */}
<div className="flex items-center gap-1 mt-1">
  {PHASE_DEPENDENCIES[phase.number]?.map(dep => (
    <span 
      key={dep}
      className={`text-xs px-1.5 py-0.5 rounded ${
        results[`phase${dep}`] 
          ? 'bg-accent-emerald/20 text-accent-emerald' 
          : 'bg-neutral-warmGray/20 text-neutral-warmGray'
      }`}
      title={`Phase ${dep}: ${results[`phase${dep}`] ? '완료' : '미완료'}`}
    >
      P{dep} {results[`phase${dep}`] ? '✓' : '○'}
    </span>
  ))}
  
  {/* 이미지 필요 표시 (Phase 1-5) */}
  {PHASES_REQUIRING_IMAGE.includes(phase.number) && (
    <span 
      className={`text-xs px-1.5 py-0.5 rounded ${
        imageBase64 
          ? 'bg-accent-emerald/20 text-accent-emerald' 
          : 'bg-red-100 text-red-600'
      }`}
    >
      IMG {imageBase64 ? '✓' : '✗'}
    </span>
  )}
</div>
```

### 4.2 버튼 상태 변경

```tsx
{/* Action Button */}
<button
  onClick={() => runSinglePhase(phase.number)}
  disabled={!canExecutePhase(phase.number) || isRunning}
  className={`btn-secondary text-sm ${
    !canExecutePhase(phase.number) 
      ? 'opacity-50 cursor-not-allowed' 
      : ''
  }`}
  title={
    !canExecutePhase(phase.number) 
      ? `선수 조건: Phase ${PHASE_DEPENDENCIES[phase.number]?.join(', ') || 'None'} 완료 필요`
      : '단독 실행'
  }
>
  {phaseStatuses[phase.number] === 'completed' ? '재실행' : '단독 실행'}
</button>
```

### 4.3 전체 Phase 카드 스타일링

```tsx
<div
  key={phase.number}
  className={`
    card-hover flex items-center gap-4 p-4
    ${phaseStatuses[phase.number] === 'running' ? 'ring-2 ring-primary-crimson' : ''}
    ${!canExecutePhase(phase.number) && phaseStatuses[phase.number] !== 'completed' 
      ? 'opacity-60 bg-neutral-warmGray/5' 
      : ''}
  `}
>
```

---

## 5. 초기화 로직 수정

### 5.1 resetFromPhase 수정 (pipelineStore.ts)

```typescript
resetFromPhase: phase =>
  set(state => {
    const newResults = { ...state.results }
    const newMetadata = { ...state.metadata }
    const newErrors = { ...state.errors }  // 추가!

    // phase부터 이후 결과 모두 삭제 (6단계 파이프라인)
    for (let i = phase; i <= 6; i++) {
      delete newResults[`phase${i}` as keyof typeof newResults]
      delete newMetadata[`phase${i}` as keyof typeof newMetadata]
      newErrors[i] = null  // 추가! 에러 상태도 초기화
    }

    return {
      results: newResults,
      metadata: newMetadata,
      errors: newErrors,  // 추가!
      currentPhase: phase - 1,
    }
  }),
```

### 5.2 clearAll 수정 확인

현재 `clearAll`은 `initialState`를 사용하며, `initialState.errors = {}`이므로 정상 동작합니다.

```typescript
clearAll: () => {
  set(initialState)  // errors: {} 포함됨
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pipeline-storage')
  }
},
```

---

## 6. 구체적인 코드 변경 위치

### 6.1 store/pipelineStore.ts

| 위치 | 변경 내용 |
|------|----------|
| 상단 import 후 | `PHASE_DEPENDENCIES`, `PHASES_REQUIRING_IMAGE` 상수 추가 |
| PipelineState 인터페이스 | `canExecutePhase`, `getPrerequisiteStatus` 함수 시그니처 추가 |
| usePipelineStore 내부 | `canExecutePhase`, `getPrerequisiteStatus` 구현 추가 |
| resetFromPhase 함수 | `errors` 상태 초기화 로직 추가 |

### 6.2 components/pipeline/PhaseRunner.tsx

| 위치 | 변경 내용 |
|------|----------|
| usePipelineStore destructuring | `canExecutePhase`, `getPrerequisiteStatus` 추가 |
| PHASES 배열 또는 상단 | `PHASE_DEPENDENCIES` import 또는 정의 |
| Phase 카드 JSX | 선수 조건 체크마크 UI 추가 |
| 단독 실행 버튼 | `disabled` 조건에 `canExecutePhase` 추가 |
| 버튼 텍스트 | completed일 때 "재실행" 표시 |

---

## 7. 구현 순서 (Step-by-Step)

### Step 1: 상수 정의
1. `store/pipelineStore.ts` 상단에 `PHASE_DEPENDENCIES` 상수 정의
2. `PHASES_REQUIRING_IMAGE` 상수 정의

### Step 2: Store 타입 확장
1. `PipelineState` 인터페이스에 `canExecutePhase`, `getPrerequisiteStatus` 추가
2. `PrerequisiteStatus` 타입 정의

### Step 3: Store 함수 구현
1. `canExecutePhase` 함수 구현
2. `getPrerequisiteStatus` 함수 구현

### Step 4: 초기화 버그 수정
1. `resetFromPhase`에 `errors` 초기화 로직 추가

### Step 5: PhaseRunner UI 수정
1. Store에서 새 함수 import
2. 선수 조건 체크마크 UI 추가
3. 버튼 disabled 조건 수정
4. 버튼 텍스트 동적 변경 ("단독 실행" / "재실행")
5. Phase 카드 스타일링 (실행 불가 시 opacity 감소)

### Step 6: 테스트
1. Phase 1만 실행 가능한지 확인 (초기 상태)
2. Phase 1 완료 후 Phase 2 활성화 확인
3. 초기화 후 버튼 상태 정상 리셋 확인
4. 재실행 기능 정상 동작 확인

---

## 8. 예상 결과 화면

```
┌──────────────────────────────────────────────────────┐
│ Phase 1: Normalization                               │
│ 좌표계 설정                                            │
│ [IMG ✓]                              [재실행]         │
├──────────────────────────────────────────────────────┤
│ Phase 2: Structure                          ✓ 완료   │
│ 구조 추출                                             │
│ [P1 ✓] [IMG ✓]                       [재실행]         │
├──────────────────────────────────────────────────────┤
│ Phase 3: Openings                          ○ 대기    │
│ 개구부 인식                                           │
│ [P1 ✓] [P2 ✓] [IMG ✓]               [단독 실행]       │
├──────────────────────────────────────────────────────┤
│ Phase 4: Spaces                  (비활성 - opacity)   │
│ 공간 분석                                             │
│ [P1 ✓] [P2 ✓] [P3 ○] [IMG ✓]        [단독 실행] 🔒   │
└──────────────────────────────────────────────────────┘
```

---

## 9. 추가 고려사항

### 9.1 로컬/Vercel 호환성
- 현재 로직은 `results` 객체의 존재 여부만 체크
- 메모리 저장소와 Blob Storage 모두 동일한 Store 인터페이스 사용
- 추가 변경 불필요

### 9.2 에러 상태 처리
- Phase가 error 상태여도 선수 조건에서는 "미완료"로 처리
- 에러 발생 Phase는 재실행 가능하도록 버튼 활성화

### 9.3 재실행 시 후속 Phase 처리
- Phase N 재실행 시 Phase N+1 이후 결과는 무효화?
- **현재 설계**: 재실행만 허용, 후속 Phase는 자동 삭제 안 함
- **권장**: 사용자에게 확인 모달 표시 또는 후속 Phase 자동 리셋

---

## 10. 핵심 구현 파일

| 파일 | 변경 유형 | 주요 변경 내용 |
|------|----------|---------------|
| `store/pipelineStore.ts` | 수정 | 상수 추가, 헬퍼 함수 구현, resetFromPhase 버그 수정 |
| `components/pipeline/PhaseRunner.tsx` | 수정 | 선수 조건 UI, 버튼 상태 로직 |
| (선택) `lib/constants/pipeline.ts` | 신규 | 상수 분리 시 |

