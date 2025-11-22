'use client'

import { useState, useCallback } from 'react'
import { validateImage, fileToBase64, getImageMetadata } from '@/lib/image/preprocessor'

interface ImageUploaderProps {
  onImageUpload: (imageBase64: string, metadata: any) => void
  maxSize?: number
  accept?: string
}

export default function ImageUploader({
  onImageUpload,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsProcessing(true)

      try {
        // 이미지 검증
        const validation = await validateImage(file)
        if (!validation.valid) {
          setError(validation.error || '이미지 검증 실패')
          setIsProcessing(false)
          return
        }

        // Base64 변환
        const base64 = await fileToBase64(file)
        setPreview(base64)

        // 메타데이터 추출
        const metadata = await getImageMetadata(base64)

        // 부모 컴포넌트로 전달
        onImageUpload(base64, metadata)
      } catch (err) {
        setError('이미지 처리 중 오류가 발생했습니다.')
        console.error('Image upload error:', err)
      } finally {
        setIsProcessing(false)
      }
    },
    [onImageUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleReset = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${
              isDragging
                ? 'border-primary-crimson bg-primary-crimson/5'
                : 'border-neutral-warmGray/30 hover:border-primary-crimson/50'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center gap-4">
            {/* Upload Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-royal flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {isProcessing ? (
              <div className="text-primary-navy font-medium">이미지 처리 중...</div>
            ) : (
              <>
                <div>
                  <p className="text-lg font-semibold text-primary-navy mb-1">
                    도면 이미지를 업로드하세요
                  </p>
                  <p className="text-sm text-neutral-warmGray">
                    클릭하거나 드래그 앤 드롭
                  </p>
                </div>

                <div className="text-xs text-neutral-warmGray">
                  <p>PNG, JPEG, WebP (최대 10MB)</p>
                  <p>권장: 1000x1000 이상</p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden bg-neutral-warmGray/5">
            <img
              src={preview}
              alt="Uploaded floor plan"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button onClick={handleReset} className="btn-secondary text-sm">
              다른 이미지 선택
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
