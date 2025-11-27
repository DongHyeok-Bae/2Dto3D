'use client'

import { useState } from 'react'
import {
  exportAsJSON,
  exportWallsAsCSV,
  exportSpacesAsCSV,
  exportDoorsAsCSV,
  exportWindowsAsCSV,
  exportAsIFCLike,
  exportProject,
  exportImage,
} from '@/lib/export/dataExport'
import { exportAsGLTF, exportAsOBJ, exportAsSTL } from '@/lib/export/modelExport'
import { saveProjectToFile, type ProjectData } from '@/lib/project/projectManager'
import type { MasterJSON } from '@/types'
import { usePipelineStore } from '@/store/pipelineStore'

interface ExportPanelProps {
  masterJSON?: MasterJSON | null
  onClose?: () => void
}

type ExportFormat = 'json' | 'csv' | 'ifc' | 'gltf' | 'glb' | 'obj' | 'stl' | 'project' | 'image'
type CSVType = 'walls' | 'spaces' | 'doors' | 'windows'

export default function ExportPanel({ masterJSON, onClose }: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [csvType, setCsvType] = useState<CSVType>('walls')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const { uploadedImage, results } = usePipelineStore()

  const handleExport = async () => {
    if (!masterJSON && !results.phase6) {
      setExportStatus({
        type: 'error',
        message: '내보낼 데이터가 없습니다.',
      })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    const data = masterJSON || results.phase6

    try {
      switch (selectedFormat) {
        case 'json':
          exportAsJSON(data, 'master_json')
          setExportStatus({
            type: 'success',
            message: 'JSON 파일이 다운로드되었습니다.',
          })
          break

        case 'csv':
          switch (csvType) {
            case 'walls':
              if (results.phase2?.walls) {
                exportWallsAsCSV(results.phase2.walls)
              }
              break
            case 'spaces':
              if (results.phase4?.spaces) {
                exportSpacesAsCSV(results.phase4.spaces)
              }
              break
            case 'doors':
              if (results.phase3?.doors) {
                exportDoorsAsCSV(results.phase3.doors)
              }
              break
            case 'windows':
              if (results.phase3?.windows) {
                exportWindowsAsCSV(results.phase3.windows)
              }
              break
          }
          setExportStatus({
            type: 'success',
            message: `${csvType} CSV 파일이 다운로드되었습니다.`,
          })
          break

        case 'ifc':
          if (data) {
            exportAsIFCLike(data)
            setExportStatus({
              type: 'success',
              message: 'IFC-like 파일이 다운로드되었습니다.',
            })
          }
          break

        case 'gltf':
          if (data) {
            await exportAsGLTF(data, { binary: false })
            setExportStatus({
              type: 'success',
              message: 'glTF 파일이 다운로드되었습니다.',
            })
          }
          break

        case 'glb':
          if (data) {
            await exportAsGLTF(data, { binary: true })
            setExportStatus({
              type: 'success',
              message: 'GLB 파일이 다운로드되었습니다.',
            })
          }
          break

        case 'obj':
          if (data) {
            exportAsOBJ(data)
            setExportStatus({
              type: 'success',
              message: 'OBJ 파일이 다운로드되었습니다.',
            })
          }
          break

        case 'stl':
          if (data) {
            exportAsSTL(data, true)
            setExportStatus({
              type: 'success',
              message: 'STL 파일이 다운로드되었습니다.',
            })
          }
          break

        case 'project':
          exportProject(uploadedImage, results)
          setExportStatus({
            type: 'success',
            message: '프로젝트 파일이 다운로드되었습니다.',
          })
          break

        case 'image':
          if (uploadedImage) {
            exportImage(uploadedImage)
            setExportStatus({
              type: 'success',
              message: '이미지 파일이 다운로드되었습니다.',
            })
          }
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({
        type: 'error',
        message: '내보내기 중 오류가 발생했습니다.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportFormats = [
    { value: 'json', label: 'JSON', description: 'Master JSON 데이터', icon: '📄' },
    { value: 'csv', label: 'CSV', description: '표 형식 데이터', icon: '📊' },
    { value: 'ifc', label: 'IFC-like', description: 'BIM 교환 형식', icon: '🏗️' },
    { value: 'gltf', label: 'glTF', description: '3D 모델 (JSON)', icon: '🎨' },
    { value: 'glb', label: 'GLB', description: '3D 모델 (Binary)', icon: '🎯' },
    { value: 'obj', label: 'OBJ', description: '3D 모델', icon: '📦' },
    { value: 'stl', label: 'STL', description: '3D 프린팅', icon: '🖨️' },
    { value: 'project', label: 'Project', description: '전체 프로젝트', icon: '💾' },
    { value: 'image', label: 'Image', description: '원본 이미지', icon: '🖼️' },
  ]

  const csvTypes = [
    { value: 'walls', label: '벽 데이터' },
    { value: 'spaces', label: '공간 데이터' },
    { value: 'doors', label: '문 데이터' },
    { value: 'windows', label: '창문 데이터' },
  ]

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif font-semibold text-primary-navy">
          데이터 내보내기
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-warmGray hover:text-primary-crimson"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-navy mb-3">
          내보내기 형식 선택
        </label>
        <div className="grid grid-cols-3 gap-2">
          {exportFormats.map((format) => (
            <button
              key={format.value}
              onClick={() => setSelectedFormat(format.value as ExportFormat)}
              className={`
                p-3 rounded-lg border transition-all text-left
                ${
                  selectedFormat === format.value
                    ? 'border-primary-crimson bg-primary-crimson/5'
                    : 'border-neutral-warmGray/20 hover:border-primary-navy/30'
                }
              `}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{format.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm text-primary-navy">
                    {format.label}
                  </div>
                  <div className="text-xs text-neutral-warmGray">
                    {format.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CSV Type Selection */}
      {selectedFormat === 'csv' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary-navy mb-3">
            CSV 데이터 유형
          </label>
          <div className="grid grid-cols-2 gap-2">
            {csvTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setCsvType(type.value as CSVType)}
                className={`
                  px-4 py-2 rounded-lg border transition-all
                  ${
                    csvType === type.value
                      ? 'border-primary-crimson bg-primary-crimson/5 text-primary-crimson'
                      : 'border-neutral-warmGray/20 hover:border-primary-navy/30 text-primary-navy'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Export Status */}
      {exportStatus && (
        <div
          className={`
            mb-4 p-3 rounded-lg text-sm
            ${
              exportStatus.type === 'success'
                ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'
                : 'bg-primary-crimson/10 text-primary-crimson border border-primary-crimson/20'
            }
          `}
        >
          <div className="flex items-center gap-2">
            {exportStatus.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {exportStatus.message}
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all
          ${
            isExporting
              ? 'bg-neutral-warmGray/20 text-neutral-warmGray cursor-not-allowed'
              : 'bg-primary-crimson text-white hover:bg-primary-crimson/90 shadow-md hover:shadow-lg'
          }
        `}
      >
        {isExporting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            내보내는 중...
          </div>
        ) : (
          '내보내기'
        )}
      </button>

      {/* Format Info */}
      <div className="mt-6 p-4 bg-neutral-marble rounded-lg border border-neutral-warmGray/10">
        <h4 className="text-sm font-medium text-primary-navy mb-2">
          선택된 형식 정보
        </h4>
        <div className="text-xs text-neutral-warmGray space-y-1">
          {selectedFormat === 'json' && (
            <>
              <p>• 전체 BIM 데이터를 JSON 형식으로 내보냅니다.</p>
              <p>• 다른 애플리케이션과의 데이터 교환에 적합합니다.</p>
            </>
          )}
          {selectedFormat === 'csv' && (
            <>
              <p>• 선택한 요소 데이터를 표 형식으로 내보냅니다.</p>
              <p>• Excel 등 스프레드시트에서 열 수 있습니다.</p>
            </>
          )}
          {selectedFormat === 'ifc' && (
            <>
              <p>• Industry Foundation Classes 호환 형식입니다.</p>
              <p>• BIM 소프트웨어 간 데이터 교환용입니다.</p>
            </>
          )}
          {selectedFormat === 'gltf' && (
            <>
              <p>• 웹 기반 3D 뷰어에서 사용 가능한 형식입니다.</p>
              <p>• 재질과 텍스처 정보를 포함합니다.</p>
            </>
          )}
          {selectedFormat === 'glb' && (
            <>
              <p>• glTF의 바이너리 버전입니다.</p>
              <p>• 파일 크기가 작고 로딩이 빠릅니다.</p>
            </>
          )}
          {selectedFormat === 'obj' && (
            <>
              <p>• 대부분의 3D 소프트웨어에서 지원합니다.</p>
              <p>• 기하학적 정보만 포함합니다.</p>
            </>
          )}
          {selectedFormat === 'stl' && (
            <>
              <p>• 3D 프린팅에 최적화된 형식입니다.</p>
              <p>• 메쉬 정보만 포함합니다.</p>
            </>
          )}
          {selectedFormat === 'project' && (
            <>
              <p>• 모든 분석 결과와 이미지를 포함합니다.</p>
              <p>• 나중에 다시 불러올 수 있습니다.</p>
            </>
          )}
          {selectedFormat === 'image' && (
            <>
              <p>• 업로드한 원본 도면 이미지입니다.</p>
              <p>• PNG 형식으로 저장됩니다.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}