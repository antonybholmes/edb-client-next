import type { InputHTMLAttributes, PropsWithoutRef } from 'react'

export interface ITextAreaProps
  extends PropsWithoutRef<InputHTMLAttributes<HTMLTextAreaElement>> {
  focus?: string
}
