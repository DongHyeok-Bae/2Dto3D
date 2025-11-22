# components/viewer - 3D 뷰어 컴포넌트

**생성일**: 2024-11-22
**Phase**: 5 - 3D 뷰어 구현

## 📌 목적
Master JSON을 인터랙티브 3D 뷰어로 렌더링

## 📁 컴포넌트 구조

### `Viewer3D.tsx`
React Three Fiber 기반 3D 뷰어

#### Props:
```typescript
{
  masterJSON: MasterJSON | null
  showSpaces?: boolean      // 공간 표시 (기본: true)
  showFloor?: boolean       // 바닥 표시 (기본: true)
  showGrid?: boolean        // 그리드 표시 (기본: true)
  showAxes?: boolean        // 축 표시 (기본: false)
  wireframe?: boolean       // 와이어프레임 (기본: false)
}
```

#### 주요 기능:

**3D 렌더링:**
- Canvas (shadows, antialias)
- PerspectiveCamera (position: [10, 10, 10])
- OrbitControls (회전, 이동, 줌)

**조명:**
- AmbientLight (0.6)
- DirectionalLight (0.8, 그림자)
- HemisphereLight (0.3)

**인터랙션:**
- 객체 클릭 → 정보 표시
- userData에서 타입 및 데이터 추출
- 하단 카드에 상세 정보 표시

**컨트롤 가이드:**
- 회전: 좌클릭 드래그
- 이동: 우클릭 드래그
- 줌: 마우스 휠
- 선택: 객체 클릭

### `ViewerControls.tsx`
뷰어 옵션 컨트롤 패널

#### Props:
```typescript
{
  onOptionsChange: (options: ViewerOptions) => void
}
```

#### ViewerOptions:
```typescript
{
  showSpaces: boolean
  showFloor: boolean
  showGrid: boolean
  showAxes: boolean
  wireframe: boolean
}
```

#### 기능:

**토글 옵션:**
- 공간 표시
- 바닥 표시
- 그리드 표시
- 축 표시
- 와이어프레임 모드

**색상 범례:**
- 외벽, 내벽, 문, 창문, 파티션, 기둥

**UI 특징:**
- 접기/펼치기
- 체크박스 + 설명
- 색상 샘플

## 🎨 UI 구성

### Viewer3D
```
┌─────────────────────────────────┐
│   3D Canvas                     │
│   (Three.js Scene)              │
│                                 │
│   ┌─────────────────┐          │
│   │ 컨트롤 가이드   │ (우상단) │
│   └─────────────────┘          │
│                                 │
│   ┌─────────────────┐          │
│   │ 선택 정보       │ (하단)   │
│   └─────────────────┘          │
└─────────────────────────────────┘
```

### ViewerControls
```
┌─────────────────┐
│ 뷰어 설정 ∧    │
├─────────────────┤
│ □ 공간 표시     │
│ □ 바닥 표시     │
│ □ 그리드 표시   │
│ □ 축 표시       │
│ □ 와이어프레임  │
├─────────────────┤
│ 색상 범례       │
│ ■ 외벽          │
│ ■ 내벽          │
│ ...             │
└─────────────────┘
```

## 🔄 동작 흐름

1. **초기 렌더링**
   - masterJSON 체크
   - buildSceneFromMasterJSON() 호출
   - 씬에 추가

2. **옵션 변경**
   - ViewerControls에서 토글
   - onOptionsChange 콜백
   - useEffect로 씬 재생성

3. **객체 클릭**
   - onClick 이벤트
   - userData 추출
   - setSelectedObject
   - 하단 카드 표시

## 🚀 사용 예시

```typescript
<Viewer3D
  masterJSON={results.phase7}
  showSpaces={true}
  showFloor={true}
  showGrid={true}
  showAxes={false}
  wireframe={false}
/>
```

```typescript
<ViewerControls
  onOptionsChange={(options) => {
    setViewerOptions(options)
  }}
/>
```

## 📋 다음 작업
- 스크린샷 캡처
- 카메라 시점 저장/불러오기
- 측정 도구
- 단면 뷰
- glTF/OBJ 내보내기
