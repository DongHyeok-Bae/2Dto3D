# components/upload - 이미지 업로드 컴포넌트

**생성일**: 2024-11-22
**Phase**: 4 - 사용자 인터페이스 개발

## 📌 목적
도면 이미지 업로드 및 검증

## 📁 컴포넌트

### `ImageUploader.tsx`
드래그 앤 드롭 지원 이미지 업로더

#### Props:
```typescript
{
  onImageUpload: (imageBase64: string, metadata: any) => void
  maxSize?: number       // 최대 파일 크기 (기본: 10MB)
  accept?: string        // 허용 형식
}
```

#### 주요 기능:
- 드래그 앤 드롭 지원
- 파일 선택 (input)
- 이미지 검증 (형식, 크기, 해상도)
- Base64 변환
- 메타데이터 추출
- 미리보기
- 에러 처리

#### 검증 규칙:
- 지원 형식: PNG, JPEG, WebP
- 최대 크기: 10MB
- 최소 해상도: 100x100px

## 🎨 UI 특징

- Crimson 테두리 (드래그 시)
- Gradient Royal 아이콘
- 반응형 레이아웃
- 로딩 상태 표시
- 에러 메시지

## 🚀 사용 예시

```typescript
<ImageUploader
  onImageUpload={(base64, metadata) => {
    console.log('이미지 업로드:', metadata)
  }}
/>
```

## 📋 다음 작업
- 멀티 이미지 업로드
- 크롭 기능
- 회전 보정
