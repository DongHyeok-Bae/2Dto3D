'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('로그아웃 되었습니다.')
        router.push('/')
        router.refresh()
      } else {
        toast.error('로그아웃에 실패했습니다.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('로그아웃 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 rounded-neo text-white/80 hover:text-white
        hover:bg-red-500/20 transition-colors disabled:opacity-50"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
