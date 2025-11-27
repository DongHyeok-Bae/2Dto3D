/**
 * Zod Schema 검증
 *
 * Phase 1-7의 JSON 응답을 검증하는 스키마 정의
 */

import { z } from 'zod'

// ==================== Phase 1: Normalization ====================
export const phase1Schema = z.object({
  coordinateSystem: z.object({
    origin: z.object({
      x: z.number(),
      y: z.number(),
    }),
    scale: z.object({
      pixelsPerMeter: z.number(),
      detectedUnit: z.string(),
    }),
    rotation: z.number(),
  }),
  floorPlanBounds: z.object({
    topLeft: z.object({ x: z.number(), y: z.number() }),
    bottomRight: z.object({ x: z.number(), y: z.number() }),
  }),
  metadata: z.object({
    detectedFloorLevel: z.string().optional(),
    confidence: z.number(),
    notes: z.string().optional(),
  }),
})

export type Phase1Result = z.infer<typeof phase1Schema>

// ==================== Phase 2: Structure ====================
export const phase2Schema = z.object({
  walls: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['exterior', 'interior', 'loadBearing', 'partition']),
      geometry: z.object({
        start: z.object({ x: z.number(), y: z.number() }),
        end: z.object({ x: z.number(), y: z.number() }),
      }),
      thickness: z.number(),
      height: z.number().optional(),
      material: z.string().optional(),
    })
  ),
  columns: z
    .array(
      z.object({
        id: z.string(),
        position: z.object({ x: z.number(), y: z.number() }),
        shape: z.enum(['rectangular', 'circular', 'H-beam', 'I-beam']),
        dimensions: z.object({
          width: z.number(),
          depth: z.number().optional(),
        }),
      })
    )
    .optional(),
  metadata: z.object({
    totalWalls: z.number(),
    totalColumns: z.number().optional(),
    confidence: z.number(),
  }),
})

export type Phase2Result = z.infer<typeof phase2Schema>

// ==================== Phase 3: Openings ====================
export const phase3Schema = z.object({
  doors: z.array(
    z.object({
      id: z.string(),
      wallId: z.string(),
      type: z.enum(['single', 'double', 'sliding', 'folding']),
      position: z.object({ x: z.number(), y: z.number() }),
      width: z.number(),
      height: z.number(),
      swingDirection: z.enum(['left', 'right', 'both', 'none']).optional(),
    })
  ),
  windows: z.array(
    z.object({
      id: z.string(),
      wallId: z.string(),
      type: z.enum(['fixed', 'casement', 'sliding', 'awning']),
      position: z.object({ x: z.number(), y: z.number() }),
      width: z.number(),
      height: z.number(),
      sillHeight: z.number().optional(),
    })
  ),
  metadata: z.object({
    totalDoors: z.number(),
    totalWindows: z.number(),
    confidence: z.number(),
  }),
})

export type Phase3Result = z.infer<typeof phase3Schema>

// ==================== Phase 4: Spaces ====================
export const phase4Schema = z.object({
  spaces: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum([
        'bedroom',
        'living',
        'kitchen',
        'bathroom',
        'corridor',
        'storage',
        'balcony',
        'other',
      ]),
      boundary: z.array(z.object({ x: z.number(), y: z.number() })),
      area: z.number(),
      adjacentSpaces: z.array(z.string()).optional(),
    })
  ),
  metadata: z.object({
    totalSpaces: z.number(),
    totalArea: z.number(),
    confidence: z.number(),
  }),
})

export type Phase4Result = z.infer<typeof phase4Schema>

// ==================== Phase 5: Dimensions ====================
export const phase5Schema = z.object({
  dimensions: z.object({
    walls: z.array(
      z.object({
        wallId: z.string(),
        length: z.number(),
        thickness: z.number(),
        height: z.number(),
      })
    ),
    spaces: z.array(
      z.object({
        spaceId: z.string(),
        width: z.number(),
        length: z.number(),
        height: z.number(),
        area: z.number(),
        volume: z.number(),
      })
    ),
    openings: z.array(
      z.object({
        openingId: z.string(),
        width: z.number(),
        height: z.number(),
      })
    ),
  }),
  metadata: z.object({
    unit: z.string(),
    confidence: z.number(),
  }),
})

export type Phase5Result = z.infer<typeof phase5Schema>

// ==================== Phase 6: Master JSON (기존 Phase 7) ====================
// Phase 6 (Human-in-the-loop Validation) 삭제됨
// Phase 7 (Master JSON Assembly)가 Phase 6으로 승격됨

// 3D 좌표 스키마 (mm 단위)
const point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
})

// 메타데이터 스키마
const phase6MetadataSchema = z.object({
  sourceType: z.string(),
  extractionMethod: z.string(),
  scaleConfidence: z.number(),
})

// 레벨 스키마
const levelSchema = z.object({
  levelName: z.string(),
  elevation: z.number(),
})

