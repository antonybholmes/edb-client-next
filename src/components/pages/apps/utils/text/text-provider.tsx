import { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useContext, useState } from 'react'

interface ITextContext {
  text: string
  setText: (text: string) => void
}

const TextContext = createContext<ITextContext | null>(null)

export function useTextSave() {
  const ctx = useContext(TextContext)

  if (!ctx) {
    throw new Error('useTextSave must be used within a TextProvider')
  }

  return ctx
}

export function TextProvider({ children }: IChildrenProps) {
  const [text, setText] = useState('')

  const value: ITextContext = {
    text,
    setText,
  }

  return <TextContext.Provider value={value}>{children}</TextContext.Provider>
}
