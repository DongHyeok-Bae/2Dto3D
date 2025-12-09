'use client'

import { useState, ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
import {
  JsonIcon,
  CsvIcon,
  IfcIcon,
  GltfIcon,
  GlbIcon,
  ObjIcon,
  StlIcon,
  ProjectIcon,
  ImageIcon,
} from './icons'

interface ExportPanelProps {
  masterJSON?: MasterJSON | null
  onClose?: () => void
}

type ExportFormat = 'json' | 'csv' | 'ifc' | 'gltf' | 'glb' | 'obj' | 'stl' | 'project' | 'image'
type CSVType = 'walls' | 'spaces' | 'doors' | 'windows'

interface FormatConfig {
  value: ExportFormat
  label: string
  description: string
  shortDesc: string
  Icon: ComponentType<{ className?: string }>
}

export default function ExportPanel({ masterJSON, onClose }: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [csvType, setCsvType] = useState<CSVType>('walls')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [hoveredFormat, setHoveredFormat] = useState<ExportFormat | null>(null)

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

  const exportFormats: FormatConfig[] = [
    { value: 'json', label: 'JSON', description: 'Master JSON 데이터', shortDesc: 'JSON', Icon: JsonIcon },
    { value: 'csv', label: 'CSV', description: '표 형식 데이터', shortDesc: '표 형식', Icon: CsvIcon },
    { value: 'ifc', label: 'IFC-like', description: 'BIM 교환 형식', shortDesc: 'BIM', Icon: IfcIcon },
    { value: 'gltf', label: 'glTF', description: '3D 모델 (JSON)', shortDesc: '3D JSON', Icon: GltfIcon },
    { value: 'glb', label: 'GLB', description: '3D 모델 (Binary)', shortDesc: '3D Binary', Icon: GlbIcon },
    { value: 'obj', label: 'OBJ', description: '3D 모델', shortDesc: '3D 모델', Icon: ObjIcon },
    { value: 'stl', label: 'STL', description: '3D 프린팅', shortDesc: '프린팅', Icon: StlIcon },
    { value: 'project', label: 'Project', description: '전체 프로젝트', shortDesc: '프로젝트', Icon: ProjectIcon },
    { value: 'image', label: 'Image', description: '원본 이미지', shortDesc: '이미지', Icon: ImageIcon },
  ]

  const csvTypes = [
    { value: 'walls', label: '벽 데이터' },
    { value: 'spaces', label: '공간 데이터' },
    { value: 'doors', label: '문 데이터' },
    { value: 'windows', label: '창문 데이터' },
  ]

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-neutral-warmGray/20 shadow-xl"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/5 via-transparent to-primary-crimson/5 pointer-events-none" />

      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
        animate={{ backgroundPosition: ['0px 0px', '16px 16px'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative p-6">
        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-8 h-8"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src="/logo-crossover.png"
                alt="2Dto3D"
                width={32}
                height={32}
                className="object-contain"
              />
            </motion.div>
            <h3 className="text-lg font-serif font-bold text-primary-navy">
              데이터 내보내기
            </h3>
          </div>
          {onClose && (
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-warmGray hover:text-primary-crimson hover:bg-primary-crimson/5 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary-navy mb-3">
            내보내기 형식 선택
          </label>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
          >
            {exportFormats.map((format, index) => {
              const Icon = format.Icon
              const isSelected = selectedFormat === format.value
              const isHovered = hoveredFormat === format.value

              return (
                <motion.button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  onMouseEnter={() => setHoveredFormat(format.value)}
                  onMouseLeave={() => setHoveredFormat(null)}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden
                    ${isSelected
                      ? 'border-primary-crimson bg-primary-crimson/5 shadow-lg shadow-primary-crimson/10'
                      : 'border-neutral-warmGray/20 hover:border-primary-gold/40 bg-white hover:bg-primary-gold/5'
                    }
                  `}
                >
                  {/* Corner Markers */}
                  <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 transition-all duration-300
                    ${isSelected ? 'border-primary-crimson opacity-100 w-4 h-4' : 'border-primary-gold opacity-0 group-hover:opacity-60'}`}
                  />
                  <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 transition-all duration-300
                    ${isSelected ? 'border-primary-crimson opacity-100 w-4 h-4' : 'border-primary-gold opacity-0 group-hover:opacity-60'}`}
                  />
                  <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 transition-all duration-300
                    ${isSelected ? 'border-primary-crimson opacity-100 w-4 h-4' : 'border-primary-gold opacity-0 group-hover:opacity-60'}`}
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 transition-all duration-300
                    ${isSelected ? 'border-primary-crimson opacity-100 w-4 h-4' : 'border-primary-gold opacity-0 group-hover:opacity-60'}`}
                  />

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
                    initial={{ x: '-200%' }}
                    animate={{ x: isHovered ? '200%' : '-200%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />

                  {/* Icon */}
                  <div className={`
                    w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 transition-colors duration-300
                    ${isSelected ? 'text-primary-crimson' : 'text-primary-navy group-hover:text-primary-gold'}
                  `}>
                    <Icon className="w-full h-full" />
                  </div>

                  {/* Label */}
                  <div className={`
                    font-serif font-semibold text-sm sm:text-base text-center transition-colors duration-300
                    ${isSelected ? 'text-primary-crimson' : 'text-primary-navy'}
                  `}>
                    {format.label}
                  </div>

                  {/* Description - Hidden on mobile, shown on larger screens */}
                  <div className="text-xs text-neutral-warmGray text-center mt-1 hidden sm:block line-clamp-1">
                    {format.description}
                  </div>
                  <div className="text-xs text-neutral-warmGray text-center mt-1 sm:hidden">
                    {format.shortDesc}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r from-primary-crimson via-primary-gold to-primary-crimson"
                      layoutId="selectedIndicator"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        {/* CSV Type Selection */}
        <AnimatePresence>
          {selectedFormat === 'csv' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <label className="block text-sm font-medium text-primary-navy mb-3">
                CSV 데이터 유형
              </label>
              <div className="grid grid-cols-2 gap-2">
                {csvTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => setCsvType(type.value as CSVType)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      px-4 py-3 rounded-xl border-2 transition-all font-medium
                      ${csvType === type.value
                        ? 'border-primary-crimson bg-primary-crimson/5 text-primary-crimson shadow-md'
                        : 'border-neutral-warmGray/20 hover:border-primary-navy/30 text-primary-navy hover:bg-primary-navy/5'
                      }
                    `}
                  >
                    {type.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Status */}
        <AnimatePresence>
          {exportStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`
                mb-4 p-4 rounded-xl text-sm border-2
                ${exportStatus.type === 'success'
                  ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30'
                  : 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {exportStatus.type === 'success' ? (
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                )}
                <span className="font-medium">{exportStatus.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Button */}
        <motion.button
          onClick={handleExport}
          disabled={isExporting}
          whileHover={!isExporting ? { scale: 1.02, boxShadow: '0 8px 24px rgba(154, 33, 45, 0.25)' } : {}}
          whileTap={!isExporting ? { scale: 0.98 } : {}}
          className={`
            relative w-full py-4 px-6 rounded-xl font-serif font-bold text-lg transition-all overflow-hidden
            ${isExporting
              ? 'bg-neutral-warmGray/20 text-neutral-warmGray cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-crimson to-primary-crimson/90 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {/* Button Shimmer */}
          {!isExporting && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              initial={{ x: '-200%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}

          {isExporting ? (
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>내보내는 중...</span>
            </div>
          ) : (
            <span className="relative z-10">내보내기</span>
          )}
        </motion.button>

        {/* Format Info */}
        <motion.div
          className="mt-6 p-4 rounded-xl bg-gradient-to-br from-neutral-marble to-white border border-neutral-warmGray/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-sm font-serif font-semibold text-primary-navy mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            선택된 형식 정보
          </h4>
          <div className="text-xs text-neutral-warmGray space-y-1.5">
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
        </motion.div>
      </div>
    </motion.div>
  )
}
