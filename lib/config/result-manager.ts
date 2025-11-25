/**
 * 실행 결과 통합 관리 레이어
 * 환경에 따라 메모리 또는 Blob Storage 사용
 */

import { getStorageEnvironment, logStorageEnvironment } from './environment'
import { saveExecutionResult as saveToBlobStorage } from './blob-storage'

// 로컬 환경용 메모리 결과 저장소
class ResultStorage {
  private static instance: ResultStorage
  private storage: Map<string, any>

  private constructor() {
    this.storage = new Map()
    console.log('[ResultStorage] Initialized')
  }

  static getInstance(): ResultStorage {
    if (!ResultStorage.instance) {
      ResultStorage.instance = new ResultStorage()
    }
    return ResultStorage.instance
  }

  save(phaseNumber: number, promptVersion: string, result: any, metadata: any): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const key = `phase${phaseNumber}/${promptVersion}/${timestamp}`

    this.storage.set(key, {
      result,
      metadata,
      savedAt: new Date().toISOString(),
    })

    console.log(`[ResultStorage] Saved to memory: ${key}`)
    return key
  }

  get(key: string): any {
    return this.storage.get(key)
  }

  getAll(): any[] {
    return Array.from(this.storage.values())
  }

  getByPhase(phaseNumber: number): any[] {
    const results: any[] = []
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`phase${phaseNumber}/`)) {
        results.push({ key, ...value })
      }
    }
    return results
  }
}

export const resultStorage = ResultStorage.getInstance()

/**
 * 실행 결과 저장 (환경 자동 감지)
 *
 * @param phaseNumber - Phase 번호 (1-7)
 * @param promptVersion - 프롬프트 버전
 * @param result - 실행 결과 데이터
 * @param metadata - 추가 메타데이터
 * @returns 저장된 위치 (로컬: key, Vercel: URL)
 */
export async function saveExecutionResult(
  phaseNumber: number,
  promptVersion: string,
  result: any,
  metadata: any = {}
): Promise<string> {
  const env = getStorageEnvironment()
  logStorageEnvironment()

  if (env === 'local') {
    // 로컬: 메모리 저장소
    return resultStorage.save(phaseNumber, promptVersion, result, metadata)
  } else {
    // Vercel: Blob Storage
    return await saveToBlobStorage(phaseNumber, promptVersion, result, metadata)
  }
}

/**
 * 특정 Phase의 모든 결과 조회 (로컬 전용)
 * Vercel 환경에서는 별도 API 구현 필요
 */
export function getExecutionResults(phaseNumber: number): any[] {
  return resultStorage.getByPhase(phaseNumber)
}
