'use client'

import { useState } from 'react'

interface ViewerControlsProps {
  onOptionsChange: (options: ViewerOptions) => void
}

export interface ViewerOptions {
  showSpaces: boolean
  showFloor: boolean
  showGrid: boolean
  showAxes: boolean
  wireframe: boolean
}

export default function ViewerControls({ onOptionsChange }: ViewerControlsProps) {
  const [options, setOptions] = useState<ViewerOptions>({
    showSpaces: true,
    showFloor: true,
    showGrid: true,
    showAxes: false,
    wireframe: false,
  })

  const [isOpen, setIsOpen] = useState(true)

  const handleToggle = (key: keyof ViewerOptions) => {
    const newOptions = {
      ...options,
      [key]: !options[key],
    }
    setOptions(newOptions)
    onOptionsChange(newOptions)
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-semibold text-primary-navy">
          뷰어 설정
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-warmGray hover:text-primary-crimson"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Controls */}
      {isOpen && (
        <div className="space-y-3">
          <ToggleOption
            label="공간 표시"
            description="공간 경계 바닥 표시"
            checked={options.showSpaces}
            onChange={() => handleToggle('showSpaces')}
          />

          <ToggleOption
            label="바닥 표시"
            description="전체 바닥면 표시"
            checked={options.showFloor}
            onChange={() => handleToggle('showFloor')}
          />

          <ToggleOption
            label="그리드 표시"
            description="바닥 그리드 표시"
            checked={options.showGrid}
            onChange={() => handleToggle('showGrid')}
          />

          <ToggleOption
            label="축 표시"
            description="X, Y, Z 축 표시"
            checked={options.showAxes}
            onChange={() => handleToggle('showAxes')}
          />

          <ToggleOption
            label="와이어프레임 모드"
            description="모델을 선으로 표시"
            checked={options.wireframe}
            onChange={() => handleToggle('wireframe')}
          />
        </div>
      )}

      {/* Legend */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-warmGray/20">
          <h4 className="text-sm font-semibold text-primary-navy mb-2">
            색상 범례
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <ColorLegend color="#9A212D" label="외벽" />
            <ColorLegend color="#8B8680" label="내벽" />
            <ColorLegend color="#00A86B" label="문" />
            <ColorLegend color="#0066CC" label="창문" />
            <ColorLegend color="#C5A059" label="파티션" />
            <ColorLegend color="#2C2C2C" label="기둥" />
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded border-neutral-warmGray/30 text-primary-crimson focus:ring-primary-crimson focus:ring-offset-0 cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-primary-navy group-hover:text-primary-crimson transition-colors">
          {label}
        </div>
        <div className="text-xs text-neutral-warmGray">{description}</div>
      </div>
    </label>
  )
}

function ColorLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded border border-neutral-warmGray/20"
        style={{ backgroundColor: color }}
      />
      <span className="text-neutral-warmGray">{label}</span>
    </div>
  )
}
