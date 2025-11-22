# app/(main)/service - 메인 서비스 페이지

**생성일**: 2024-11-22
**Phase**: 4 - 사용자 인터페이스 개발

## 📌 목적
2Dto3D 서비스 메인 작업 공간

## 📁 페이지 구조

### `page.tsx`
이미지 업로드 → AI 분석 → 결과 확인 통합 페이지

## 🎯 주요 기능

### 3단계 워크플로우

#### 1. 이미지 업로드
- `ImageUploader` 컴포넌트
- 드래그 앤 드롭 지원
- 이미지 검증
- 자동 전처리 (리사이징, 대비 조정)

#### 2. AI 분석 실행
- `PhaseRunner` 컴포넌트
- Phase 1-7 순차 실행
- 진행 상황 실시간 표시
- 에러 핸들링

#### 3. 결과 확인
- `ResultViewer` 컴포넌트
- Phase별 결과 시각화
- 구조화 / Raw JSON 보기

## 🎨 레이아웃

### Header
- 서비스 제목
- "새 프로젝트" 버튼 (리셋)

### Tab Navigation
- 1. 이미지 업로드
- 2. AI 분석 실행
- 3. 결과 확인

### 2-Column Grid
**Left (lg:col-span-2):**
- 현재 탭 컨텐츠

**Right (lg:col-span-1):**
- 이미지 미리보기 (sticky)
- 메타데이터 (해상도, 크기, 형식)
- 처리 옵션

## 🔄 상태 관리

### Local State
```typescript
const [uploadedImage, setUploadedImage] = useState<string | null>(null)
const [imageMetadata, setImageMetadata] = useState<any>(null)
const [activeTab, setActiveTab] = useState<'upload' | 'pipeline' | 'results'>('upload')
```

### Zustand Store
```typescript
const { setUploadedImage, resetFromPhase } = usePipelineStore()
```

## 📋 워크플로우

1. **이미지 업로드**
   - 사용자가 이미지 업로드
   - `validateImage()` 검증
   - `preprocessImage()` 전처리
     - 최대 2048×2048 리사이징
     - 대비 1.2x 조정
   - Store에 저장
   - 자동으로 "AI 분석" 탭 이동

2. **AI 분석**
   - "전체 실행" 또는 "단독 실행" 선택
   - Phase 1-7 순차 실행
   - 각 Phase 결과 Store에 저장
   - 완료 시 "결과 확인" 탭으로 자동 이동

3. **결과 확인**
   - Phase 탭 선택
   - 구조화 / Raw JSON 보기
   - 결과 다운로드 (예정)

## 🚀 사용 흐름

```typescript
사용자 이미지 업로드
  ↓
이미지 검증 & 전처리
  ↓
파이프라인 탭 자동 이동
  ↓
"전체 실행" 클릭
  ↓
Phase 1-7 순차 실행
  ↓
결과 탭 자동 이동
  ↓
결과 확인 & 다운로드
```

## 📋 다음 작업
- 프로젝트 저장/불러오기
- 히스토리 관리
- 3D 뷰어 통합
- 내보내기 기능 (IFC, Revit)
