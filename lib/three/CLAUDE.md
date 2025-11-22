# lib/three - Three.js 씬 빌더

**생성일**: 2024-11-22
**Phase**: 5 - 3D 뷰어 구현

## 📌 목적
Master JSON을 Three.js 3D 씬으로 변환

## 📁 파일 구조

### `sceneBuilder.ts`
BIM JSON → Three.js Mesh 변환 유틸리티

## 🎯 주요 함수

### `buildSceneFromMasterJSON(masterJSON, options)`
Master JSON으로부터 완전한 3D 씬 생성

**Options:**
```typescript
{
  defaultHeight?: number     // 기본 층고 (2.7m)
  wallThickness?: number     // 기본 벽 두께 (0.15m)
  showSpaces?: boolean       // 공간 표시 (true)
  showFloor?: boolean        // 바닥 표시 (true)
  wireframe?: boolean        // 와이어프레임 (false)
}
```

**반환값:** `THREE.Group`

### 요소별 생성 함수

**벽 (`createWalls`)**
- BoxGeometry 사용
- 길이, 높이, 두께 계산
- 타입별 색상 (exterior/interior/loadBearing/partition)
- 위치 및 회전 적용

**기둥 (`createColumns`)**
- CylinderGeometry (circular) / BoxGeometry (rectangular)
- 형태별 처리 (circular/rectangular/H-beam/I-beam)

**문 (`createDoors`)**
- 얇은 BoxGeometry (0.05m)
- Emerald 색상
- 위치 설정

**창문 (`createWindows`)**
- 얇은 BoxGeometry (0.03m)
- Sapphire 색상
- 반투명 (opacity: 0.6)
- sillHeight 고려

**공간 (`createSpaces`)**
- ShapeGeometry (boundary 폴리곤)
- 타입별 색상 (bedroom/living/kitchen 등)
- 반투명 (opacity: 0.2)
- 바닥 위 0.01m

## 🎨 색상 팔레트

```typescript
COLORS = {
  wall: {
    exterior: 0x9a212d,    // Crimson
    interior: 0x8b8680,    // Warm Gray
    loadBearing: 0x1a2b50, // Navy
    partition: 0xc5a059,   // Gold
  },
  door: 0x00a86b,          // Emerald
  window: 0x0066cc,        // Sapphire
  space: {
    bedroom: 0xffc1cc,
    living: 0xc5e1a5,
    kitchen: 0xffe082,
    // ...
  },
  column: 0x2c2c2c,        // Charcoal
  floor: 0xf9fafb,         // Marble White
}
```

## 🔧 헬퍼 함수

### `addLights(scene)`
씬에 조명 추가:
- AmbientLight (0.6)
- DirectionalLight (0.8, 그림자)
- HemisphereLight (0.3)

### `addGridHelper(scene, size)`
바닥 그리드 헬퍼 추가

### `addAxesHelper(scene, size)`
XYZ 축 헬퍼 추가

### `centerGroup(group)`
모델을 중심으로 이동 (Y축 제외)

## 🚀 사용 예시

```typescript
import { buildSceneFromMasterJSON, addLights } from '@/lib/three/sceneBuilder'

const group = buildSceneFromMasterJSON(masterJSON, {
  defaultHeight: 2.7,
  showSpaces: true,
  showFloor: true,
})

scene.add(group)
addLights(scene)
```

## 📋 개선 사항
- 텍스처 적용
- LOD (Level of Detail)
- 복잡한 형태 지원 (곡선 벽 등)
- IFC 내보내기
