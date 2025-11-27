'use client'

import { useState } from 'react'
import { usePipelineStore } from '@/store/pipelineStore'

// 6단계 파이프라인
const PHASE_NAMES = {
  1: 'Normalization',
  2: 'Structure',
  3: 'Openings',
  4: 'Spaces',
  5: 'Dimensions',
  6: 'Master JSON', // 기존 Phase 7 승격
}

export default function ResultViewer() {
  const { results, metadata } = usePipelineStore()
  const [selectedPhase, setSelectedPhase] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')

  // 사용 가능한 Phase 목록
  const availablePhases = Object.keys(results)
    .filter(key => key.startsWith('phase') && results[key as keyof typeof results])
    .map(key => parseInt(key.replace('phase', '')))
    .sort((a, b) => a - b)

  if (availablePhases.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-warmGray/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-neutral-warmGray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-neutral-warmGray">아직 실행된 결과가 없습니다.</p>
      </div>
    )
  }

  const currentResult = results[`phase${selectedPhase}` as keyof typeof results]
  const currentMetadata = metadata[`phase${selectedPhase}` as keyof typeof metadata]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-primary-navy">
          실행 결과
        </h2>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'formatted'
                ? 'bg-primary-crimson text-white'
                : 'bg-neutral-warmGray/10 text-neutral-warmGray hover:bg-neutral-warmGray/20'
            }`}
          >
            구조화
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'raw'
                ? 'bg-primary-crimson text-white'
                : 'bg-neutral-warmGray/10 text-neutral-warmGray hover:bg-neutral-warmGray/20'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {availablePhases.map(phase => {
          const phaseMetadata = metadata[`phase${phase}` as keyof typeof metadata]
          const isValidated = phaseMetadata?.validated

          return (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors relative
                ${
                  selectedPhase === phase
                    ? 'bg-gradient-royal text-white'
                    : 'bg-neutral-warmGray/10 text-neutral-warmGray hover:bg-neutral-warmGray/20'
                }
              `}
            >
              <span className="flex items-center gap-2">
                Phase {phase}: {PHASE_NAMES[phase as keyof typeof PHASE_NAMES]}
                {isValidated === true && (
                  <span className="text-green-500" title="검증 성공">✓</span>
                )}
                {isValidated === false && (
                  <span className="text-yellow-500" title="검증 실패 (원본 저장됨)">⚠</span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Validation Warning */}
      {currentMetadata?.validated === false && currentMetadata?.validationErrors && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">검증 실패 (원본 데이터 저장됨)</h3>
              <p className="text-sm text-yellow-800 mb-2">
                스키마 검증에 실패했지만 AI 원본 출력이 저장되었습니다. 프롬프트를 수정하거나 스키마를 업데이트할 수 있습니다.
              </p>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-yellow-900">검증 에러:</p>
                {currentMetadata.validationErrors.map((error, idx) => (
                  <div key={idx} className="text-xs text-yellow-700 font-mono bg-yellow-100 px-2 py-1 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      <div className="card">
        {viewMode === 'formatted' ? (
          <FormattedResult phase={selectedPhase} result={currentResult} />
        ) : (
          <RawResult result={currentResult} />
        )}
      </div>
    </div>
  )
}

function FormattedResult({ phase, result }: { phase: number; result: any }) {
  if (!result) return null

  // Phase별 커스텀 렌더링 (6단계 파이프라인)
  switch (phase) {
    case 1:
      return <Phase1Formatted data={result} />
    case 2:
      return <Phase2Formatted data={result} />
    case 3:
      return <Phase3Formatted data={result} />
    case 4:
      return <Phase4Formatted data={result} />
    case 5:
      return <Phase5Formatted data={result} />
    case 6:
      return <Phase6Formatted data={result} />
    default:
      return <RawResult result={result} />
  }
}

function RawResult({ result }: { result: any }) {
  return (
    <pre className="text-xs text-neutral-charcoal bg-neutral-warmGray/5 p-4 rounded-lg overflow-x-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

// Phase 1: Normalization
function Phase1Formatted({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Section title="좌표계">
        <Item label="원점" value={`(${data.coordinateSystem.origin.x}, ${data.coordinateSystem.origin.y})`} />
        <Item label="스케일" value={`${data.coordinateSystem.scale.pixelsPerMeter} px/m`} />
        <Item label="단위" value={data.coordinateSystem.scale.detectedUnit} />
        <Item label="회전" value={`${data.coordinateSystem.rotation}°`} />
      </Section>

      <Section title="도면 범위">
        <Item label="좌상단" value={`(${data.floorPlanBounds.topLeft.x}, ${data.floorPlanBounds.topLeft.y})`} />
        <Item label="우하단" value={`(${data.floorPlanBounds.bottomRight.x}, ${data.floorPlanBounds.bottomRight.y})`} />
      </Section>

      <Section title="메타데이터">
        <Item label="신뢰도" value={`${(data.metadata.confidence * 100).toFixed(1)}%`} />
        {data.metadata.detectedFloorLevel && (
          <Item label="층" value={data.metadata.detectedFloorLevel} />
        )}
      </Section>
    </div>
  )
}

// Phase 2: Structure
function Phase2Formatted({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Section title="벽">
        <Item label="총 개수" value={data.metadata.totalWalls} />
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {data.walls.slice(0, 5).map((wall: any, idx: number) => (
            <div key={wall.id} className="text-xs bg-neutral-warmGray/5 p-2 rounded">
              <div className="font-medium">{wall.id}</div>
              <div className="text-neutral-warmGray">
                {wall.type} • 두께: {wall.thickness}m
              </div>
            </div>
          ))}
          {data.walls.length > 5 && (
            <div className="text-xs text-neutral-warmGray">
              외 {data.walls.length - 5}개...
            </div>
          )}
        </div>
      </Section>

      {data.columns && data.columns.length > 0 && (
        <Section title="기둥">
          <Item label="총 개수" value={data.metadata.totalColumns} />
        </Section>
      )}

      <Section title="메타데이터">
        <Item label="신뢰도" value={`${(data.metadata.confidence * 100).toFixed(1)}%`} />
      </Section>
    </div>
  )
}

// Phase 3: Openings
function Phase3Formatted({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Section title="문">
        <Item label="총 개수" value={data.metadata.totalDoors} />
      </Section>

      <Section title="창문">
        <Item label="총 개수" value={data.metadata.totalWindows} />
      </Section>

      <Section title="메타데이터">
        <Item label="신뢰도" value={`${(data.metadata.confidence * 100).toFixed(1)}%`} />
      </Section>
    </div>
  )
}

// Phase 4: Spaces
function Phase4Formatted({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Section title="공간">
        <Item label="총 개수" value={data.metadata.totalSpaces} />
        <Item label="총 면적" value={`${data.metadata.totalArea.toFixed(2)} m²`} />
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {data.spaces.map((space: any) => (
            <div key={space.id} className="text-xs bg-neutral-warmGray/5 p-2 rounded">
              <div className="font-medium">{space.name}</div>
              <div className="text-neutral-warmGray">
                {space.type} • {space.area.toFixed(2)} m²
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="메타데이터">
        <Item label="신뢰도" value={`${(data.metadata.confidence * 100).toFixed(1)}%`} />
      </Section>
    </div>
  )
}

// Phase 5: Dimensions
function Phase5Formatted({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Section title="치수">
        <Item label="벽" value={`${data.dimensions.walls.length}개`} />
        <Item label="공간" value={`${data.dimensions.spaces.length}개`} />
        <Item label="개구부" value={`${data.dimensions.openings.length}개`} />
      </Section>

      <Section title="메타데이터">
        <Item label="단위" value={data.metadata.unit} />
        <Item label="신뢰도" value={`${(data.metadata.confidence * 100).toFixed(1)}%`} />
      </Section>
    </div>
  )
}

// Phase 6: Master JSON (기존 Phase 7 승격)
function Phase6Formatted({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Section title="프로젝트">
        {data.metadata.projectName && (
          <Item label="이름" value={data.metadata.projectName} />
        )}
        <Item label="버전" value={data.metadata.version} />
        <Item label="생성일" value={new Date(data.metadata.createdAt).toLocaleString('ko-KR')} />
      </Section>

      <Section title="건물 요소">
        <Item label="벽" value={`${data.building.walls.length}개`} />
        <Item label="문" value={`${data.building.doors.length}개`} />
        <Item label="창문" value={`${data.building.windows.length}개`} />
        <Item label="공간" value={`${data.building.spaces.length}개`} />
      </Section>

      <Section title="치수">
        <Item label="총 면적" value={`${data.dimensions.totalArea.toFixed(2)} m²`} />
        <Item label="벽 길이" value={`${data.dimensions.wallLength.toFixed(2)} m`} />
      </Section>

      <Section title="검증">
        <Item label="신뢰도" value={`${(data.verification.confidence * 100).toFixed(1)}%`} />
      </Section>
    </div>
  )
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-primary-navy mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Item({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-warmGray">{label}</span>
      <span className="font-medium text-primary-navy">{value}</span>
    </div>
  )
}
