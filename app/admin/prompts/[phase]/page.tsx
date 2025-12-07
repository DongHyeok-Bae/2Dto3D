'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import PromptEditor from '@/components/admin/PromptEditor'
import VersionListPanel, { PromptVersionItem } from '@/components/admin/VersionListPanel'
import Link from 'next/link'

export default function PhasePromptPage() {
  const params = useParams()
  const phase = params.phase as string
  const phaseNumber = parseInt(phase.replace('phase', ''), 10)

  const [promptContent, setPromptContent] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [isLoading, setIsLoading] = useState(true)
  const [versions, setVersions] = useState<PromptVersionItem[]>([])
  const [selectedVersionKey, setSelectedVersionKey] = useState<string | null>(null)
  const [versionsLoading, setVersionsLoading] = useState(true)

  // 버전 목록 로드
  const loadVersions = useCallback(async () => {
    setVersionsLoading(true)
    try {
      const response = await fetch(`/api/admin/prompts?phase=${phaseNumber}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.versions) {
          setVersions(data.versions)
        }
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
    } finally {
      setVersionsLoading(false)
    }
  }, [phaseNumber])

  // 최신 프롬프트 로드
  const loadPrompt = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/prompts/${phase}`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setPromptContent(data.content || '')
          setVersion(data.version || '1.0.0')
          // 로드된 버전의 key 설정
          const key = `phase${phaseNumber}_v${data.version || '1.0.0'}`
          setSelectedVersionKey(key)
        }
      }
    } catch (error) {
      console.error('Failed to load prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }, [phase, phaseNumber])

  useEffect(() => {
    loadPrompt()
    loadVersions()
  }, [loadPrompt, loadVersions])

  // 버전 선택 핸들러
  const handleSelectVersion = (versionItem: PromptVersionItem) => {
    setPromptContent(versionItem.content || '')
    setVersion(versionItem.version)
    setSelectedVersionKey(versionItem.key)
  }

  // 저장 핸들러
  const handleSave = async () => {
    if (!promptContent.trim()) {
      alert('프롬프트 내용을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseNumber,
          version,
          content: promptContent,
          isActive: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert('프롬프트가 저장되었습니다!')
        // 버전 목록 새로고침
        await loadVersions()
        // 새로 저장된 버전 선택
        if (data.prompt?.key) {
          setSelectedVersionKey(data.prompt.key)
        }
      } else {
        const error = await response.text()
        alert(`저장 실패: ${error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  // 활성화 핸들러
  const handleActivateVersion = async (versionItem: PromptVersionItem) => {
    try {
      const response = await fetch('/api/admin/prompts/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseNumber,
          key: versionItem.key,
          url: versionItem.url,
        }),
      })

      if (response.ok) {
        // 버전 목록 새로고침
        await loadVersions()
      } else {
        const error = await response.json()
        alert(`활성화 실패: ${error.error}`)
      }
    } catch (error) {
      console.error('Activate error:', error)
      alert('활성화 중 오류가 발생했습니다.')
    }
  }

  // 버전 수정 핸들러
  const handleEditVersion = async (versionItem: PromptVersionItem, newVersion: string) => {
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseNumber,
          key: versionItem.key,
          url: versionItem.url,
          newVersion,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // 버전 목록 새로고침
        await loadVersions()
        // 수정된 버전 선택
        if (data.newKey) {
          setSelectedVersionKey(data.newKey)
          setVersion(newVersion)
        }
      } else {
        const error = await response.json()
        alert(`수정 실패: ${error.error}`)
      }
    } catch (error) {
      console.error('Edit error:', error)
      alert('수정 중 오류가 발생했습니다.')
    }
  }

  // 삭제 핸들러
  const handleDeleteVersion = async (versionItem: PromptVersionItem) => {
    try {
      const params = new URLSearchParams()
      if (versionItem.key) params.set('key', versionItem.key)
      if (versionItem.url) params.set('url', versionItem.url)

      const response = await fetch(`/api/admin/prompts?${params.toString()}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 버전 목록 새로고침
        await loadVersions()
        // 삭제된 버전이 선택되어 있었다면 다른 버전 선택
        if (selectedVersionKey === versionItem.key) {
          const remaining = versions.filter(v => v.key !== versionItem.key)
          if (remaining.length > 0) {
            handleSelectVersion(remaining[0])
          }
        }
      } else {
        const error = await response.json()
        alert(`삭제 실패: ${error.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // versions에서 content 추가 (API에서 content 포함해서 내려옴)
  const versionsWithContent = versions.map(v => ({
    ...v,
    content: v.content || '',
  }))

  return (
    <div className="h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link
            href="/admin/prompts"
            className="text-sm text-primary-crimson hover:underline mb-2 inline-block"
          >
            ← 프롬프트 목록
          </Link>
          <h1 className="text-3xl font-serif font-bold text-primary-navy">
            Phase {phaseNumber} 프롬프트 편집
          </h1>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={version}
            onChange={e => setVersion(e.target.value)}
            placeholder="버전 (예: 1.0.0)"
            className="input w-32"
          />
          <button onClick={handleSave} className="btn-primary">
            저장
          </button>
        </div>
      </div>

      {/* Main Content - Editor + Side Panel */}
      <div className="flex h-[calc(100%-80px)] gap-0 border border-neutral-warmGray/30 rounded-neo-md overflow-hidden">
        {/* Editor Section - 70% */}
        <div className="flex-[7] min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-neutral-marble">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-neutral-warmGray">프롬프트 데이터 로딩 중...</p>
              </div>
            </div>
          ) : (
            <PromptEditor
              initialValue={promptContent}
              onChange={setPromptContent}
            />
          )}
        </div>

        {/* Version List Panel - 30% */}
        <div className="flex-[3] min-w-[280px] max-w-[360px]">
          <VersionListPanel
            phaseNumber={phaseNumber}
            versions={versionsWithContent}
            selectedVersionKey={selectedVersionKey}
            onSelectVersion={handleSelectVersion}
            onActivateVersion={handleActivateVersion}
            onEditVersion={handleEditVersion}
            onDeleteVersion={handleDeleteVersion}
            isLoading={versionsLoading}
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 card">
        <h3 className="font-semibold text-primary-navy mb-2">
          프롬프트 작성 가이드
        </h3>
        <ul className="text-sm text-neutral-warmGray space-y-1">
          <li>• 명확한 임무(Mission) 정의</li>
          <li>• 엄격한 JSON Schema 명시</li>
          <li>• 출력 규칙 명확화</li>
          <li>• 예시 포함 권장</li>
        </ul>
      </div>
    </div>
  )
}
