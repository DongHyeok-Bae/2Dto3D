'use client'

import { useState, useRef } from 'react'
import { usePipelineStore } from '@/store/pipelineStore'
import {
  saveProjectToFile,
  loadProjectFromFile,
  createProjectTemplate,
  type ProjectData,
} from '@/lib/project/projectManager'

interface ProjectManagerProps {
  onProjectLoad?: (project: ProjectData) => void
}

export default function ProjectManager({ onProjectLoad }: ProjectManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadedImage, results } = usePipelineStore()

  const handleSaveProject = () => {
    const projectData = {
      name: projectName || 'Untitled Project',
      version: '1.0.0',
      image: uploadedImage,
      results,
      metadata: {
        tool: '2D to 3D BIM Converter',
        organization: 'Kyung Hee University',
        description: projectDescription,
        author: '',
        tags: [],
      },
    }

    saveProjectToFile(projectData)
    setIsOpen(false)
    setProjectName('')
    setProjectDescription('')
  }

  const handleLoadProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      const projectData = await loadProjectFromFile(file)

      // Store에 프로젝트 데이터 로드
      const store = usePipelineStore.getState()

      // 이미지 설정
      if (projectData.image) {
        store.setUploadedImage(projectData.image)
      }

      // 각 Phase 결과 설정
      Object.entries(projectData.results).forEach(([phase, result]) => {
        const phaseNumber = parseInt(phase.replace('phase', ''))
        if (!isNaN(phaseNumber)) {
          store.setPhaseResult(phaseNumber, result)
        }
      })

      // 콜백 호출
      onProjectLoad?.(projectData)

      // 성공 메시지
      alert(`프로젝트 "${projectData.name}"이(가) 성공적으로 로드되었습니다.`)
    } catch (error) {
      console.error('Error loading project:', error)
      alert('프로젝트 파일을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Save/Load Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary flex-1"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2"
            />
          </svg>
          프로젝트 저장
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="btn-secondary flex-1"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-primary-navy/30 border-t-primary-navy rounded-full animate-spin" />
              불러오는 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              프로젝트 불러오기
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".2d3d,.json"
          onChange={handleLoadProject}
          className="hidden"
        />
      </div>

      {/* Save Project Form */}
      {isOpen && (
        <div className="card bg-primary-navy/5 border-primary-navy/20">
          <h4 className="text-sm font-semibold text-primary-navy mb-3">
            프로젝트 정보
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-warmGray mb-1">
                프로젝트 이름
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="프로젝트 이름을 입력하세요"
                className="w-full px-3 py-2 text-sm border border-neutral-warmGray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-crimson/20 focus:border-primary-crimson"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-warmGray mb-1">
                설명 (선택)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="프로젝트 설명을 입력하세요"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-neutral-warmGray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-crimson/20 focus:border-primary-crimson resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveProject}
                disabled={!uploadedImage || Object.keys(results).length === 0}
                className="btn-primary flex-1"
              >
                저장하기
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setProjectName('')
                  setProjectDescription('')
                }}
                className="btn-secondary flex-1"
              >
                취소
              </button>
            </div>

            {(!uploadedImage || Object.keys(results).length === 0) && (
              <p className="text-xs text-primary-crimson">
                ⚠️ 저장할 데이터가 없습니다. 먼저 이미지를 업로드하고 분석을 실행하세요.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Project Info Display */}
      {uploadedImage && Object.keys(results).length > 0 && (
        <div className="text-xs text-neutral-warmGray space-y-1">
          <div className="flex justify-between">
            <span>이미지:</span>
            <span className="text-primary-navy">✓ 로드됨</span>
          </div>
          <div className="flex justify-between">
            <span>완료된 단계:</span>
            <span className="text-primary-navy">
              {Object.keys(results).filter((key) => key.startsWith('phase')).length} / 7
            </span>
          </div>
          <div className="flex justify-between">
            <span>상태:</span>
            <span className="text-accent-emerald">저장 가능</span>
          </div>
        </div>
      )}
    </div>
  )
}