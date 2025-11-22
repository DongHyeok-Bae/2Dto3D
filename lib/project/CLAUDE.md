# lib/project - 프로젝트 관리

**생성일**: 2024-11-22
**Phase**: 6 - 편집 및 내보내기 기능

## 📌 목적
프로젝트 저장, 불러오기, 버전 관리 기능 제공

## 📁 파일 구조

### `projectManager.ts`
프로젝트 데이터 관리 유틸리티

## 🎯 주요 기능

### 프로젝트 인터페이스

**ProjectData:**
```typescript
{
  id: string              // project_[timestamp]
  name: string            // 프로젝트 이름
  version: string         // 1.0.0
  createdAt: string       // ISO 날짜
  updatedAt: string       // ISO 날짜
  image: string | null    // Base64 이미지
  results: PipelineResults // Phase 1-7 결과
  metadata: {
    tool: string          // 2D to 3D BIM Converter
    organization: string  // Kyung Hee University
    author?: string
    description?: string
    tags?: string[]
  }
}
```

### 클라우드 저장 (Vercel Blob)

**저장:**
```typescript
await saveProjectToCloud({
  name: "My Project",
  version: "1.0.0",
  image: base64Image,
  results: pipelineResults,
  metadata: {...}
})
// → projects/project_[id]/data.json
```

**불러오기:**
```typescript
const project = await loadProjectFromCloud(projectId)
```

**목록 조회:**
```typescript
const projects = await listProjectsFromCloud()
// → 최신순 정렬된 프로젝트 메타데이터 배열
```

**삭제:**
```typescript
await deleteProjectFromCloud(projectId)
```

### 로컬 파일 관리

**파일로 저장:**
```typescript
saveProjectToFile({
  name: "My Project",
  version: "1.0.0",
  image,
  results,
  metadata
})
// → [name]_project_[id].2d3d 다운로드
```

**파일에서 불러오기:**
```typescript
const file = inputElement.files[0]
const project = await loadProjectFromFile(file)
```

### 프로젝트 버전 비교

```typescript
const comparison = compareProjectVersions(project1, project2)
// 반환값:
{
  differences: string[]  // 전체 차이점 요약
  added: string[]        // 추가된 Phase
  removed: string[]      // 제거된 Phase
  modified: string[]     // 수정된 Phase/메타데이터
}
```

### 프로젝트 템플릿

```typescript
const template = createProjectTemplate("New Project")
// → 빈 프로젝트 구조 생성
```

## 🔄 워크플로우

### 프로젝트 저장
1. Phase 실행 완료
2. 프로젝트 이름/설명 입력
3. `saveProjectToFile()` 또는 `saveProjectToCloud()`
4. .2d3d 파일 다운로드 또는 클라우드 URL 반환

### 프로젝트 불러오기
1. 파일 선택 또는 클라우드 목록에서 선택
2. `loadProjectFromFile()` 또는 `loadProjectFromCloud()`
3. Zustand Store에 데이터 로드
4. UI 업데이트

### 버전 관리
1. 프로젝트 여러 버전 저장
2. `compareProjectVersions()`로 비교
3. 차이점 확인
4. 필요시 병합 또는 선택

## 🎨 파일 형식

**.2d3d 파일:**
- JSON 형식
- 전체 프로젝트 데이터 포함
- Base64 이미지 내장
- 모든 Phase 결과 포함
- 메타데이터 포함

**폴더 구조 (Blob Storage):**
```
projects/
  project_12345/
    data.json       # 프로젝트 데이터
    thumbnail.png   # 썸네일 (선택)
```

## 🚀 사용 예시

### 프로젝트 저장
```typescript
import { saveProjectToFile } from '@/lib/project/projectManager'
import { usePipelineStore } from '@/store/pipelineStore'

const { uploadedImage, results } = usePipelineStore.getState()

saveProjectToFile({
  name: "강남 아파트 102동",
  version: "1.0.0",
  image: uploadedImage,
  results,
  metadata: {
    tool: "2D to 3D BIM Converter",
    organization: "Kyung Hee University",
    description: "102동 3층 평면도 분석",
    tags: ["apartment", "residential"]
  }
})
```

### 프로젝트 불러오기
```typescript
const handleFileSelect = async (e) => {
  const file = e.target.files[0]
  const project = await loadProjectFromFile(file)

  // Store 업데이트
  store.setUploadedImage(project.image)
  Object.entries(project.results).forEach(([phase, result]) => {
    store.setPhaseResult(parseInt(phase.replace('phase', '')), result)
  })
}
```

## 📋 개선 사항
- 프로젝트 압축 (gzip)
- 증분 저장 (변경사항만)
- 자동 저장
- 버전 히스토리
- 협업 기능 (권한 관리)