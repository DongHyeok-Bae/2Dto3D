'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import PromptEditor from '@/components/admin/PromptEditor'
import Link from 'next/link'

export default function PhasePromptPage() {
  const params = useParams()
  const phase = params.phase as string
  const phaseNumber = parseInt(phase.replace('phase', ''), 10)

  const [promptContent, setPromptContent] = useState('')
  const [version, setVersion] = useState('1.0.0')

  const handleSave = async () => {
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
      <PromptEditor
        initialValue={promptContent}
        onChange={setPromptContent}
      />

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
