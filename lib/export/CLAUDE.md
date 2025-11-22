# lib/export - 데이터 내보내기 유틸리티

**생성일**: 2024-11-22
**Phase**: 6 - 편집 및 내보내기 기능

## 📌 목적
다양한 형식으로 BIM 데이터 내보내기 기능 제공

## 📁 파일 구조

### `dataExport.ts`
일반 데이터 내보내기 유틸리티

#### 주요 함수:

**JSON 내보내기:**
- `exportAsJSON()`: 모든 데이터를 JSON으로
- 들여쓰기 포함 (가독성)
- Master JSON, Phase 결과 모두 지원

**CSV 내보내기:**
- `exportWallsAsCSV()`: 벽 데이터
- `exportSpacesAsCSV()`: 공간 데이터
- `exportDoorsAsCSV()`: 문 데이터
- `exportWindowsAsCSV()`: 창문 데이터
- Excel 호환 형식

**IFC-like 내보내기:**
- `exportAsIFCLike()`: 간단한 BIM 교환 형식
- 텍스트 기반 (실제 IFC는 더 복잡)
- 프로젝트 메타데이터 포함

**프로젝트 내보내기:**
- `exportProject()`: 전체 프로젝트 데이터
- 이미지 + 모든 Phase 결과
- 메타데이터 포함

**이미지 내보내기:**
- `exportImage()`: Base64 → PNG 파일

### `modelExport.ts`
3D 모델 내보내기 유틸리티

#### 주요 함수:

**glTF/GLB 내보내기:**
```typescript
exportAsGLTF(masterJSON, {
  binary: true,  // GLB 형식
  includeCustomExtensions: false
})
```

**OBJ 내보내기:**
- `exportAsOBJ()`: Wavefront OBJ 형식
- 대부분의 3D 소프트웨어에서 지원

**STL 내보내기:**
- `exportAsSTL()`: 3D 프린팅용
- Binary/ASCII 옵션
- 공간 제외 (프린팅 최적화)

**스크린샷 캡처:**
```typescript
captureSceneAsImage(renderer, scene, camera, {
  width: 1920,
  height: 1080,
  format: 'png',
  quality: 0.95
})
```

**다운로드 캡처:**
- `downloadSceneCapture()`: 씬 캡처 후 자동 다운로드

**Collada 내보내기:**
- `exportAsColladaSimple()`: DAE XML 형식
- 간단한 구조 (실제 Collada는 더 복잡)

## 🎨 내보내기 형식

### 데이터 형식
```
JSON      - 완전한 데이터, API 교환
CSV       - 표 데이터, Excel 분석
IFC-like  - BIM 교환, 구조 정보
```

### 3D 형식
```
glTF/GLB  - 웹 기반 뷰어, 재질 포함
OBJ       - 범용 3D, 기하학 정보만
STL       - 3D 프린팅, 메쉬만
DAE       - Collada, XML 기반
```

## 🔧 사용 예시

### JSON 내보내기
```typescript
import { exportAsJSON } from '@/lib/export/dataExport'

exportAsJSON(masterJSON, 'bim_model')
// → bim_model.json 다운로드
```

### 3D 모델 내보내기
```typescript
import { exportAsGLTF } from '@/lib/export/modelExport'

await exportAsGLTF(masterJSON, { binary: true })
// → model_[timestamp].glb 다운로드
```

### 스크린샷 캡처
```typescript
import { downloadSceneCapture } from '@/lib/export/modelExport'

await downloadSceneCapture(
  renderer,
  scene,
  camera,
  'view_3d',
  { format: 'png' }
)
// → view_3d_[timestamp].png 다운로드
```

## 📋 다음 작업
- 실제 IFC 2x3 형식 지원
- DXF/DWG 내보내기
- 일괄 내보내기 (ZIP)
- 클라우드 저장 (Vercel Blob)
- WebP 이미지 형식 지원