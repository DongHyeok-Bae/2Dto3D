'use client'

import { useState } from 'react'
import DeleteConfirmModal from './DeleteConfirmModal'
import VersionEditModal from './VersionEditModal'

export interface PromptVersionItem {
  id: string
  key: string
  version: string
  content?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  url?: string
}

interface VersionListPanelProps {
  phaseNumber: number
  versions: PromptVersionItem[]
  selectedVersionKey: string | null
  onSelectVersion: (version: PromptVersionItem) => void
  onActivateVersion: (version: PromptVersionItem) => Promise<void>
  onEditVersion: (version: PromptVersionItem, newVersion: string) => Promise<void>
  onDeleteVersion: (version: PromptVersionItem) => Promise<void>
  isLoading?: boolean
}

export default function VersionListPanel({
  phaseNumber,
  versions,
  selectedVersionKey,
  onSelectVersion,
  onActivateVersion,
  onEditVersion,
  onDeleteVersion,
  isLoading = false,
}: VersionListPanelProps) {
  const [deleteTarget, setDeleteTarget] = useState<PromptVersionItem | null>(null)
  const [editTarget, setEditTarget] = useState<PromptVersionItem | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 버전을 정렬 (최신 버전이 위로)
  const sortedVersions = [...versions].sort((a, b) => {
    const vA = a.version.split('.').map(Number)
    const vB = b.version.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (vA[i] > vB[i]) return -1
      if (vA[i] < vB[i]) return 1
    }
    return 0
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleActivate = async (version: PromptVersionItem) => {
    if (version.isActive) return
    setActionLoading(version.key)
    try {
      await onActivateVersion(version)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditConfirm = async (newVersion: string) => {
    if (!editTarget) return
    setActionLoading(editTarget.key)
    try {
      await onEditVersion(editTarget, newVersion)
    } finally {
      setActionLoading(null)
      setEditTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.key)
    try {
      await onDeleteVersion(deleteTarget)
    } finally {
      setActionLoading(null)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="h-full flex flex-col border-l border-neutral-warmGray/20">
      {/* Header */}
      <div className="p-4 bg-primary-navy text-white">
        <h3 className="font-serif font-bold">버전 히스토리</h3>
        <p className="text-sm text-white/70 mt-1">
          Phase {phaseNumber} - {versions.length}개 버전
        </p>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="w-6 h-6 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-neutral-warmGray">로딩 중...</p>
          </div>
        ) : sortedVersions.length === 0 ? (
          <div className="p-4 text-center text-neutral-warmGray">
            <p className="text-sm">저장된 버전이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-warmGray/10">
            {sortedVersions.map((version) => {
              const isSelected = version.key === selectedVersionKey
              const isActionLoading = actionLoading === version.key

              return (
                <div
                  key={version.key}
                  className={`p-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-gold/10 border-l-2 border-primary-gold'
                      : 'hover:bg-neutral-marble'
                  }`}
                  onClick={() => onSelectVersion(version)}
                >
                  {/* Version Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary-navy">
                      v{version.version}
                    </span>
                    {version.isActive && (
                      <span className="px-1.5 py-0.5 bg-accent-emerald/10 text-accent-emerald text-xs rounded">
                        활성
                      </span>
                    )}
                    {isSelected && (
                      <span className="px-1.5 py-0.5 bg-primary-gold/10 text-primary-gold text-xs rounded">
                        편집 중
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-neutral-warmGray mb-2">
                    {formatDate(version.updatedAt)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Activate Button */}
                    <button
                      onClick={() => handleActivate(version)}
                      disabled={version.isActive || isActionLoading}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        version.isActive
                          ? 'bg-neutral-warmGray/10 text-neutral-warmGray/50 cursor-not-allowed'
                          : 'bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20'
                      }`}
                      title={version.isActive ? '이미 활성화됨' : '이 버전을 활성화'}
                    >
                      {isActionLoading ? '...' : '활성화'}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditTarget(version)}
                      disabled={isActionLoading}
                      className="px-2 py-1 text-xs rounded bg-primary-navy/10 text-primary-navy hover:bg-primary-navy/20 transition-colors"
                    >
                      수정
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteTarget(version)}
                      disabled={version.isActive || isActionLoading}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        version.isActive
                          ? 'bg-neutral-warmGray/10 text-neutral-warmGray/50 cursor-not-allowed'
                          : 'bg-primary-crimson/10 text-primary-crimson hover:bg-primary-crimson/20'
                      }`}
                      title={version.isActive ? '활성 버전은 삭제할 수 없습니다' : '이 버전 삭제'}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        version={deleteTarget?.version || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Version Edit Modal */}
      <VersionEditModal
        isOpen={editTarget !== null}
        currentVersion={editTarget?.version || ''}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditTarget(null)}
      />
    </div>
  )
}
