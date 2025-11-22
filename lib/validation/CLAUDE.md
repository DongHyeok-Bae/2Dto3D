# lib/validation - JSON Schema 검증

**생성일**: 2024-11-22
**Phase**: 3 - AI 파이프라인 구현

## 📌 목적
Zod를 이용한 Phase별 응답 스키마 검증

## 📁 파일 구조

### `schemas.ts`
Phase 1-7 Zod Schema 정의 및 검증 함수

## 🎯 Schema 목록

### Phase 1: Normalization
```typescript
{
  coordinateSystem: {
    origin: { x, y },
    scale: { pixelsPerMeter, detectedUnit },
    rotation
  },
  floorPlanBounds: { topLeft, bottomRight },
  metadata: { confidence, notes }
}
```

### Phase 2: Structure
```typescript
{
  walls: [{ id, type, geometry, thickness, height, material }],
  columns: [{ id, position, shape, dimensions }],
  metadata: { totalWalls, totalColumns, confidence }
}
```

### Phase 3: Openings
```typescript
{
  doors: [{ id, wallId, type, position, width, height, swingDirection }],
  windows: [{ id, wallId, type, position, width, height, sillHeight }],
  metadata: { totalDoors, totalWindows, confidence }
}
```

### Phase 4: Spaces
```typescript
{
  spaces: [{ id, name, type, boundary, area, adjacentSpaces }],
  metadata: { totalSpaces, totalArea, confidence }
}
```

### Phase 5: Dimensions
```typescript
{
  dimensions: {
    walls: [{ wallId, length, thickness, height }],
    spaces: [{ spaceId, width, length, height, area, volume }],
    openings: [{ openingId, width, height }]
  },
  metadata: { unit, confidence }
}
```

### Phase 6: Confidence
```typescript
{
  verification: {
    overallConfidence,
    issues: [{ phase, severity, description, suggestion }],
    corrections: [{ phase, field, oldValue, newValue, reason }]
  },
  userFeedback: { approved, comments, corrections }
}
```

### Phase 7: Master JSON
```typescript
{
  metadata: { projectName, version, createdAt, unit, floorLevel },
  coordinateSystem: { origin, scale, rotation },
  building: { walls, columns, doors, windows, spaces },
  dimensions: { totalArea, totalVolume, wallLength },
  verification: { confidence, issues }
}
```

## 🔧 주요 함수

### `validatePhaseResult(phaseNumber, data)`
Phase 결과를 엄격하게 검증

**반환값:**
```typescript
{
  valid: boolean
  data?: any        // 검증된 데이터
  errors?: string[] // 에러 목록
}
```

### `validatePhaseResultPartial(phaseNumber, data)`
부분 검증 (Optional fields 허용)

## 🚀 사용 예시

```typescript
import { validatePhaseResult } from '@/lib/validation/schemas'

const validation = validatePhaseResult(1, geminiResponse)

if (validation.valid) {
  console.log('검증 성공:', validation.data)
} else {
  console.error('검증 실패:', validation.errors)
}
```

## 📋 다음 작업
- 커스텀 에러 메시지
- 다국어 지원
- 스키마 문서 자동 생성
