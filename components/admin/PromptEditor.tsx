'use client'

import { Editor } from '@monaco-editor/react'
import { useState, useEffect, useRef } from 'react'

interface PromptEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  readonly?: boolean
}

export default function PromptEditor({
  initialValue = '',
  onChange,
  readonly = false,
}: PromptEditorProps) {
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const editorRef = useRef<any>(null)

  // initialValue가 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editorRef.current && initialValue !== undefined) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== initialValue) {
        editorRef.current.setValue(initialValue)
        console.log('Editor content updated from initialValue')
      }
    }
  }, [initialValue])

  // 5초 후 자동으로 로딩 오버레이 제거
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!isEditorReady) {
        console.warn('Monaco Editor loading timeout - forcing ready state')
        setIsEditorReady(true)
      }
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isEditorReady])

  const handleChange = (newValue: string | undefined) => {
    console.log('Editor onChange fired:', newValue?.length, 'chars')
    if (newValue !== undefined && onChange) {
      onChange(newValue)
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    setIsEditorReady(true)
    setHasError(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    console.log('Monaco Editor mounted successfully')
    console.log('Editor readOnly:', readonly)
    console.log('Editor instance:', editor)

    // 초기값 설정
    if (initialValue) {
      editor.setValue(initialValue)
      console.log('Initial value set:', initialValue.length, 'chars')
    }

    // 에디터 포커스 및 디버그 정보
    setTimeout(() => {
      editor.focus()
      const model = editor.getModel()
      console.log('Editor focused, model:', model)
      console.log('Is editor read-only?', editor.getOption(monaco.editor.EditorOption.readOnly))
    }, 100)
  }

  const handleEditorError = (error: any) => {
    console.error('Monaco Editor error:', error)
    setHasError(true)
    setIsEditorReady(true) // 오버레이 제거
  }

  return (
    <div className="relative border border-neutral-warmGray/30 rounded-neo-md overflow-hidden shadow-neo">
      {!isEditorReady && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-marble z-10 pointer-events-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-neutral-warmGray">에디터 로딩 중...</p>
            <p className="text-xs text-neutral-warmGray/70 mt-2">5초 이상 걸리는 경우 자동으로 건너뜁니다</p>
          </div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-4">
            <p className="text-sm text-red-600 mb-2">Monaco Editor 로드 실패</p>
            <p className="text-xs text-red-500">페이지를 새로고침하거나 대체 에디터를 사용하세요</p>
            <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700">
              페이지 새로고침
            </button>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', zIndex: hasError ? 0 : 1 }}>
        <Editor
          height="600px"
          defaultLanguage="markdown"
          theme="vs-dark"
          defaultValue=""
          onChange={handleChange}
          onMount={handleEditorDidMount}
          onValidate={(markers) => {
            if (markers.length > 0) {
              console.log('Editor validation markers:', markers)
            }
          }}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
            lineNumbers: 'on',
            readOnly: readonly,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            automaticLayout: true,
            tabSize: 2,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
            },
          }}
          loading={
            <div className="flex items-center justify-center h-[600px] bg-neutral-marble">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-crimson border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-neutral-warmGray">Monaco Editor 로딩 중...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
