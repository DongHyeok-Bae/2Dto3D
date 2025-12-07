/**
 * 프롬프트 통합 관리 레이어
 * 환경에 따라 메모리 또는 Blob Storage 사용
 */

import { getStorageEnvironment, logStorageEnvironment } from './environment'
import { promptStorage } from '@/lib/prompt-storage'
import { list } from '@vercel/blob'
import fs from 'fs/promises'
import path from 'path'

// Vercel Blob Storage에서 활성 버전을 추적하기 위한 마커 파일 경로
const getActiveMarkerPath = (phaseNumber: number) => `prompts/phase${phaseNumber}/.active`

/**
 * Vercel Blob Storage에서 활성 버전 조회
 */
async function getActiveVersionFromMarker(phaseNumber: number): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: getActiveMarkerPath(phaseNumber) })
    if (blobs.length === 0) return null

    const response = await fetch(blobs[0].url)
    if (!response.ok) return null

    const version = (await response.text()).trim()
    return version || null
  } catch (error) {
    console.warn(`[PromptManager] Failed to read active marker for Phase ${phaseNumber}:`, error)
    return null
  }
}

/**
 * Vercel Blob Storage에 활성 버전 마커 저장
 */
async function setActiveVersionMarker(phaseNumber: number, version: string): Promise<boolean> {
  try {
    const { put } = await import('@vercel/blob')
    await put(getActiveMarkerPath(phaseNumber), version, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'text/plain',
    })
    console.log(`[PromptManager] Set active marker for Phase ${phaseNumber}: v${version}`)
    return true
  } catch (error) {
    console.error(`[PromptManager] Failed to set active marker for Phase ${phaseNumber}:`, error)
    return false
  }
}

export interface PromptVersion {
  id: string
  key: string
  phaseNumber: number
  version: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  url?: string  // Blob Storage URL (Vercel만)
}

/**
 * 로컬 파일 시스템에서 프롬프트 읽기 (Fallback용)
 * Blob Storage가 비어있거나 메모리에 프롬프트가 없을 때 사용
 */
async function readLocalPromptFile(phaseNumber: number): Promise<{ content: string; version: string } | null> {
  try {
    const filePath = path.join(process.cwd(), 'lib', 'ai', 'prompts', `phase${phaseNumber}.md`)
    const content = await fs.readFile(filePath, 'utf-8')
    console.log(`[PromptManager] Fallback to local file for Phase ${phaseNumber}`)
    return { content, version: '1.0.0' }
  } catch (error) {
    console.warn(`[PromptManager] Failed to read local file fallback for Phase ${phaseNumber}:`, error)
    return null
  }
}

/**
 * 프롬프트 저장 (환경 자동 감지)
 */
export async function savePrompt(
  phaseNumber: number,
  version: string,
  content: string,
  metadata: {
    id: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
): Promise<{ key?: string; url?: string }> {
  const env = getStorageEnvironment()
  logStorageEnvironment()

  if (env === 'local') {
    // 로컬: 메모리 저장소
    // isActive: true로 저장할 경우, 다른 버전들은 비활성화
    if (metadata.isActive) {
      const existingPrompts = promptStorage.getByPhase(phaseNumber)
      existingPrompts.forEach(p => {
        if (p.isActive) {
          p.isActive = false
        }
      })
    }

    const key = promptStorage.save(phaseNumber, version, content, metadata)
    console.log(`[PromptManager] Saved to memory: ${key}`)
    return { key }
  } else {
    // Vercel: Blob Storage
    const { put } = await import('@vercel/blob')
    const fileName = `prompts/phase${phaseNumber}/v${version}.md`

    const blob = await put(fileName, content, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'text/markdown',
    })

    // isActive: true로 저장할 경우, 마커 파일 업데이트
    if (metadata.isActive) {
      await setActiveVersionMarker(phaseNumber, version)
    }

    console.log(`[PromptManager] Saved to Blob: ${blob.url}`)
    return { url: blob.url }
  }
}

/**
 * 프롬프트 목록 조회
 */
