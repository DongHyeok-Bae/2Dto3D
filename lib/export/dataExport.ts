/**
 * 데이터 내보내기 유틸리티
 * 다양한 형식으로 데이터를 내보내는 기능 제공
 */

import type { MasterJSON, Phase1Result, Phase2Result, Phase3Result, Phase4Result, Phase5Result } from '@/types'

/**
 * JSON 내보내기
 */
export function exportAsJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadFile(blob, `${filename}.json`)
}

/**
 * CSV 내보내기 - 벽 데이터
 */
export function exportWallsAsCSV(walls: Phase2Result['walls']) {
  const headers = ['ID', 'Type', 'Start X', 'Start Y', 'End X', 'End Y', 'Thickness (m)', 'Height (m)']
  const rows = walls.map(wall => [
    wall.id,
    wall.type,
    wall.geometry.start.x,
    wall.geometry.start.y,
    wall.geometry.end.x,
    wall.geometry.end.y,
    wall.thickness || 0.15,
    wall.height || 2.7,
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  downloadFile(blob, 'walls.csv')
}

/**
 * CSV 내보내기 - 공간 데이터
 */
export function exportSpacesAsCSV(spaces: Phase4Result['spaces']) {
  const headers = ['ID', 'Type', 'Pixel Area', 'Inference Reason']
  const rows = spaces.map(space => [
    space.id,
    space.typeInferred,
    space.pixelArea,
    space.inferenceReason,
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  downloadFile(blob, 'spaces.csv')
}

/**
 * CSV 내보내기 - 문 데이터
 */
export function exportDoorsAsCSV(doors: Phase3Result['doors']) {
  const headers = ['ID', 'Break Start X', 'Break Start Y', 'Break End X', 'Break End Y', 'Detection Method']
  const rows = doors.map(door => [
    door.id,
    door.position.breakStart.x,
    door.position.breakStart.y,
    door.position.breakEnd.x,
    door.position.breakEnd.y,
    door.detectionMethod,
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  downloadFile(blob, 'doors.csv')
}

/**
 * CSV 내보내기 - 창문 데이터
 */
export function exportWindowsAsCSV(windows: Phase3Result['windows']) {
  const headers = ['ID', 'Break Start X', 'Break Start Y', 'Break End X', 'Break End Y', 'Detection Method']
  const rows = windows.map(window => [
    window.id,
    window.position.breakStart.x,
    window.position.breakStart.y,
    window.position.breakEnd.x,
    window.position.breakEnd.y,
    window.detectionMethod,
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  downloadFile(blob, 'windows.csv')
}

/**
 * Master JSON을 IFC-like 형식으로 변환
 * (간단한 텍스트 형식, 실제 IFC는 더 복잡함)
 */
export function exportAsIFCLike(masterJSON: MasterJSON) {
  let ifc = '# 2D to 3D BIM Converter Export\n'
  ifc += '# Generated: ' + new Date().toISOString() + '\n\n'

  // Project Info
  ifc += '## PROJECT INFORMATION\n'
  ifc += `Source Type: ${masterJSON.metadata?.sourceType || 'Unknown'}\n`
  ifc += `Extraction Method: ${masterJSON.metadata?.extractionMethod || 'Unknown'}\n`
  ifc += `Scale Confidence: ${masterJSON.metadata?.scaleConfidence || 0}\n`
  ifc += `Floors: ${masterJSON.levels?.length || 1}\n\n`

  // Levels
  ifc += '## LEVELS\n'
  if (masterJSON.levels) {
    masterJSON.levels.forEach(level => {
      ifc += `LEVEL: ${level.levelName}, Elevation=${level.elevation}\n`
    })
    ifc += '\n'
  }

  // Building Elements
  ifc += '## BUILDING ELEMENTS\n\n'

  // Walls
  if (masterJSON.components?.walls) {
    ifc += `### WALLS (${masterJSON.components.walls.length} elements)\n`
    masterJSON.components.walls.forEach(wall => {
      ifc += `WALL ${wall.id}: Level=${wall.level}, Start=(${wall.start.x}, ${wall.start.y}), End=(${wall.end.x}, ${wall.end.y}), Height=${wall.height}, Thickness=${wall.thickness}\n`
    })
    ifc += '\n'
  }

  // Spaces
  if (masterJSON.components?.spaces) {
    ifc += `### SPACES (${masterJSON.components.spaces.length} elements)\n`
    masterJSON.components.spaces.forEach(space => {
      ifc += `SPACE ${space.id}: Type="${space.typeInferred}"\n`
    })
    ifc += '\n'
  }

  const blob = new Blob([ifc], { type: 'text/plain' })
  downloadFile(blob, 'model.ifc.txt')
}

/**
 * 전체 프로젝트 데이터 내보내기 (ZIP 형식 대신 단일 JSON)
 */
export function exportProject(
  uploadedImage: string | null,
  results: {
    phase1?: Phase1Result
    phase2?: Phase2Result
    phase3?: Phase3Result
    phase4?: Phase4Result
    phase5?: Phase5Result
    phase6?: any
    phase7?: MasterJSON
  }
) {
  const projectData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    image: uploadedImage,
    results,
    metadata: {
      tool: '2D to 3D BIM Converter',
      organization: 'Kyung Hee University',
    },
  }

  exportAsJSON(projectData, `project_${Date.now()}`)
}

/**
 * 파일 다운로드 헬퍼
 */
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 이미지 내보내기 (Base64를 실제 이미지 파일로)
 */
export function exportImage(base64: string, filename: string = 'floor_plan.png') {
  // data:image/png;base64, 제거
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'image/png' })
  downloadFile(blob, filename)
}