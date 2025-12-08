/**
 * POST /api/auth/login
 *
 * Admin 로그인 API
 * 아이디/비밀번호 검증 후 세션 쿠키를 설정합니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // 입력값 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 자격증명 검증
    const isValid = validateCredentials(username, password)

    if (!isValid) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 세션 쿠키 설정
    await setSessionCookie(username)

    return NextResponse.json({
      success: true,
      message: '로그인 성공',
    })
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
