'use client'

import { Editor } from '@monaco-editor/react'
import { useState } from 'react'

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
  const [value, setValue] = useState(initialValue)

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setValue(newValue)
      onChange?.(newValue)
    }
  }

  return (
    <div className="border border-neutral-warmGray/30 rounded-neo-md overflow-hidden shadow-neo">
      <Editor
        height="600px"
        defaultLanguage="markdown"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          fontSize: 14,
          lineNumbers: 'on',
          readOnly: readonly,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
        }}
      />
    </div>
  )
}
