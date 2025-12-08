'use client'

/**
 * 방문 추적 컴포넌트
 *
 * 페이지 로드 시 자동으로 방문을 기록합니다.
 * layout.tsx에서 사용됩니다.
 */

import { useEffect } from 'react'
import { trackVisit } from '@/lib/analytics/visitor-tracker'

export default function VisitTracker() {
  useEffect(() => {
    // 페이지 로드 시 방문 기록
    trackVisit()
  }, [])

  // UI 없이 기능만 수행
  return null
}
