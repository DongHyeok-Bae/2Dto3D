'use client'

import { useState, useEffect } from 'react'
import { usePipelineStore } from '@/store/pipelineStore'

interface PromptInfo {
  id: string
  version: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  contentLength: number
  contentPreview: string
}

interface PhasePrompts {
  phase: number
  prompts: PromptInfo[]
}

interface StorageData {
  prompts: {
    stats: {
      totalPrompts: number
      activePrompts: number
      totalSize: number
    }
    byPhase: PhasePrompts[]
  }
}

const PHASE_NAMES: Record<number, string> = {
  1: 'Normalization',
  2: 'Structure',
  3: 'Openings',
  4: 'Spaces',
  5: 'Dimensions',
  6: 'Confidence',
  7: 'Master JSON',
}

export default function StorageViewer() {
  const [storageData, setStorageData] = useState<StorageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'prompts' | 'results'>('prompts')
  const [selectedPhase, setSelectedPhase] = useState<number>(1)
  const [expandedJson, setExpandedJson] = useState<number | null>(null)

  const { results, metadata } = usePipelineStore()

  useEffect(() => {
    fetchStorageData()
  }, [])

  const fetchStorageData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/storage')
      if (!response.ok) {
        throw new Error('스토리지 데이터를 가져오는데 실패했습니다.')
      }
      const data = await response.json()
      setStorageData(data.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const availableResultPhases = Object.keys(results)
    .filter(key => key.startsWith('phase') && results[key as keyof typeof results])
    .map(key => parseInt(key.replace('phase', '')))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-crimson border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-neutral-warmGray">스토리지 정보를 불러오는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-semibold text-red-900">오류 발생</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary-navy">
            데이터 관리
          </h2>
          <p className="text-sm text-neutral-warmGray mt-1">
            프롬프트 저장소 및 실행 결과 확인
          </p>
        </div>
        <button
          onClick={fetchStorageData}
          className="btn-secondary text-sm"
        >
          새로고침
        </button>
      </div>

      {/* Statistics Cards */}
      {storageData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-primary-navy/5 to-primary-navy/10">
            <p className="text-sm text-neutral-warmGray">전체 프롬프트</p>
            <p className="text-3xl font-bold text-primary-navy mt-2">
              {storageData.prompts.stats.totalPrompts}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-accent-emerald/5 to-accent-emerald/10">
            <p className="text-sm text-neutral-warmGray">활성 프롬프트</p>
            <p className="text-3xl font-bold text-accent-emerald mt-2">
              {storageData.prompts.stats.activePrompts}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-primary-crimson/5 to-primary-crimson/10">
            <p className="text-sm text-neutral-warmGray">저장 용량</p>
            <p className="text-3xl font-bold text-primary-crimson mt-2">
              {formatBytes(storageData.prompts.stats.totalSize)}
            </p>
          </div>
        </div>
      )}

      {/* View Selector */}
      <div className="flex gap-2 border-b border-neutral-warmGray/20">
        <button
          onClick={() => setSelectedView('prompts')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${selectedView === 'prompts'
              ? 'text-primary-navy border-b-2 border-primary-crimson'
              : 'text-neutral-warmGray hover:text-primary-navy'
            }
          `}
        >
          프롬프트 저장소
        </button>
        <button
          onClick={() => setSelectedView('results')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${selectedView === 'results'
              ? 'text-primary-navy border-b-2 border-primary-crimson'
              : 'text-neutral-warmGray hover:text-primary-navy'
            }
          `}
        >
          실행 결과 ({availableResultPhases.length})
        </button>
      </div>

      {/* Prompts View */}
      {selectedView === 'prompts' && storageData && (
        <div className="space-y-4">
          {storageData.prompts.byPhase.map(phaseData => (
            <div key={phaseData.phase} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-primary-navy">
                  Phase {phaseData.phase}: {PHASE_NAMES[phaseData.phase]}
                </h3>
                <span className="text-sm text-neutral-warmGray">
                  {phaseData.prompts.length}개 버전
                </span>
              </div>

              {phaseData.prompts.length === 0 ? (
                <p className="text-sm text-neutral-warmGray italic">
                  저장된 프롬프트가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {phaseData.prompts.map(prompt => (
                    <div
                      key={prompt.id}
                      className="p-3 bg-neutral-warmGray/5 rounded-lg border border-neutral-warmGray/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-primary-navy">
                              {prompt.version}
                            </span>
                            {prompt.isActive && (
                              <span className="text-xs px-2 py-0.5 bg-accent-emerald text-white rounded">
                                활성
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-warmGray mb-2">
                            생성: {formatDate(prompt.createdAt)} |
                            수정: {formatDate(prompt.updatedAt)} |
                            크기: {formatBytes(prompt.contentLength)}
                          </p>
                          <details className="text-xs">
                            <summary className="cursor-pointer text-primary-navy hover:text-primary-crimson">
                              프롬프트 미리보기
                            </summary>
                            <pre className="mt-2 p-2 bg-white rounded border border-neutral-warmGray/20 text-xs overflow-x-auto">
                              {prompt.contentPreview}
                            </pre>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results View */}
      {selectedView === 'results' && (
        <div className="space-y-4">
          {availableResultPhases.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-neutral-warmGray">
                아직 실행된 결과가 없습니다.
              </p>
            </div>
          ) : (
            <>
              {/* Phase Selector */}
              <div className="flex gap-2 flex-wrap">
                {availableResultPhases.map(phase => {
                  const phaseMetadata = metadata[`phase${phase}` as keyof typeof metadata]
                  const isValidated = phaseMetadata?.validated

                  return (
                    <button
                      key={phase}
                      onClick={() => setSelectedPhase(phase)}
                      className={`
                        px-4 py-2 rounded-lg border-2 transition-all
                        ${selectedPhase === phase
                          ? 'border-primary-crimson bg-primary-crimson text-white'
                          : 'border-neutral-warmGray/20 hover:border-primary-crimson/50'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        Phase {phase}
                        {isValidated === true && (
                          <span className="text-green-500" title="검증 성공">✓</span>
                        )}
                        {isValidated === false && (
                          <span className="text-yellow-300" title="검증 실패 (원본 저장됨)">⚠</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Result Details */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-navy">
                    Phase {selectedPhase}: {PHASE_NAMES[selectedPhase]} 결과
                  </h3>
                  <button
                    onClick={() => setExpandedJson(expandedJson === selectedPhase ? null : selectedPhase)}
                    className="text-sm text-primary-crimson hover:underline"
                  >
                    {expandedJson === selectedPhase ? 'JSON 접기' : 'JSON 보기'}
                  </button>
                </div>

                {/* Metadata Info */}
                {metadata[`phase${selectedPhase}` as keyof typeof metadata] && (
                  <div className="mb-4 p-3 bg-neutral-warmGray/5 rounded-lg">
                    <h4 className="text-sm font-semibold text-primary-navy mb-2">메타데이터</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-warmGray">검증 상태:</span>
                        <span className={`ml-2 font-semibold ${
                          metadata[`phase${selectedPhase}` as keyof typeof metadata]?.validated
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }`}>
                          {metadata[`phase${selectedPhase}` as keyof typeof metadata]?.validated
                            ? '✓ 성공'
                            : '⚠ 실패 (원본 저장됨)'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-warmGray">타임스탬프:</span>
                        <span className="ml-2 font-mono">
                          {formatDate(metadata[`phase${selectedPhase}` as keyof typeof metadata]?.timestamp || '')}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-warmGray">프롬프트 버전:</span>
                        <span className="ml-2 font-mono">
                          {metadata[`phase${selectedPhase}` as keyof typeof metadata]?.promptVersion || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Validation Errors */}
                    {metadata[`phase${selectedPhase}` as keyof typeof metadata]?.validationErrors && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">검증 에러:</p>
                        <div className="space-y-1">
                          {metadata[`phase${selectedPhase}` as keyof typeof metadata]!.validationErrors!.map((error, idx) => (
                            <div key={idx} className="text-xs text-yellow-700 font-mono">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* JSON Viewer */}
                {expandedJson === selectedPhase && (
                  <div className="mt-4">
                    <pre className="p-4 bg-primary-navy/5 rounded-lg text-xs overflow-x-auto border border-neutral-warmGray/20">
                      {JSON.stringify(results[`phase${selectedPhase}` as keyof typeof results], null, 2)}
                    </pre>
                  </div>
                )}

                {/* Result Summary */}
                {!expandedJson && (
                  <div className="text-sm text-neutral-warmGray">
                    <p>
                      이 Phase의 상세 결과를 보려면 "JSON 보기"를 클릭하세요.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
