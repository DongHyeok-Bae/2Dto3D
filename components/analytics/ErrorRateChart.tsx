'use client'

/**
 * 에러율 추이 라인 차트
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { DailyAnalytics } from '@/types/analytics'

// 색상
const COLORS = {
  red: '#DC2626',
  warning: '#F59E0B',
}

interface ErrorRateChartProps {
  data: DailyAnalytics[]
}

export default function ErrorRateChart({ data }: ErrorRateChartProps) {
  // 차트 데이터 변환 (에러율 계산)
  const chartData = data.map((day) => {
    const errorRate = day.apiCalls.total > 0
      ? Math.round((day.apiCalls.errors / day.apiCalls.total) * 1000) / 10
      : 0

    return {
      date: day.date.slice(5), // "12-08" 형식
      errorRate,
      errors: day.apiCalls.errors,
      total: day.apiCalls.total,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={{ stroke: '#E5E7EB' }}
          domain={[0, 'auto']}
          tickFormatter={(value) => `${value}%`}
        />
        {/* 5% 경고선 */}
        <ReferenceLine
          y={5}
          stroke={COLORS.warning}
          strokeDasharray="5 5"
          label={{
            value: '경고 (5%)',
            position: 'right',
            fill: COLORS.warning,
            fontSize: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'errorRate') return [`${value}%`, '에러율']
            return [value, name]
          }}
          labelFormatter={(label) => `날짜: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="errorRate"
          stroke={COLORS.red}
          strokeWidth={2}
          dot={{ fill: COLORS.red, strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: COLORS.red }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
