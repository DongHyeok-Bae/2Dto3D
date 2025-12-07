'use client'

interface DeleteConfirmModalProps {
  isOpen: boolean
  version: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  version,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary-navy/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-neo-lg shadow-neo-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-serif font-bold text-primary-navy mb-4">
          버전 삭제 확인
        </h3>

        <p className="text-neutral-warmGray mb-6">
          <span className="font-semibold text-primary-crimson">v{version}</span> 버전을 삭제하시겠습니까?
          <br />
          <span className="text-sm">이 작업은 되돌릴 수 없습니다.</span>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-warmGray/30 rounded-neo-md text-neutral-warmGray hover:bg-neutral-marble transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary-crimson text-white rounded-neo-md hover:bg-primary-crimson/90 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