// 슬라브 스키마
const slabSchema = z.object({
  id: z.string(),
  level: z.string(),
  footprint: z.array(point3DSchema),
  thickness: z.number(),
})

// 벽 스키마
const phase6WallSchema = z.object({
  id: z.string(),
  level: z.string(),
  start: point3DSchema,
  end: point3DSchema,
  height: z.number(),
  thickness: z.number(),
})

// 문 스키마
const phase6DoorSchema = z.object({
  id: z.string(),
  position: point3DSchema,
  width: z.number(),
  height: z.number(),
})

// 창문 스키마
const phase6WindowSchema = z.object({
  id: z.string(),
  position: point3DSchema,
  width: z.number(),
  height: z.number(),
  sillHeight: z.number(),
})

// 개구부 스키마
const phase6OpeningsSchema = z.object({
  doors: z.array(phase6DoorSchema),
  windows: z.array(phase6WindowSchema),
})

// 공간 스키마 (필드명 통일: boundary, type)
const phase6SpaceSchema = z.object({
  id: z.string(),
  type: z.string(),
  boundary: z.array(point3DSchema),
})

// 컴포넌트 스키마
const componentsSchema = z.object({
  slabs: z.array(slabSchema),
  walls: z.array(phase6WallSchema),
  openings: phase6OpeningsSchema,
  spaces: z.array(phase6SpaceSchema),
})

// Phase 6 전체 스키마 (Master JSON)
export const phase6Schema = z.object({
  metadata: phase6MetadataSchema,
  levels: z.array(levelSchema),
  components: componentsSchema,
})

export type Phase6Result = z.infer<typeof phase6Schema>

// MasterJSON은 phase6Schema의 alias (하위 호환성)
export const masterJSONSchema = phase6Schema
export type MasterJSON = z.infer<typeof phase6Schema>

// ==================== 검증 함수 ====================

/**
 * Phase별 스키마 매핑
 */
const schemaMap = {
  1: phase1Schema,
  2: phase2Schema,
  3: phase3Schema,
  4: phase4Schema,
  5: phase5Schema,
  6: phase6Schema, // Phase 6 = Master JSON Assembly
}

/**
 * Phase 결과 검증
 */
export function validatePhaseResult(
  phaseNumber: number,
  data: any
): { valid: boolean; data?: any; errors?: string[] } {
  const schema = schemaMap[phaseNumber as keyof typeof schemaMap]
  if (!schema) {
    return {
      valid: false,
      errors: [`Invalid phase number: ${phaseNumber}`],
    }
  }

  try {
    const validated = schema.parse(data)
    return {
      valid: true,
      data: validated,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    }
  }
}

/**
 * Phase 결과 부분 검증 (Optional fields 허용)
 */
export function validatePhaseResultPartial(
  phaseNumber: number,
  data: any
): { valid: boolean; data?: any; errors?: string[] } {
  const schema = schemaMap[phaseNumber as keyof typeof schemaMap]
  if (!schema) {
    return {
      valid: false,
      errors: [`Invalid phase number: ${phaseNumber}`],
    }
  }

  try {
    const partialSchema = schema.partial()
    const validated = partialSchema.parse(data)
    return {
      valid: true,
      data: validated,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    }
  }
}

/**
 * Safe Validation: 검증 실패해도 원본 데이터 반환
 * Phase 1-5에서 사용 (프롬프트 실험 허용)
 *
 * @param phaseNumber - Phase 번호 (1-6)
 * @param data - 검증할 데이터
 * @returns 항상 데이터 반환 (원본 또는 검증된 데이터)
 */
export function validatePhaseResultSafe(
  phaseNumber: number,
  data: any
): {
  valid: boolean
  data: any // 항상 데이터 반환 (원본 또는 검증된 데이터)
  validatedData?: any // 검증 성공 시에만 존재
  errors?: string[]
  warning?: boolean // 검증 실패 시 true
} {
  const schema = schemaMap[phaseNumber as keyof typeof schemaMap]

  if (!schema) {
    console.warn(`⚠️ [Phase ${phaseNumber}] Invalid phase number, storing raw data`)
    return {
      valid: false,
      data, // 원본 그대로 반환
      warning: true,
      errors: [`Invalid phase number: ${phaseNumber}`],
    }
  }

  try {
    const validated = schema.parse(data)
    return {
      valid: true,
      data: validated, // 검증된 데이터
      validatedData: validated,
    }
  } catch (error) {
    // 검증 실패해도 원본 데이터 반환
    const errors =
      error instanceof z.ZodError
        ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        : ['Unknown validation error']

    console.warn(`⚠️ [Phase ${phaseNumber}] Validation failed but storing raw data:`)
    console.warn(`   Errors: ${errors.join(', ')}`)
    console.warn(`   Raw data will be stored and passed to next phase`)

    return {
      valid: false,
      data, // 원본 그대로 반환
      warning: true,
      errors,
    }
  }
}
