/**
 * POST /api/auth/logout
 *
 * Admin 로그아웃 API
 * 세션 쿠키를 삭제합니다.
 */

import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/session'

export async function POST() {
  try {
    // 세션 쿠키 삭제
    await clearSessionCookie()

    return NextResponse.json({
      success: true,
      message: '로그아웃 성공',
    })
  } catch (error) {
    console.error('[POST /api/auth/logout]', error)
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
