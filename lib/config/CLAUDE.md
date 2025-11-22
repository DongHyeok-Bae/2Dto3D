# lib/config - 설정 및 외부 서비스 연동

**생성일**: 2024-11-22
**Phase**: 1 - 프롬프트 관리 인프라

## 📌 목적
외부 서비스(Vercel Blob Storage, Edge Config 등)와의 연동 및 앱 설정 관리

## 📁 파일 목록

### `blob-storage.ts`
Vercel Blob Storage 관리 유틸리티

#### 주요 함수:
- `uploadPrompt()`: 프롬프트 파일 업로드
- `listPromptVersions()`: 프롬프트 버전 목록 조회
- `deletePrompt()`: 프롬프트 삭제
- `saveExecutionResult()`: 실행 결과 저장
- `listExecutionResults()`: 실행 결과 목록 조회
- `uploadTestImage()`: 테스트 이미지 업로드

#### 저장 구조:
```
Blob Storage/
├── prompts/
│   ├── phase1/
│   │   ├── v1.0.0.md
│   │   ├── v1.1.0.md
│   │   └── v2.0.0.md
│   ├── phase2/
│   └── ...
├── results/
│   ├── phase1/
│   │   ├── v1.0.0/
│   │   │   ├── 2024-11-22T10-30-00.json
│   │   │   └── 2024-11-22T11-00-00.json
│   │   └── v1.1.0/
│   └── ...
└── test-images/
    ├── test-001.png
    └── test-002.png
```

## 🔧 사용 예시

```typescript
import { uploadPrompt, listPromptVersions } from '@/lib/config/blob-storage'

// 프롬프트 업로드
const url = await uploadPrompt(1, '1.0.0', promptContent, {
  version: '1.0.0',
  phaseNumber: 1,
  isActive: true,
})

// 버전 목록 조회
const versions = await listPromptVersions(1)
```

## 🚀 다음 작업
- Edge Config 연동 (실시간 프롬프트 업데이트)
- 프롬프트 캐싱 전략 구현
