'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ExecutionResult {
  id: string
  phaseNumber: number
  promptVersion: string
  imageUrl: string
  input: any
  output: any
  success: boolean
  error?: string
  executionTime: number
  createdAt: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExecutionResult[]>([])
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 실제로는 API에서 데이터를 가져와야 함
    // 현재는 목업 데이터 사용
    const mockResults: ExecutionResult[] = [
      {
        id: '1',
        phaseNumber: 1,
        promptVersion: '1.0.0',
        imageUrl: '/sample-floor-plan.jpg',
        input: { image: 'base64...' },
        output: { boundaries: '...' },
        success: true,
        executionTime: 2345,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        phaseNumber: 2,
        promptVersion: '1.0.0',
        imageUrl: '/sample-floor-plan.jpg',
        input: { boundaries: '...' },
        output: { spaces: '...' },
        success: true,
        executionTime: 1890,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        phaseNumber: 3,
        promptVersion: '1.0.1',
        imageUrl: '/sample-floor-plan.jpg',
        input: { spaces: '...' },
        output: { error: 'Processing failed' },
        success: false,
        error: 'AI processing timeout',
        executionTime: 30000,
        createdAt: new Date().toISOString(),
      },
    ]

    setTimeout(() => {
      setResults(mockResults)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredResults = selectedPhase
    ? results.filter(r => r.phaseNumber === selectedPhase)
    : results

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-primary-crimson hover:underline mb-2 inline-block"
        >
          ← 관리자 대시보드
        </Link>
        <h1 className="text-3xl font-serif font-bold text-primary-navy">
          프롬프트 실행 결과
        </h1>
        <p className="text-neutral-warmGray mt-2">
          AI 파이프라인 실행 결과를 확인하고 분석합니다.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-4 py-2 rounded ${
            selectedPhase === null
              ? 'bg-primary-navy text-white'
              : 'bg-neutral-marble text-neutral-warmGray hover:bg-neutral-warmGray/10'
          }`}
        >
          전체
        </button>
        {[1, 2, 3, 4, 5, 6, 7].map(phase => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`px-4 py-2 rounded ${
              selectedPhase === phase
                ? 'bg-primary-navy text-white'
                : 'bg-neutral-marble text-neutral-warmGray hover:bg-neutral-warmGray/10'
            }`}
          >
            Phase {phase}
          </button>
        ))}
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-neutral-warmGray">결과 로딩 중...</p>
          </div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-warmGray">
            {selectedPhase
              ? `Phase ${selectedPhase}의 실행 결과가 없습니다.`
              : '아직 실행된 결과가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map(result => (
            <div key={result.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-primary-navy">
                      Phase {result.phaseNumber}
                    </span>
                    <span className="text-sm text-neutral-warmGray">
                      v{result.promptVersion}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        result.success
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {result.success ? '성공' : '실패'}
                    </span>
                  </div>

                  <div className="text-sm text-neutral-warmGray space-y-1">
                    <div>실행 시간: {result.executionTime}ms</div>
                    <div>
                      생성 시간: {new Date(result.createdAt).toLocaleString('ko-KR')}
                    </div>
                    {result.error && (
                      <div className="text-red-600">에러: {result.error}</div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        console.log('View details:', result)
                        alert('상세 보기 기능은 추후 구현 예정입니다.')
                      }}
                      className="text-sm text-primary-crimson hover:underline"
                    >
                      상세 보기 →
                    </button>
                    <button
                      onClick={() => {
                        console.log('Compare:', result)
                        alert('비교 기능은 추후 구현 예정입니다.')
                      }}
                      className="text-sm text-primary-navy hover:underline"
                    >
                      비교하기
                    </button>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="ml-4 flex-shrink-0">
                  <div className="w-24 h-24 bg-neutral-marble rounded-lg flex items-center justify-center text-xs text-neutral-warmGray">
                    이미지
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {!isLoading && results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-navy">
              {results.length}
            </div>
            <div className="text-sm text-neutral-warmGray mt-1">총 실행 횟수</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">
              {results.filter(r => r.success).length}
            </div>
            <div className="text-sm text-neutral-warmGray mt-1">성공</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-red-600">
              {results.filter(r => !r.success).length}
            </div>
            <div className="text-sm text-neutral-warmGray mt-1">실패</div>
          </div>
        </div>
      )}
    </div>
  )
}