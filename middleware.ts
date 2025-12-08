/**
 * Next.js Middleware
 *
 * /admin/* 경로 접근 시 인증 여부를 확인합니다.
 * 인증되지 않은 사용자는 /login으로 리다이렉트됩니다.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'admin_session'

/**
 * Generate SHA-256 hash using Web Crypto API (Edge Runtime compatible)
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify session token in middleware context
 * Note: Environment variables are read at edge runtime
 */
async function verifyToken(token: string): Promise<boolean> {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const secret = process.env.ADMIN_SESSION_SECRET || 'default_secret'

  // Check current hour's token
  const currentTimestamp = Math.floor(Date.now() / (1000 * 60 * 60))
  const currentData = `${username}:${secret}:${currentTimestamp}`
  const currentToken = await sha256(currentData)

  // Check previous hour's token (for edge cases)
  const prevTimestamp = currentTimestamp - 1
  const prevData = `${username}:${secret}:${prevTimestamp}`
  const prevToken = await sha256(prevData)

  return token === currentToken || token === prevToken
}

export async function middleware(request: NextRequest) {
  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  // If no session cookie, redirect to login
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify session token
  const isValid = await verifyToken(sessionCookie.value)

  if (!isValid) {
    // Invalid token, clear cookie and redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(SESSION_COOKIE_NAME)
    return response
  }

  // Valid session, allow access
  return NextResponse.next()
}

// Only apply middleware to /admin routes
export const config = {
  matcher: ['/admin/:path*'],
}
