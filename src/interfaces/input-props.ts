import type { InputHTMLAttributes, PropsWithoutRef } from 'react'

export interface IInputProps
  extends PropsWithoutRef<InputHTMLAttributes<HTMLInputElement>> {
  focus?: string
}
