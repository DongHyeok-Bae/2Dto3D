'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const PHASES = [
  { number: 1, name: 'Normalization', description: '좌표계 설정' },
  { number: 2, name: 'Structure', description: '구조 추출' },
  { number: 3, name: 'Openings', description: '개구부 인식' },
  { number: 4, name: 'Spaces', description: '공간 분석' },
  { number: 5, name: 'Dimensions', description: '치수 계산' },
  { number: 6, name: 'Confidence', description: '신뢰도 검증' },
  { number: 7, name: 'Master JSON', description: '최종 합성' },
]

interface PhaseVersionInfo {
  latestVersion: string
  totalVersions: number
  hasActive: boolean
}

export default function PromptsPage() {
  const [phaseData, setPhaseData] = useState<Record<number, PhaseVersionInfo>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPhaseData = async () => {
      try {
        const results = await Promise.all(
          PHASES.map(async (phase) => {
            try {
              const response = await fetch(`/api/admin/prompts?phase=${phase.number}`)
              if (response.ok) {
                const data = await response.json()
                if (data.success && data.versions) {
                  // 최신 버전 찾기 (버전 정렬)
                  const sortedVersions = [...data.versions].sort((a: any, b: any) => {
                    const vA = a.version.split('.').map(Number)
                    const vB = b.version.split('.').map(Number)
                    for (let i = 0; i < 3; i++) {
                      if (vA[i] > vB[i]) return -1
                      if (vA[i] < vB[i]) return 1
                    }
                    return 0
                  })

                  const latestVersion = sortedVersions[0]?.version || '1.0.0'
                  const hasActive = data.versions.some((v: any) => v.isActive)

                  return {
                    phaseNumber: phase.number,
                    info: {
                      latestVersion,
                      totalVersions: data.versions.length,
                      hasActive,
                    },
                  }
                }
              }
              return {
                phaseNumber: phase.number,
                info: { latestVersion: '1.0.0', totalVersions: 1, hasActive: true },
              }
            } catch {
              return {
                phaseNumber: phase.number,
                info: { latestVersion: '1.0.0', totalVersions: 1, hasActive: true },
              }
            }
          })
        )

        const dataMap: Record<number, PhaseVersionInfo> = {}
        results.forEach((result) => {
          dataMap[result.phaseNumber] = result.info
        })
        setPhaseData(dataMap)
      } catch (error) {
        console.error('Failed to load phase data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPhaseData()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-primary-navy">
          프롬프트 관리
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PHASES.map(phase => {
          const info = phaseData[phase.number]

          return (
            <Link
              key={phase.number}
              href={`/admin/prompts/phase${phase.number}`}
              className="card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-royal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {phase.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-semibold mb-1 text-primary-navy">
                    Phase {phase.number}: {phase.name}
                  </h3>
                  <p className="text-sm text-neutral-warmGray">{phase.description}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {info?.hasActive !== false && (
                      <span className="px-2 py-1 bg-accent-emerald/10 text-accent-emerald text-xs rounded">
                        활성
                      </span>
                    )}
                    <span className="px-2 py-1 bg-neutral-warmGray/10 text-neutral-warmGray text-xs rounded">
                      {isLoading ? (
                        <span className="inline-block w-12 h-3 bg-neutral-warmGray/20 rounded animate-pulse" />
                      ) : (
                        `v${info?.latestVersion || '1.0.0'}`
                      )}
                    </span>
                    {!isLoading && info && info.totalVersions > 1 && (
                      <span className="px-2 py-1 bg-primary-navy/10 text-primary-navy text-xs rounded">
                        {info.totalVersions}개 버전
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
