/**
 * 프로젝트 관리 유틸리티
 * 프로젝트 저장, 불러오기, 버전 관리
 */

import { put, list, del, head } from '@vercel/blob'
import type { MasterJSON } from '@/types'
import type { PipelineResults } from '@/store/pipelineStore'

/**
 * 프로젝트 데이터 인터페이스
 */
export interface ProjectData {
  id: string
  name: string
  version: string
  createdAt: string
  updatedAt: string
  image: string | null
  results: PipelineResults
  metadata: {
    tool: string
    organization: string
    author?: string
    description?: string
    tags?: string[]
  }
}

/**
 * 프로젝트 메타데이터 (목록 표시용)
 */
export interface ProjectMetadata {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  size?: number
  thumbnail?: string
  description?: string
  tags?: string[]
}

/**
 * Vercel Blob Storage에 프로젝트 저장
 */
export async function saveProjectToCloud(
  projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const project: ProjectData = {
    ...projectData,
    id: `project_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    // 프로젝트 데이터를 JSON으로 저장
    const blob = await put(
      `projects/${project.id}/data.json`,
      JSON.stringify(project, null, 2),
      {
        access: 'public',
        contentType: 'application/json',
      }
    )

    // 썸네일이 있다면 별도로 저장
    if (project.image) {
      await put(`projects/${project.id}/thumbnail.png`, project.image, {
        access: 'public',
        contentType: 'image/png',
      })
    }

    return blob.url
  } catch (error) {
    console.error('Error saving project to cloud:', error)
    throw error
  }
}

/**
 * Vercel Blob Storage에서 프로젝트 목록 가져오기
 */
export async function listProjectsFromCloud(): Promise<ProjectMetadata[]> {
  try {
    const { blobs } = await list({
      prefix: 'projects/',
    })

    // data.json 파일만 필터링
    const projectBlobs = blobs.filter(blob => blob.pathname.endsWith('/data.json'))

    const projects: ProjectMetadata[] = []

    for (const blob of projectBlobs) {
      try {
        const response = await fetch(blob.url)
        const data: ProjectData = await response.json()

        projects.push({
          id: data.id,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          size: blob.size,
          description: data.metadata.description,
          tags: data.metadata.tags,
        })
      } catch (error) {
        console.error(`Error loading project metadata from ${blob.url}:`, error)
      }
    }

    // 최신 순으로 정렬
    projects.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return projects
  } catch (error) {
    console.error('Error listing projects from cloud:', error)
    throw error
  }
}

/**
 * Vercel Blob Storage에서 프로젝트 불러오기
 */
export async function loadProjectFromCloud(projectId: string): Promise<ProjectData> {
  try {
    const { blobs } = await list({
      prefix: `projects/${projectId}/`,
    })

    const dataBlob = blobs.find(blob => blob.pathname.endsWith('/data.json'))

    if (!dataBlob) {
      throw new Error(`Project ${projectId} not found`)
    }

    const response = await fetch(dataBlob.url)
    const projectData: ProjectData = await response.json()

    return projectData
  } catch (error) {
    console.error('Error loading project from cloud:', error)
    throw error
  }
}

/**
 * Vercel Blob Storage에서 프로젝트 삭제
 */
export async function deleteProjectFromCloud(projectId: string): Promise<void> {
  try {
    const { blobs } = await list({
      prefix: `projects/${projectId}/`,
    })

    // 프로젝트 관련 모든 파일 삭제
    for (const blob of blobs) {
      await del(blob.url)
    }
  } catch (error) {
    console.error('Error deleting project from cloud:', error)
    throw error
  }
}

/**
 * 로컬 파일로 프로젝트 저장
 */
export function saveProjectToFile(
  projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>
): void {
  const project: ProjectData = {
    ...projectData,
    id: `project_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name || 'project'}_${project.id}.2d3d`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 로컬 파일에서 프로젝트 불러오기
 */
export function loadProjectFromFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const projectData: ProjectData = JSON.parse(json)
        resolve(projectData)
      } catch (error) {
        reject(new Error('Invalid project file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * 프로젝트 버전 비교
 */
export function compareProjectVersions(
  project1: ProjectData,
  project2: ProjectData
): {
  differences: string[]
  added: string[]
  removed: string[]
  modified: string[]
} {
  const differences: string[] = []
  const added: string[] = []
  const removed: string[] = []
  const modified: string[] = []

  // 메타데이터 비교
  if (project1.name !== project2.name) {
    modified.push('Project name')
  }

  // Phase 결과 비교
  const phases = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5', 'phase6', 'phase7'] as const

  for (const phase of phases) {
    const has1 = phase in project1.results
    const has2 = phase in project2.results

    if (has1 && !has2) {
      removed.push(phase)
    } else if (!has1 && has2) {
      added.push(phase)
    } else if (has1 && has2) {
      // 간단한 JSON 비교 (깊은 비교는 복잡할 수 있음)
      const json1 = JSON.stringify(project1.results[phase])
      const json2 = JSON.stringify(project2.results[phase])

      if (json1 !== json2) {
        modified.push(phase)
      }
    }
  }

  // 전체 차이점 요약
  if (added.length > 0) {
    differences.push(`Added phases: ${added.join(', ')}`)
  }
  if (removed.length > 0) {
    differences.push(`Removed phases: ${removed.join(', ')}`)
  }
  if (modified.length > 0) {
    differences.push(`Modified: ${modified.join(', ')}`)
  }

  return {
    differences,
    added,
    removed,
    modified,
  }
}

/**
 * 프로젝트 템플릿 생성
 */
export function createProjectTemplate(name: string = 'New Project'): ProjectData {
  return {
    id: `project_${Date.now()}`,
    name,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    image: null,
    results: {},
    metadata: {
      tool: '2D to 3D BIM Converter',
      organization: 'Kyung Hee University',
      author: '',
      description: '',
      tags: [],
    },
  }
}