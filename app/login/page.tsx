'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error('아이디와 비밀번호를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('로그인 성공!')
        router.push('/admin')
      } else {
        toast.error(data.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('로그인 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-marble flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="2Dto3D"
              width={48}
              height={48}
              className="drop-shadow-md"
            />
            <span className="text-2xl font-serif font-bold text-primary-navy">
              2Dto3D
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-neo shadow-neo-lg p-8">
          <h1 className="text-xl font-semibold text-primary-navy text-center mb-6">
            관리자 로그인
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-neutral-charcoal mb-2"
              >
                아이디
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-neo border border-neutral-silver
                  focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20
                  outline-none transition-all"
                placeholder="아이디를 입력하세요"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-charcoal mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-neo border border-neutral-silver
                  focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20
                  outline-none transition-all"
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-navy text-white rounded-neo
                hover:bg-primary-navy/90 transition-colors font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-neutral-charcoal/70 hover:text-primary-navy transition-colors"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
