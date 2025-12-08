/**
 * 방문자 추적 유틸리티 (클라이언트 사이드)
 *
 * localStorage를 사용하여 고유 방문자 ID를 관리하고,
 * 페이지 방문 시 서버에 기록합니다.
 */

// localStorage 키
const VISITOR_ID_KEY = '2dto3d_visitor_id'

/**
 * 방문자 ID 조회 또는 생성
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') {
    // SSR 환경에서는 빈 문자열 반환
    return ''
  }

  let visitorId = localStorage.getItem(VISITOR_ID_KEY)

  if (!visitorId) {
    // crypto.randomUUID() 사용 (모던 브라우저)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      visitorId = crypto.randomUUID()
    } else {
      // 폴백: 간단한 UUID 생성
      visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        }
      )
    }
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
  }

  return visitorId
}

/**
 * 방문 기록 전송
 */
export async function trackVisit(path?: string): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  const visitorId = getOrCreateVisitorId()
  if (!visitorId) {
    return
  }

  try {
    await fetch('/api/analytics/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        path: path || window.location.pathname,
        referrer: document.referrer || undefined,
      }),
    })
  } catch (error) {
    // 방문 추적 실패는 무시 (사용자 경험에 영향 X)
    console.error('[visitor-tracker] Failed to track visit:', error)
  }
}

/**
 * 방문자 ID 조회 (읽기 전용)
 */
export function getVisitorId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(VISITOR_ID_KEY)
}

/**
 * 방문자 ID 삭제 (테스트/디버깅용)
 */
export function clearVisitorId(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(VISITOR_ID_KEY)
}
