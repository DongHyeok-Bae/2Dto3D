'use client'

/**
 * 일일 API 호출 수 바 차트
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyAnalytics } from '@/types/analytics'

// 경희대 브랜드 색상
const COLORS = {
  navy: '#1A2B50',
  gold: '#C5A059',
}

interface ApiCallChartProps {
  data: DailyAnalytics[]
}

export default function ApiCallChart({ data }: ApiCallChartProps) {
  // 차트 데이터 변환
  const chartData = data.map((day) => ({
    date: day.date.slice(5), // "12-08" 형식
    total: day.apiCalls.total,
    errors: day.apiCalls.errors,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            name === 'total' ? 'API 호출' : '에러',
          ]}
          labelFormatter={(label) => `날짜: ${label}`}
        />
        <Bar
          dataKey="total"
          fill={COLORS.navy}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