export async function listPrompts(phaseNumber: number): Promise<PromptVersion[]> {
  const env = getStorageEnvironment()

  if (env === 'local') {
    // 로컬: 메모리 저장소
    return promptStorage.getByPhase(phaseNumber)
  } else {
    // Vercel: Blob Storage
    const { blobs } = await list({ prefix: `prompts/phase${phaseNumber}/` })

    // 마커 파일에서 활성 버전 조회
    const activeVersion = await getActiveVersionFromMarker(phaseNumber)

    // .active 마커 파일 제외하고 필터링
    const promptBlobs = blobs.filter(blob => !blob.pathname.endsWith('.active'))

    // Blob 메타데이터를 PromptVersion 형식으로 변환
    const prompts = await Promise.all(
      promptBlobs.map(async (blob) => {
        const response = await fetch(blob.url)
        const content = await response.text()

        // pathname에서 버전 추출: prompts/phase1/v1.0.0.md
        const versionMatch = blob.pathname.match(/v(\d+\.\d+\.\d+)/)
        const version = versionMatch ? versionMatch[1] : '1.0.0'

        // 마커 파일에 기록된 버전과 일치하면 활성화
        // 마커가 없으면 첫 번째(가장 최신) 버전을 활성화
        const isActive = activeVersion ? version === activeVersion : false

        return {
          id: blob.pathname,
          key: blob.pathname,
          phaseNumber,
          version,
          content,
          isActive,
          createdAt: new Date(blob.uploadedAt).toISOString(),
          updatedAt: new Date(blob.uploadedAt).toISOString(),
          url: blob.url,
        }
      })
    )

    // 마커가 없고 프롬프트가 있으면 최신 버전을 활성화
    if (!activeVersion && prompts.length > 0) {
      // 버전 정렬하여 최신 찾기
      const sorted = [...prompts].sort((a, b) => {
        const vA = a.version.split('.').map(Number)
        const vB = b.version.split('.').map(Number)
        for (let i = 0; i < 3; i++) {
          if (vA[i] > vB[i]) return -1
          if (vA[i] < vB[i]) return 1
        }
        return 0
      })
      sorted[0].isActive = true
    }

    return prompts
  }
}

/**
 * 최신 프롬프트 조회
 * "latest" 문자열 또는 undefined를 최신 버전으로 처리
 */
export async function getLatestPrompt(
  phaseNumber: number,
  specificVersion?: string
): Promise<{ content: string; version: string } | null> {
  const env = getStorageEnvironment()

  // "latest" 문자열 또는 undefined인 경우 최신 버전 조회
  const shouldGetLatest = !specificVersion || specificVersion === 'latest'

  if (env === 'local') {
    // 로컬: 메모리 저장소
    if (!shouldGetLatest) {
      // 특정 버전 요청
      const key = promptStorage.getKey(phaseNumber, specificVersion)
      const prompt = promptStorage.get(key)

      // 디버깅 로그
      if (process.env.DEBUG_GEMINI === 'true') {
        console.log(`[PromptManager] Phase ${phaseNumber} - Requested version: "${specificVersion}"`)
        console.log(`[PromptManager] Looking for key: "${key}"`)
        console.log(`[PromptManager] Found: ${prompt ? 'YES ✅' : 'NO ❌'}`)
      }

      if (!prompt) {
        return await readLocalPromptFile(phaseNumber)
      }
      return { content: prompt.content, version: prompt.version }
    }

    // 최신 버전 조회
    const latestPrompt = promptStorage.getLatestByPhase(phaseNumber)

    // 디버깅 로그
    if (process.env.DEBUG_GEMINI === 'true') {
      console.log(`[PromptManager] Phase ${phaseNumber} - Getting LATEST version`)
      console.log(`[PromptManager] Latest version found: ${latestPrompt?.version || 'NONE ❌'}`)
      if (latestPrompt) {
        console.log(`[PromptManager] Prompt length: ${latestPrompt.content.length} chars`)
        if (process.env.DEBUG_LOG_PROMPTS === 'true') {
          console.log(`[PromptManager] Prompt preview:`)
          console.log(latestPrompt.content.substring(0, 200) + '...\n')
        }
      }
    }

    if (!latestPrompt) {
      return await readLocalPromptFile(phaseNumber)
    }
    return { content: latestPrompt.content, version: latestPrompt.version }

  } else {
    // Vercel: Blob Storage
    if (!shouldGetLatest) {
      // 특정 버전 요청
      const { blobs } = await list({ prefix: `prompts/phase${phaseNumber}/v${specificVersion}` })

      if (process.env.DEBUG_GEMINI === 'true') {
        console.log(`[PromptManager] Phase ${phaseNumber} - Requested version: "${specificVersion}"`)
        console.log(`[PromptManager] Blob search prefix: "prompts/phase${phaseNumber}/v${specificVersion}"`)
        console.log(`[PromptManager] Found blobs: ${blobs.length}`)
      }

      if (blobs.length === 0) {
        console.log(`[PromptManager] Phase ${phaseNumber} v${specificVersion} not in Blob. Trying local fallback...`)
        return await readLocalPromptFile(phaseNumber)
      }

      const response = await fetch(blobs[0].url)
      const content = await response.text()

      if (process.env.DEBUG_GEMINI === 'true') {
        console.log(`[PromptManager] Loaded from Blob: ${blobs[0].url}`)
        console.log(`[PromptManager] Content length: ${content.length} chars`)
      }

      return { content, version: specificVersion }
    }

    // 최신 버전 조회
    const { blobs } = await list({ prefix: `prompts/phase${phaseNumber}/` })

    if (blobs.length === 0) {
      console.log(`[PromptManager] No prompts in Blob for Phase ${phaseNumber}. Trying local fallback...`)
      return await readLocalPromptFile(phaseNumber)
    }

    // 최신 버전 정렬
    const latestBlob = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]

    const response = await fetch(latestBlob.url)
    const content = await response.text()

    const versionMatch = latestBlob.pathname.match(/v(\d+\.\d+\.\d+)/)
    const version = versionMatch ? versionMatch[1] : 'latest'

    if (process.env.DEBUG_GEMINI === 'true') {
      console.log(`[PromptManager] Phase ${phaseNumber} - Getting LATEST version from Blob`)
      console.log(`[PromptManager] Latest version: ${version}`)
      console.log(`[PromptManager] Blob URL: ${latestBlob.url}`)
      console.log(`[PromptManager] Content length: ${content.length} chars`)
    }

    return { content, version }
  }
}

