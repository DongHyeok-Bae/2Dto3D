# lib/image - 이미지 전처리 유틸리티

**생성일**: 2024-11-22
**Phase**: 3 - AI 파이프라인 구현

## 📌 목적
클라이언트 측 이미지 전처리 및 검증

## 📁 파일 구조

### `preprocessor.ts`
Canvas API 기반 이미지 전처리

#### 주요 함수:

**기본 처리:**
- `fileToBase64(file)`: File → Base64 변환
- `resizeImage(imageBase64, maxWidth, maxHeight)`: 이미지 리사이징
- `preprocessImage(imageBase64, options)`: 통합 전처리

**고급 처리:**
- `convertToGrayscale(imageBase64)`: 흑백 변환
- `adjustContrast(imageBase64, contrast)`: 대비 조정
- `adjustBrightness(imageBase64, brightness)`: 밝기 조정

**유틸리티:**
- `getImageMetadata(imageBase64)`: 메타데이터 추출
- `validateImage(file)`: 이미지 검증

## 🔧 사용 예시

```typescript
import { preprocessImage, validateImage } from '@/lib/image/preprocessor'

// 검증
const validation = await validateImage(file)
if (!validation.valid) {
  alert(validation.error)
  return
}

// 전처리
const base64 = await fileToBase64(file)
const processed = await preprocessImage(base64, {
  maxWidth: 2048,
  maxHeight: 2048,
  grayscale: true,
  contrast: 1.5,
})
```

## ⚙️ 전처리 옵션

### PreprocessOptions
```typescript
{
  maxWidth?: number        // 최대 너비 (기본: 2048)
  maxHeight?: number       // 최대 높이 (기본: 2048)
  quality?: number         // 품질 (0-1)
  format?: string          // 출력 포맷
  grayscale?: boolean      // 흑백 변환
  contrast?: number        // 대비 (1.0 = 원본)
  brightness?: number      // 밝기 (1.0 = 원본)
}
```

## ✅ 검증 규칙

- **지원 형식**: PNG, JPEG, WebP
- **최대 크기**: 10MB
- **최소 해상도**: 100x100px

## 🚀 다음 작업
- 노이즈 제거 필터
- 엣지 감지 (Canny, Sobel)
- 자동 회전 보정
