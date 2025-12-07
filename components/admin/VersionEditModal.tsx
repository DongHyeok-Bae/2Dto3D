'use client'

import { useState, useEffect } from 'react'

interface VersionEditModalProps {
  isOpen: boolean
  currentVersion: string
  onConfirm: (newVersion: string) => void
  onCancel: () => void
}

export default function VersionEditModal({
  isOpen,
  currentVersion,
  onConfirm,
  onCancel,
}: VersionEditModalProps) {
  const [newVersion, setNewVersion] = useState(currentVersion)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNewVersion(currentVersion)
      setError('')
    }
  }, [isOpen, currentVersion])

  const validateVersion = (version: string): boolean => {
    const semverRegex = /^\d+\.\d+\.\d+$/
    return semverRegex.test(version)
  }

  const handleSubmit = () => {
    if (!validateVersion(newVersion)) {
      setError('버전 형식이 올바르지 않습니다. (예: 1.0.0)')
      return
    }

    if (newVersion === currentVersion) {
      setError('현재 버전과 동일합니다.')
      return
    }

    onConfirm(newVersion)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary-navy/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-neo-lg shadow-neo-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-serif font-bold text-primary-navy mb-4">
          버전 수정
        </h3>

        <div className="mb-4">
          <label className="block text-sm text-neutral-warmGray mb-2">
            현재 버전: <span className="font-semibold">v{currentVersion}</span>
          </label>
          <input
            type="text"
            value={newVersion}
            onChange={(e) => {
              setNewVersion(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="새 버전 (예: 1.1.0)"
            className="input w-full"
            autoFocus
          />
          {error && (
            <p className="text-sm text-primary-crimson mt-1">{error}</p>
          )}
          <p className="text-xs text-neutral-warmGray mt-2">
            Semantic Versioning 형식으로 입력하세요 (Major.Minor.Patch)
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-warmGray/30 rounded-neo-md text-neutral-warmGray hover:bg-neutral-marble transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-navy text-white rounded-neo-md hover:bg-primary-navy/90 transition-colors"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  )
}