/**
 * 프롬프트 삭제
 */
export async function deletePrompt(keyOrUrl: string): Promise<boolean> {
  const env = getStorageEnvironment()

  if (env === 'local') {
    // 로컬: 메모리 저장소 (key 사용)
    return promptStorage.delete(keyOrUrl)
  } else {
    // Vercel: Blob Storage (URL 사용)
    const { del } = await import('@vercel/blob')
    await del(keyOrUrl)
    console.log(`[PromptManager] Deleted from Blob: ${keyOrUrl}`)
    return true
  }
}

/**
 * 프롬프트 버전 수정
 */
export async function updatePromptVersion(
  phaseNumber: number,
  oldKeyOrUrl: string,
  newVersion: string
): Promise<{ success: boolean; newKey?: string; newUrl?: string; error?: string }> {
  const env = getStorageEnvironment()

  if (env === 'local') {
    // 로컬: 메모리 저장소
    const result = promptStorage.updateVersion(oldKeyOrUrl, newVersion)
    return result
  } else {
    // Vercel: Blob Storage - 새 파일 생성 후 기존 삭제
    try {
      // 기존 콘텐츠 가져오기
      const response = await fetch(oldKeyOrUrl)
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch existing prompt' }
      }
      const content = await response.text()

      // URL에서 phase 번호 추출 확인
      const phaseMatch = oldKeyOrUrl.match(/phase(\d+)/)
      const extractedPhase = phaseMatch ? parseInt(phaseMatch[1]) : phaseNumber

      // 새 버전 URL 패턴 확인 (중복 체크)
      const { blobs } = await list({ prefix: `prompts/phase${extractedPhase}/v${newVersion}` })
      if (blobs.length > 0) {
        return { success: false, error: 'Version already exists' }
      }

      // 새 파일 업로드
      const { put, del } = await import('@vercel/blob')
      const fileName = `prompts/phase${extractedPhase}/v${newVersion}.md`
      const blob = await put(fileName, content, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'text/markdown',
      })

      // 기존 파일 삭제
      await del(oldKeyOrUrl)

      console.log(`[PromptManager] Updated version in Blob: ${oldKeyOrUrl} -> ${blob.url}`)
      return { success: true, newUrl: blob.url }
    } catch (error) {
      console.error('[PromptManager] Failed to update version:', error)
      return { success: false, error: 'Failed to update version' }
    }
  }
}

/**
 * 특정 버전 활성화
 */
export async function setActivePrompt(
  phaseNumber: number,
  keyOrUrl: string
): Promise<{ success: boolean; error?: string }> {
  const env = getStorageEnvironment()

  if (env === 'local') {
    // 로컬: 메모리 저장소
    return promptStorage.setActiveVersion(phaseNumber, keyOrUrl)
  } else {
    // Vercel: .active 마커 파일에 활성 버전 기록
    try {
      // URL 또는 key에서 버전 추출
      const versionMatch = keyOrUrl.match(/v(\d+\.\d+\.\d+)/)
      const version = versionMatch ? versionMatch[1] : '1.0.0'

      // 마커 파일 업데이트
      const success = await setActiveVersionMarker(phaseNumber, version)
      if (!success) {
        return { success: false, error: 'Failed to update active marker' }
      }

      console.log(`[PromptManager] Activated in Blob: Phase ${phaseNumber} v${version}`)
      return { success: true }
    } catch (error) {
      console.error('[PromptManager] Failed to activate prompt:', error)
      return { success: false, error: 'Failed to activate prompt' }
    }
  }
}

/**
 * 활성 프롬프트 조회
 */
export async function getActivePrompt(
  phaseNumber: number
): Promise<PromptVersion | null> {
  const env = getStorageEnvironment()

  if (env === 'local') {
    // 로컬: isActive가 true인 프롬프트 반환
    const active = promptStorage.getActiveByPhase(phaseNumber)
    if (active) return active

    // 활성 프롬프트가 없으면 최신 버전 반환 (fallback)
    const latest = promptStorage.getLatestByPhase(phaseNumber)
    return latest
  } else {
    // Vercel: 마커 파일 기반으로 활성 프롬프트 조회
    const prompts = await listPrompts(phaseNumber)
    if (prompts.length === 0) return null

    // isActive가 true인 프롬프트 반환
    const active = prompts.find(p => p.isActive)
    if (active) return active

    // 활성 프롬프트가 없으면 최신 버전 반환 (fallback)
    return prompts.sort((a, b) => {
      const vA = a.version.split('.').map(Number)
      const vB = b.version.split('.').map(Number)
      for (let i = 0; i < 3; i++) {
        if (vA[i] > vB[i]) return -1
        if (vA[i] < vB[i]) return 1
      }
      return 0
    })[0]
  }
}
