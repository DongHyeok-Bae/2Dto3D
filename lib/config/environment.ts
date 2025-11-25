/**
 * 환경 감지 유틸리티
 * 로컬 개발 환경과 Vercel 프로덕션 환경을 구분
 */

// 환경 타입
export type StorageEnvironment = 'local' | 'vercel'

/**
 * Blob Storage 사용 가능 여부 확인
 *
 * @returns true if Blob Storage is available (valid token), false otherwise
 */
export function isBlobStorageAvailable(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  // 토큰이 없거나 플레이스홀더인 경우
  if (!token ||
      token === 'your_vercel_blob_token_here' ||
      token.includes('placeholder') ||
      token.includes('your_') ||
      token.includes('YOUR_')) {
    return false
  }

  // vercel_blob_로 시작하는 실제 토큰 확인
  return token.startsWith('vercel_blob_')
}

/**
 * 현재 저장소 환경 감지
 *
 * @returns 'local' for memory storage, 'vercel' for Blob Storage
 */
export function getStorageEnvironment(): StorageEnvironment {
  return isBlobStorageAvailable() ? 'vercel' : 'local'
}

/**
 * 환경별 로그 출력 (디버깅용)
 * 개발 환경에서만 출력
 */
export function logStorageEnvironment(): void {
  const env = getStorageEnvironment()
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    console.log(`[Storage Environment] Using: ${env}`)

    if (env === 'local') {
      console.log('[Storage Environment] 💾 메모리 저장소 (로컬 개발)')
    } else {
      console.log('[Storage Environment] ☁️  Vercel Blob Storage (프로덕션)')
    }
  }
}

/**
 * 환경 정보 객체 반환
 */
export function getEnvironmentInfo() {
  const env = getStorageEnvironment()
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
  const isValidToken = isBlobStorageAvailable()

  return {
    environment: env,
    hasBlobToken,
    isValidToken,
    nodeEnv: process.env.NODE_ENV || 'development',
  }
}
