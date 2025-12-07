// 프롬프트 저장소 - 메모리 기반 (개발용)
// 실제 운영에서는 데이터베이스 사용 권장

// Next.js HMR(Hot Module Replacement)에서도 싱글톤 인스턴스를 유지하기 위해
// global 객체를 사용합니다. 이렇게 하면 모듈이 재로드되어도 동일한 인스턴스를 참조합니다.
declare global {
  var __promptStorage: PromptStorage | undefined
}

interface PromptData {
  id: string
  key: string
  phaseNumber: number
  version: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 싱글톤 패턴으로 구현하여 여러 파일에서 동일한 인스턴스 공유
class PromptStorage {
  private static instance: PromptStorage
  private storage: Map<string, PromptData>

  private constructor() {
    this.storage = new Map()
    console.log('[PromptStorage] Initialized')
  }

  static getInstance(): PromptStorage {
    if (!PromptStorage.instance) {
      PromptStorage.instance = new PromptStorage()
    }
    return PromptStorage.instance
  }

  getKey(phaseNumber: number, version: string): string {
    return `phase${phaseNumber}_v${version}`
  }

  save(phaseNumber: number, version: string, content: string, metadata: any): string {
    const key = this.getKey(phaseNumber, version)
    const data: PromptData = {
      ...metadata,
      key,
      phaseNumber,
      version,
      content,
    }
    this.storage.set(key, data)
    console.log(`[PromptStorage] Saved: ${key}`)
    return key
  }

  get(key: string): PromptData | undefined {
    return this.storage.get(key)
  }

  getByPhase(phaseNumber: number): PromptData[] {
    const results: PromptData[] = []
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`phase${phaseNumber}_`)) {
        results.push(value)
      }
    }
    return results
  }

  getLatestByPhase(phaseNumber: number): PromptData | null {
    const prompts = this.getByPhase(phaseNumber)
    if (prompts.length === 0) return null

    // 버전으로 정렬하여 최신 버전 반환
    return prompts.sort((a, b) => {
      const versionA = a.version.split('.').map(Number)
      const versionB = b.version.split('.').map(Number)
      for (let i = 0; i < 3; i++) {
        if (versionA[i] > versionB[i]) return -1
        if (versionA[i] < versionB[i]) return 1
      }
      return 0
    })[0]
  }

  delete(key: string): boolean {
    const result = this.storage.delete(key)
    if (result) {
      console.log(`[PromptStorage] Deleted: ${key}`)
    }
    return result
  }

  // 버전 번호 수정
  updateVersion(oldKey: string, newVersion: string): { success: boolean; newKey?: string; error?: string } {
    const data = this.storage.get(oldKey)
    if (!data) {
      return { success: false, error: 'Prompt not found' }
    }

    const newKey = this.getKey(data.phaseNumber, newVersion)

    // 새 버전 키가 이미 존재하는지 확인
    if (this.storage.has(newKey)) {
      return { success: false, error: 'Version already exists' }
    }

    // 새 키로 데이터 저장
    const updatedData: PromptData = {
      ...data,
      key: newKey,
      version: newVersion,
      updatedAt: new Date().toISOString(),
    }

    this.storage.set(newKey, updatedData)
    this.storage.delete(oldKey)

    console.log(`[PromptStorage] Updated version: ${oldKey} -> ${newKey}`)
    return { success: true, newKey }
  }

  // 특정 버전을 활성화 (같은 Phase의 다른 버전들은 비활성화)
  setActiveVersion(phaseNumber: number, key: string): { success: boolean; error?: string } {
    const targetPrompt = this.storage.get(key)
    if (!targetPrompt) {
      return { success: false, error: 'Prompt not found' }
    }

    if (targetPrompt.phaseNumber !== phaseNumber) {
      return { success: false, error: 'Phase number mismatch' }
    }

    // 같은 Phase의 모든 프롬프트 비활성화
    for (const [k, v] of this.storage.entries()) {
      if (v.phaseNumber === phaseNumber) {
        v.isActive = false
        this.storage.set(k, v)
      }
    }

    // 타겟 프롬프트 활성화
    targetPrompt.isActive = true
    targetPrompt.updatedAt = new Date().toISOString()
    this.storage.set(key, targetPrompt)

    console.log(`[PromptStorage] Activated: ${key}`)
    return { success: true }
  }

  // 활성 프롬프트 조회
  getActiveByPhase(phaseNumber: number): PromptData | null {
    const prompts = this.getByPhase(phaseNumber)
    return prompts.find(p => p.isActive) || null
  }

  getAll(): PromptData[] {
    return Array.from(this.storage.values())
  }

  clear(): void {
    this.storage.clear()
    console.log('[PromptStorage] Cleared all data')
  }

  getStats() {
    const total = this.storage.size
    const byPhase: Record<number, number> = {}

    for (const key of this.storage.keys()) {
      const match = key.match(/phase(\d+)_/)
      if (match) {
        const phase = parseInt(match[1])
        byPhase[phase] = (byPhase[phase] || 0) + 1
      }
    }

    return {
      total,
      byPhase,
      timestamp: new Date().toISOString()
    }
  }
}

// 싱글톤 인스턴스 export
// Next.js 개발 모드에서 HMR이 발생해도 동일한 인스턴스를 유지하도록
// global 객체에 저장합니다.
export const promptStorage =
  global.__promptStorage ??
  (global.__promptStorage = PromptStorage.getInstance())

// 기본 프롬프트 템플릿
export const defaultPromptTemplate = `# Phase {phase} Prompt

## Mission
Phase {phase}에 대한 프롬프트를 작성하세요.

## Input Schema
\`\`\`json
{
  "type": "object",
  "properties": {
    // 입력 스키마 정의
  }
}
\`\`\`

## Output Schema
\`\`\`json
{
  "type": "object",
  "properties": {
    // 출력 스키마 정의
  }
}
\`\`\`

## Rules
1. 규칙 1
2. 규칙 2
3. 규칙 3

## Examples
예시를 여기에 추가하세요.`