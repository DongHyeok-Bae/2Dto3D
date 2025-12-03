'use client'

interface RefreshWarningModalProps {
  isOpen: boolean
  onConfirm: () => void // 초기화 확인
  onCancel: () => void // 이전 결과 유지
}

export default function RefreshWarningModal({
  isOpen,
  onConfirm,
  onCancel,
}: RefreshWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-serif font-semibold text-primary-navy">
              페이지 새로고침 감지
            </h3>
            <p className="text-sm text-neutral-warmGray">
              이전 세션의 데이터가 발견되었습니다
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 p-4 bg-neutral-marble rounded-lg border border-neutral-warmGray/20">
          <p className="text-neutral-charcoal">
            기존 분석 결과물을 초기화하시겠습니까?
          </p>
          <p className="text-sm text-neutral-warmGray mt-2">
            초기화 시 업로드된 이미지와 AI 분석 결과가 모두 삭제됩니다.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-charcoal bg-neutral-warmGray/10 hover:bg-neutral-warmGray/20 rounded-lg transition-colors"
          >
            이전 결과 유지
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-crimson hover:bg-primary-crimson/90 rounded-lg transition-colors"
          >
            초기화 확인
          </button>
        </div>
      </div>
    </div>
  )
}
