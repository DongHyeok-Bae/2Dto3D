# components/results - 결과 뷰어 컴포넌트

**생성일**: 2024-11-22
**Phase**: 4 - 사용자 인터페이스 개발
**최종 수정**: 2024-11-27 (6단계 파이프라인 축소)

## 📌 목적
Phase별 실행 결과 시각화 및 표시

## 📁 컴포넌트

### `ResultViewer.tsx`
Phase 결과 시각화 및 비교

#### 주요 기능:

**보기 모드:**
- 구조화 (Formatted): Phase별 커스텀 렌더링
- Raw JSON: 원본 JSON 표시

**Phase별 렌더링:**

1. **Phase 1: Normalization**
   - 좌표계 정보
   - 도면 범위
   - 신뢰도

2. **Phase 2: Structure**
   - 벽 목록 (ID, 타입, 두께)
   - 기둥 목록
   - 총 개수

3. **Phase 3: Openings**
   - 문 개수
   - 창문 개수
   - 신뢰도

4. **Phase 4: Spaces**
   - 공간 목록 (이름, 타입, 면적)
   - 총 면적
   - 신뢰도

5. **Phase 5: Dimensions**
   - 치수 통계
   - 단위
   - 신뢰도

6. **Phase 6: Master JSON**
   - 프로젝트 메타데이터
   - 건물 요소 통계 (벽, 문, 창문, 공간)
   - 총 면적/벽 길이
   - 신뢰도

## 🎨 UI 구성

### Header
- 제목
- 보기 모드 토글 (구조화 / Raw JSON)

### Phase Tabs
- Gradient Royal 활성 탭
- 완료된 Phase만 표시

### 결과 카드
- Section별 그룹화
- Label-Value 레이아웃
- 색상 코딩 (severity)

## 🔧 Helper Components

### `Section`
섹션 제목 및 내용

```typescript
<Section title="좌표계">
  <Item label="원점" value="(0, 0)" />
  <Item label="스케일" value="100 px/m" />
</Section>
```

### `Item`
Label-Value 한 줄

```typescript
<Item label="신뢰도" value="95.3%" />
```

## 📊 데이터 소스

Zustand `pipelineStore`에서 결과 가져오기:
```typescript
const { results } = usePipelineStore()
const phase1Result = results.phase1
```

## 🚀 사용 예시

```typescript
<ResultViewer />
```

## 📋 다음 작업
- 결과 내보내기 (JSON, CSV)
- 결과 비교 (프롬프트 버전간)
- 그래프 시각화
- 3D 미리보기 연동
