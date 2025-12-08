'use client'

/**
 * Phase별 사용 현황 파이 차트
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyAnalytics } from '@/types/analytics'

// Phase별 색상 팔레트
const PHASE_COLORS = [
  '#9A212D', // Phase 1 - crimson
  '#1A2B50', // Phase 2 - navy
  '#C5A059', // Phase 3 - gold
  '#4A90D9', // Phase 4 - blue
  '#50C878', // Phase 5 - green
  '#9370DB', // Phase 6 - purple
]

interface PhaseUsageChartProps {
  data: DailyAnalytics[]
}

export default function PhaseUsageChart({ data }: PhaseUsageChartProps) {
  // Phase별 총 호출 수 집계
  const phaseAggregates: Record<number, number> = {}

  data.forEach((day) => {
    Object.entries(day.apiCalls.byPhase).forEach(([phase, count]) => {
      const phaseNum = parseInt(phase, 10)
      phaseAggregates[phaseNum] = (phaseAggregates[phaseNum] || 0) + count
    })
  })

  // 차트 데이터 변환
  const chartData = Object.entries(phaseAggregates)
    .map(([phase, value]) => ({
      name: `Phase ${phase}`,
      value,
      phase: parseInt(phase, 10),
    }))
    .sort((a, b) => a.phase - b.phase)

  // 데이터가 없는 경우
  if (chartData.length === 0 || chartData.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-neutral-warmGray">
        데이터가 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} (${(percent * 100).toFixed(0)}%)`
          }
          labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PHASE_COLORS[entry.phase - 1] || '#8B8680'}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number) => [`${value}회`, '호출 수']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
