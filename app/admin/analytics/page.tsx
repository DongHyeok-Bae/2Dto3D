'use client'

/**
 * 성능 분석 페이지
 *
 * DAU, API 호출 수, Phase별 사용 현황, 에러율 등을 시각화합니다.
 */

import { useState, useEffect } from 'react'
import {
  VisitorChart,
  ApiCallChart,
  PhaseUsageChart,
  ErrorRateChart,
} from '@/components/analytics'
import type { DailyAnalytics, AnalyticsSummary } from '@/types/analytics'

// 기간 옵션
const RANGE_OPTIONS = [
  { value: '7', label: '최근 7일' },
  { value: '14', label: '최근 14일' },
  { value: '30', label: '최근 30일' },
]

export default function AnalyticsPage() {
  const [range, setRange] = useState('7')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [daily, setDaily] = useState<DailyAnalytics[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [range])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/analytics?range=${range}d`)
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch analytics')
      }

      setSummary(json.data.summary)
      setDaily(json.data.daily)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-serif font-bold text-primary-navy">
          성능 분석
        </h1>

        {/* 기간 선택 */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-4 py-2 border border-neutral-200 rounded-neo bg-white text-primary-navy
                     focus:outline-none focus:ring-2 focus:ring-primary-gold/50"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-crimson" />
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="card bg-red-50 border border-red-200 text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 text-sm underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 데이터 표시 */}
      {!loading && !error && summary && (
        <>
          {/* 요약 통계 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="DAU 평균"
              value={summary.avgDau.toString()}
              subtext="순 방문자"
            />
            <StatCard
              label="총 API 호출"
              value={formatNumber(summary.totalApiCalls)}
              subtext={`${RANGE_OPTIONS.find((o) => o.value === range)?.label}`}
            />
            <StatCard
              label="평균 응답 시간"
              value={`${summary.avgResponseTime}ms`}
              subtext="API 평균"
            />
            <StatCard
              label="성공률"
              value={`${summary.successRate}%`}
              subtext="파이프라인"
              highlight={summary.successRate >= 95}
            />
          </div>

          {/* 차트 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DAU 라인 차트 */}
            <div className="card">
              <h3 className="text-xl font-serif font-semibold mb-4 text-primary-navy">
                일일 순 방문자 수 (DAU)
              </h3>
              <VisitorChart data={daily} />
            </div>

            {/* API 호출 바 차트 */}
            <div className="card">
              <h3 className="text-xl font-serif font-semibold mb-4 text-primary-navy">
                일일 API 호출 수
              </h3>
              <ApiCallChart data={daily} />
            </div>

            {/* Phase별 파이 차트 */}
            <div className="card">
              <h3 className="text-xl font-serif font-semibold mb-4 text-primary-navy">
                Phase별 사용 현황
              </h3>
              <PhaseUsageChart data={daily} />
            </div>

            {/* 에러율 라인 차트 */}
            <div className="card">
              <h3 className="text-xl font-serif font-semibold mb-4 text-primary-navy">
                에러율 추이
              </h3>
              <ErrorRateChart data={daily} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// 통계 카드 컴포넌트
function StatCard({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string
  value: string
  subtext?: string
  highlight?: boolean
}) {
  return (
    <div className="card text-center">
      <p className="text-sm text-neutral-warmGray mb-1">{label}</p>
      <p
        className={`text-3xl font-bold ${
          highlight ? 'text-green-600' : 'text-primary-crimson'
        }`}
      >
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-neutral-warmGray mt-1">{subtext}</p>
      )}
    </div>
  )
}

// 숫자 포맷팅 (1000 -> 1K)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
