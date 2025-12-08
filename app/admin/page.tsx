'use client'

/**
 * 관리자 대시보드 홈
 *
 * 기능 카드 및 오늘의 통계를 표시합니다.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TOTAL_PHASES } from '@/lib/config/phases'
import type { AnalyticsSummary, DailyAnalytics } from '@/types/analytics'

export default function AdminPage() {
  const [stats, setStats] = useState<{
    todayVisitors: number
    todayApiCalls: number
    avgResponseTime: number
    successRate: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayStats()
  }, [])

  const fetchTodayStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics?range=1d')
      const json = await res.json()

      if (json.success && json.data) {
        const today = json.data.daily[0] as DailyAnalytics | undefined
        const summary = json.data.summary as AnalyticsSummary

        setStats({
          todayVisitors: today?.visitors.unique || 0,
          todayApiCalls: today?.apiCalls.total || 0,
          avgResponseTime: summary.avgResponseTime,
          successRate: summary.successRate,
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-serif font-bold text-primary-navy mb-8">
        관리자 대시보드
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard
          title="프롬프트 관리"
          description={`Phase 1-${TOTAL_PHASES} 프롬프트 편집 및 버전 관리`}
          href="/admin/prompts"
          icon="📝"
        />
        <AdminCard
          title="실행 결과"
          description="프롬프트 실행 결과 조회 및 비교"
          href="/admin/results"
          icon="📊"
        />
        <AdminCard
          title="성능 분석"
          description="DAU, API 호출 수, 에러율 분석"
          href="/admin/analytics"
          icon="📈"
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif font-semibold mb-6">오늘의 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="오늘 방문자"
            value={loading ? '-' : (stats?.todayVisitors.toString() || '0')}
          />
          <StatCard
            label="오늘 API 호출"
            value={loading ? '-' : (stats?.todayApiCalls.toString() || '0')}
          />
          <StatCard
            label="평균 응답 시간"
            value={loading ? '-' : (stats?.avgResponseTime ? `${stats.avgResponseTime}ms` : '-')}
          />
          <StatCard
            label="성공률"
            value={loading ? '-' : (stats?.successRate ? `${stats.successRate}%` : '-')}
          />
        </div>
      </div>
    </div>
  )
}

function AdminCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link href={href} className="card-hover">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-serif font-semibold mb-2 text-primary-navy">
        {title}
      </h3>
      <p className="text-neutral-warmGray">{description}</p>
    </Link>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <p className="text-sm text-neutral-warmGray mb-2">{label}</p>
      <p className="text-3xl font-bold text-primary-crimson">{value}</p>
    </div>
  )
}
