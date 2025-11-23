'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import PromptEditor from '@/components/admin/PromptEditor'
import Link from 'next/link'

export default function PhasePromptPage() {
  const params = useParams()
  const phase = params.phase as string
  const phaseNumber = parseInt(phase.replace('phase', ''), 10)

  const [promptContent, setPromptContent] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [isLoading, setIsLoading] = useState(true)

  // 기존 프롬프트 데이터 로드
  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const response = await fetch(`/api/admin/prompts/${phase}`)
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setPromptContent(data.content || '')
            setVersion(data.version || '1.0.0')
          }
        }
      } catch (error) {
        console.error('Failed to load prompt:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPrompt()
  }, [phase])

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
        alert('프롬프트가 저장되었습니다!')
      } else {
        const error = await response.text()
        alert(`저장 실패: ${error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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

      {/* Editor */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[600px] border border-neutral-warmGray/30 rounded-neo-md bg-neutral-marble">
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

      {/* Info */}
      <div className="mt-6 card">
        <h3 className="font-semibold text-primary-navy mb-2">
          💡 프롬프트 작성 가이드
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
