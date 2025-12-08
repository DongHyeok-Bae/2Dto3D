import { cookies } from 'next/headers'
import { createHash } from 'crypto'

// Cookie configuration
export const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours in seconds

/**
 * Generate a session token based on username and secret
 */
export function generateSessionToken(username: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'default_secret'
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)) // Hour-based timestamp
  const data = `${username}:${secret}:${timestamp}`
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Verify if the provided token matches expected token
 */
export function verifySessionToken(token: string): boolean {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const expectedToken = generateSessionToken(username)

  // Also check previous hour's token to handle edge cases
  const secret = process.env.ADMIN_SESSION_SECRET || 'default_secret'
  const prevTimestamp = Math.floor(Date.now() / (1000 * 60 * 60)) - 1
  const prevData = `${username}:${secret}:${prevTimestamp}`
  const prevToken = createHash('sha256').update(prevData).digest('hex')

  return token === expectedToken || token === prevToken
}

/**
 * Validate admin credentials
 */
export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables')
    return false
  }

  return username === adminUsername && password === adminPassword
}

/**
 * Set session cookie (for use in API routes)
 */
export async function setSessionCookie(username: string): Promise<void> {
  const token = generateSessionToken(username)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Clear session cookie (for use in API routes)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

/**
 * Get current session token from cookies
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken()
  if (!token) return false
  return verifySessionToken(token)
}
