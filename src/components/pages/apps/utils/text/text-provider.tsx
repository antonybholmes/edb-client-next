import { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useContext, useRef, useState } from 'react'

interface ITextContext {
  text: string
  ref: React.RefObject<HTMLTextAreaElement>
  setText: (text: string) => void
}

const TextContext = createContext<ITextContext | null>(null)

export function useText() {
  const ctx = useContext(TextContext)

  if (!ctx) {
    throw new Error('useText must be used within a TextProvider')
  }

  return ctx
}

export function TextProvider({ children }: IChildrenProps) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const value: ITextContext = {
    text,
    ref,
    setText,
  }

  return <TextContext.Provider value={value}>{children}</TextContext.Provider>
}
