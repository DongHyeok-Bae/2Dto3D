/**
 * Storage Admin API
 *
 * 메모리 저장소 정보 조회
 * - 프롬프트 저장소 (promptStorage)
 * - 실행 결과 저장소 (resultStorage)
 */

import { NextRequest } from 'next/server'
import { promptStorage } from '@/lib/prompt-storage'

export async function GET(request: NextRequest) {
  try {
    // 프롬프트 저장소 통계
    const promptStats = promptStorage.getStats()

    // 모든 프롬프트 조회
    const allPrompts = []
    for (let phase = 1; phase <= 7; phase++) {
      const phasePrompts = promptStorage.getByPhase(phase)
      allPrompts.push({
        phase,
        prompts: phasePrompts.map(p => ({
          id: p.id,
          version: p.version,
          isActive: p.isActive,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          contentLength: p.content.length,
          contentPreview: p.content.substring(0, 200) + '...',
        }))
      })
    }

    return Response.json({
      success: true,
      data: {
        prompts: {
          stats: promptStats,
          byPhase: allPrompts,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Storage API] Error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
