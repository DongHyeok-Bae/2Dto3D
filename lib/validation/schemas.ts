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

// ==================== Phase 6: Confidence ====================
export const phase6Schema = z.object({
  verification: z.object({
    overallConfidence: z.number(),
    issues: z.array(
      z.object({
        phase: z.number(),
        severity: z.enum(['critical', 'warning', 'info']),
        description: z.string(),
        suggestion: z.string().optional(),
      })
    ),
    corrections: z
      .array(
        z.object({
          phase: z.number(),
          field: z.string(),
          oldValue: z.any(),
          newValue: z.any(),
          reason: z.string(),
        })
      )
      .optional(),
  }),
  userFeedback: z
    .object({
      approved: z.boolean(),
      comments: z.string().optional(),
      corrections: z.any().optional(),
    })
    .optional(),
})

export type Phase6Result = z.infer<typeof phase6Schema>

// ==================== Phase 7: Master JSON ====================
export const masterJSONSchema = z.object({
  metadata: z.object({
    projectName: z.string().optional(),
    version: z.string(),
    createdAt: z.string(),
    unit: z.string(),
    floorLevel: z.string().optional(),
  }),
  coordinateSystem: z.object({
    origin: z.object({ x: z.number(), y: z.number() }),
    scale: z.number(),
    rotation: z.number(),
  }),
  building: z.object({
    walls: z.array(z.any()),
    columns: z.array(z.any()).optional(),
    doors: z.array(z.any()),
    windows: z.array(z.any()),
    spaces: z.array(z.any()),
  }),
  dimensions: z.object({
    totalArea: z.number(),
    totalVolume: z.number().optional(),
    wallLength: z.number(),
  }),
  verification: z.object({
    confidence: z.number(),
    issues: z.array(z.any()),
  }),
})

export type MasterJSON = z.infer<typeof masterJSONSchema>

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
  6: phase6Schema,
  7: masterJSONSchema,
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
