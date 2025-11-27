// ===== Phase별 결과 타입 =====

export interface Phase1Result {
  normalization: {
    imageBounds: {
      width: number
      height: number
      unit: 'px'
    }
    origin: {
      x: number
      y: number
    }
    status: string
  }
}

export interface Phase2Result {
  walls: Array<{
    id: string
    type: 'exterior' | 'interior' | 'loadBearing' | 'partition'
    geometry: {
      start: { x: number; y: number }
      end: { x: number; y: number }
    }
    thickness: number
    height?: number
    material?: string
  }>
  columns?: Array<{
    id: string
    position: { x: number; y: number }
    shape: 'rectangular' | 'circular' | 'H-beam' | 'I-beam'
    dimensions: {
      width: number
      depth?: number
    }
  }>
  metadata: {
    totalWalls: number
    totalColumns?: number
    confidence: number
  }
}

export interface Phase3Result {
  doors: Array<{
    id: string
    position: {
      breakStart: { x: number; y: number }
      breakEnd: { x: number; y: number }
    }
    detectionMethod: string
  }>
  windows: Array<{
    id: string
    position: {
      breakStart: { x: number; y: number }
      breakEnd: { x: number; y: number }
    }
    detectionMethod: string
  }>
}

export interface Phase4Result {
  spaces: Array<{
    id: string
    boundary: Array<{ x: number; y: number }>
    pixelArea: number
    typeInferred: 'living_assumed' | 'kitchen_assumed' | 'bedroom_assumed' | 'bathroom_assumed' | 'entrance_assumed' | 'room_unknown'
    inferenceReason: string
  }>
}

export interface Phase5Result {
  dimensions: {
    pixelToMm: {
      ratio: number
      anchorUsed: string
      anchorConfidence: number
    }
    buildingOverall: {
      width: number
      depth: number
      method: string
    }
  }
  appliedStandards: {
    note: string
    wallThickness: Array<{
      type: string
      thickness: number
      unit: string
    }>
    openingSizes: Array<{
      type: string
      widthSource: string
      height: number
      unit: string
    }>
  }
  validation: {
    conflicts: Array<{
      featureId: string
      property: string
      ocrValue: number
      pixelDerivedValue: number
      message: string
    }>
  }
}

// Phase6Result 삭제됨 - Phase 6은 이제 MasterJSON을 출력 (기존 Phase 7의 역할)

export interface MasterJSON {
  metadata: {
    sourceType: string
    extractionMethod: string
    scaleConfidence: number
  }
  levels: Array<{
    levelName: string
    elevation: number
  }>
  components: {
    slabs: Array<{
      id: string
      level: string
      footprint: Array<{ x: number; y: number; z: number }>
      thickness: number
    }>
    walls: Array<{
      id: string
      level: string
      start: { x: number; y: number; z: number }
      end: { x: number; y: number; z: number }
      height: number
      thickness: number
    }>
    openings: {
      doors: Array<{
        id: string
        position: { x: number; y: number; z: number }
        width: number
        height: number
      }>
      windows: Array<{
        id: string
        position: { x: number; y: number; z: number }
        width: number
        height: number
        sillHeight: number
      }>
    }
    spaces: Array<{
      id: string
      typeInferred: string
      boundary_mm: Array<{ x: number; y: number; z: number }>
    }>
  }
}

// ===== 프롬프트 관리 타입 =====

export interface PromptVersion {
  id: string
  phaseNumber: 1 | 2 | 3 | 4 | 5 | 6
  version: string
  content: string
  schema: object
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  testResults: {
    successRate: number
    avgExecutionTime: number
    errorCount: number
    lastTested: Date | null
  }
}

export interface ExecutionResult {
  id: string
  promptVersionId: string
  phaseNumber: number
  inputData: {
    image?: string
    previousPhaseResults?: any[]
  }
  outputData: any
  executionTime: number
  status: 'success' | 'error' | 'partial'
  errorLog?: string
  timestamp: Date
}

// ===== Zustand Store 타입 =====

export interface PipelineState {
  currentPhase: number
  results: {
    phase1?: Phase1Result
    phase2?: Phase2Result
    phase3?: Phase3Result
    phase4?: Phase4Result
    phase5?: Phase5Result
    phase6?: MasterJSON // Phase 6 = Master JSON Assembly (기존 Phase 7)
  }
  uploadedImage: string | null
  setCurrentPhase: (phase: number) => void
  setPhaseResult: (phase: number, result: any) => void
  setUploadedImage: (image: string) => void
  reset: () => void
}

export interface PromptManagementState {
  prompts: Record<number, PromptVersion[]>
  activePromptIds: Record<number, string>
  loadPrompts: (phase: number) => Promise<void>
  savePrompt: (prompt: Omit<PromptVersion, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  setActivePrompt: (phase: number, promptId: string) => Promise<void>
  deletePrompt: (promptId: string) => Promise<void>
}
