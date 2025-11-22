import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PromptVersion } from '@/types'

interface PromptStore {
  // 상태
  prompts: Record<number, PromptVersion[]>
  activePromptIds: Record<number, string>
  loading: boolean
  error: string | null

  // 액션
  setPrompts: (phase: number, prompts: PromptVersion[]) => void
  addPrompt: (prompt: PromptVersion) => void
  updatePrompt: (promptId: string, updates: Partial<PromptVersion>) => void
  deletePrompt: (promptId: string) => void
  setActivePrompt: (phase: number, promptId: string) => void
  getActivePrompt: (phase: number) => PromptVersion | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: {},
      activePromptIds: {},
      loading: false,
      error: null,

      setPrompts: (phase, prompts) =>
        set(state => ({
          prompts: {
            ...state.prompts,
            [phase]: prompts,
          },
        })),

      addPrompt: prompt =>
        set(state => {
          const phase = prompt.phaseNumber
          const existingPrompts = state.prompts[phase] || []

          return {
            prompts: {
              ...state.prompts,
              [phase]: [...existingPrompts, prompt],
            },
          }
        }),

      updatePrompt: (promptId, updates) =>
        set(state => {
          const newPrompts = { ...state.prompts }

          Object.keys(newPrompts).forEach(phase => {
            newPrompts[Number(phase)] = newPrompts[Number(phase)].map(p =>
              p.id === promptId ? { ...p, ...updates } : p
            )
          })

          return { prompts: newPrompts }
        }),

      deletePrompt: promptId =>
        set(state => {
          const newPrompts = { ...state.prompts }

          Object.keys(newPrompts).forEach(phase => {
            newPrompts[Number(phase)] = newPrompts[Number(phase)].filter(
              p => p.id !== promptId
            )
          })

          return { prompts: newPrompts }
        }),

      setActivePrompt: (phase, promptId) =>
        set(state => ({
          activePromptIds: {
            ...state.activePromptIds,
            [phase]: promptId,
          },
        })),

      getActivePrompt: phase => {
        const state = get()
        const activeId = state.activePromptIds[phase]
        const prompts = state.prompts[phase] || []

        return prompts.find(p => p.id === activeId) || prompts.find(p => p.isActive) || null
      },

      setLoading: loading => set({ loading }),

      setError: error => set({ error }),
    }),
    {
      name: 'prompt-storage',
      partialize: state => ({
        prompts: state.prompts,
        activePromptIds: state.activePromptIds,
      }),
    }
  )
)
