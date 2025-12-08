'use client'

/**
 * DAU (일일 순 방문자 수) 라인 차트
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyAnalytics } from '@/types/analytics'

// 경희대 브랜드 색상
const COLORS = {
  crimson: '#9A212D',
  navy: '#1A2B50',
}

interface VisitorChartProps {
  data: DailyAnalytics[]
}

export default function VisitorChart({ data }: VisitorChartProps) {
  // 차트 데이터 변환
  const chartData = data.map((day) => ({
    date: day.date.slice(5), // "12-08" 형식
    unique: day.visitors.unique,
    total: day.visitors.total,
  }))

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
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number, name: string) => [
            value,
            name === 'unique' ? '순 방문자' : '총 방문',
          ]}
          labelFormatter={(label) => `날짜: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="unique"
          stroke={COLORS.crimson}
          strokeWidth={2}
          dot={{ fill: COLORS.crimson, strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: COLORS.crimson }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
