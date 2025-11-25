// 로컬 개발 환경에서 프롬프트 파일을 자동으로 로드하는 유틸리티

import fs from 'fs/promises'
import path from 'path'
import { promptStorage } from '@/lib/prompt-storage'
import { getStorageEnvironment } from './environment'

// 중복 초기화 방지를 위한 Promise 캐싱
// Next.js HMR 시 모듈이 재로드되어도 초기화가 진행 중이면 동일한 Promise를 반환합니다.
let initPromise: Promise<void> | null = null

/**
 * 로컬 환경에서 lib/ai/prompts/*.md 파일을 메모리 저장소에 자동으로 로드합니다.
 * - 서버 재시작 시 프롬프트 파일의 변경사항이 자동 반영됩니다.
 * - 프로덕션 환경(Vercel Blob Storage)에서는 실행되지 않습니다.
 * - 중복 호출 시 동일한 Promise를 반환하여 한 번만 실행됩니다.
 */
export async function initializeLocalPrompts(): Promise<void> {
  // 이미 초기화가 진행 중이거나 완료된 경우 동일한 Promise 반환
  if (initPromise) {
    return initPromise
  }

  // 초기화 Promise 생성 및 캐싱
  initPromise = (async () => {
    // 프로덕션 환경(Vercel Blob Storage)에서는 실행하지 않음
    const env = getStorageEnvironment()
    if (env !== 'local') {
      console.log('[PromptLoader] Skipping local prompt loading (production mode)')
      return
    }

    console.log('[PromptLoader] Initializing local prompts...')

    const promptsDir = path.join(process.cwd(), 'lib', 'ai', 'prompts')
    const version = '1.0.0' // 기본 버전

    let loadedCount = 0
    let failedCount = 0

    // Phase 1~7의 프롬프트 파일 로드
    for (let phase = 1; phase <= 7; phase++) {
      const filePath = path.join(promptsDir, `phase${phase}.md`)

      try {
        // 파일 존재 여부 확인
        await fs.access(filePath)

        // 파일 내용 읽기
        const content = await fs.readFile(filePath, 'utf-8')

        // 메모리 저장소에 저장
        promptStorage.save(phase, version, content, {
          id: `phase${phase}_v${version}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        loadedCount++
        console.log(`[PromptLoader] ✓ Phase ${phase} loaded (${content.length} chars)`)
      } catch (error: any) {
        failedCount++
        if (error.code === 'ENOENT') {
          console.warn(`[PromptLoader] ⚠ Phase ${phase} file not found: ${filePath}`)
        } else {
          console.error(`[PromptLoader] ✗ Phase ${phase} load failed:`, error.message)
        }
      }
    }

    console.log(`[PromptLoader] Initialization complete: ${loadedCount} loaded, ${failedCount} failed`)

    // 저장소 통계 출력
    const stats = promptStorage.getStats()
    console.log('[PromptLoader] Storage stats:', stats)
  })()

  return initPromise
}

/**
 * 초기화 상태를 리셋합니다. (테스트용)
 * 다음 호출 시 프롬프트를 다시 로드합니다.
 */
export function resetInitialization(): void {
  initPromise = null
  console.log('[PromptLoader] Initialization promise reset')
}
