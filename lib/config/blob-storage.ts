import { put, list, del, head } from '@vercel/blob'

/**
 * Vercel Blob Storage 관리 유틸리티
 *
 * 프롬프트 버전과 실행 결과를 저장/조회하는 기능을 제공합니다.
 */

export interface BlobMetadata {
  version?: string
  phaseNumber?: number
  isActive?: boolean
  createdAt?: string
  [key: string]: any
}

/**
 * 프롬프트 파일을 Blob Storage에 업로드
 */
export async function uploadPrompt(
  phaseNumber: number,
  version: string,
  content: string,
  metadata: BlobMetadata = {}
): Promise<string> {
  const path = `prompts/phase${phaseNumber}/v${version}.md`

  const blob = await put(path, content, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'text/markdown',
    ...metadata,
  })

  return blob.url
}

/**
 * 특정 Phase의 모든 프롬프트 버전 조회
 */
export async function listPromptVersions(phaseNumber: number) {
  const { blobs } = await list({
    prefix: `prompts/phase${phaseNumber}/`,
  })

  return blobs
}

/**
 * 특정 프롬프트 버전 삭제
 */
export async function deletePrompt(url: string) {
  await del(url)
}

/**
 * 프롬프트 메타데이터 조회
 */
export async function getPromptMetadata(url: string) {
  const blob = await head(url)
  return blob
}

/**
 * 실행 결과를 Blob Storage에 저장
 */
export async function saveExecutionResult(
  phaseNumber: number,
  promptVersion: string,
  result: any,
  metadata: BlobMetadata = {}
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const path = `results/phase${phaseNumber}/${promptVersion}/${timestamp}.json`

  const blob = await put(path, JSON.stringify(result, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    ...metadata,
  })

  return blob.url
}

/**
 * 특정 Phase의 실행 결과 목록 조회
 */
export async function listExecutionResults(
  phaseNumber: number,
  promptVersion?: string
) {
  const prefix = promptVersion
    ? `results/phase${phaseNumber}/${promptVersion}/`
    : `results/phase${phaseNumber}/`

  const { blobs } = await list({ prefix })

  return blobs
}

/**
 * 테스트 이미지 업로드
 */
export async function uploadTestImage(
  imageData: string | Buffer,
  filename: string
): Promise<string> {
  const path = `test-images/${filename}`

  const blob = await put(path, imageData, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/png',
  })

  return blob.url
}

/**
 * 세션 기반 실행 결과 저장
 */
export async function saveExecutionResultWithSession(
  sessionId: string,
  phaseNumber: number,
  promptVersion: string,
  result: any,
  metadata: BlobMetadata = {}
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const path = `results/session_${sessionId}/phase${phaseNumber}/${promptVersion}/${timestamp}.json`

  const blob = await put(path, JSON.stringify(result, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    ...metadata,
  })

  return blob.url
}

/**
 * 특정 세션의 모든 결과 삭제
 */
export async function clearSessionResults(sessionId: string): Promise<number> {
  let totalDeleted = 0

  try {
    const { blobs } = await list({ prefix: `results/session_${sessionId}/` })

    if (blobs.length > 0) {
      await Promise.all(blobs.map(blob => del(blob.url)))
      totalDeleted = blobs.length
      console.log(`[BlobStorage] Cleared session ${sessionId}: ${totalDeleted} files`)
    }

    return totalDeleted
  } catch (error) {
    console.error('[BlobStorage] Failed to clear session results:', error)
    throw error
  }
}
