import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import {
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { CloseIcon } from './icons/close-icon'
import { Input } from './shadcn/ui/themed/input'

export const CONTAINER_CLS = cn(
  'flex flex-row  gap-x-2 justify-between disabled:cursor-not-allowed disabled:opacity-50'
)

const MIN_CH = 3

export const INPUT_CLS = cn(
  'h-full shrink-0 disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50'
)

export interface IInputProps extends ComponentProps<'input'> {
  text1: string | number
  text2: string | number
  onKeyDown1?: (e: KeyboardEvent<HTMLInputElement>) => void
  onKeyDown2?: (e: KeyboardEvent<HTMLInputElement>) => void
  leftChildren?: ReactNode
}

export function DoubleInput({
  text1,
  text2,
  onKeyDown1,
  onKeyDown2,
  type,
  leftChildren,
  children,
}: IInputProps) {
  const [_text1, setText1] = useState(text1)
  const [_text2, setText2] = useState(text2)

  if (!children) {
    children = <CloseIcon className="fill-foreground/75" w="w-2" />
  }

  return (
    <VCenterRow className={CONTAINER_CLS}>
      {leftChildren && leftChildren}
      <Input
        type={type}
        className="justify-center rounded-theme"
        inputCls="text-center"
        value={_text1}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          onKeyDown1?.(e)
        }}
        onChange={e => setText1(e.currentTarget.value)}
        style={{
          width: `${Math.max(MIN_CH, _text1.toString().length + 1)}ch`,
        }}
      />

      {children && children}

      <Input
        type={type}
        className="justify-center rounded-theme"
        inputCls="text-center"
        value={_text2}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
          onKeyDown2?.(e)
        }
        onChange={e => setText2(e.currentTarget.value)}
        style={{
          width: `${Math.max(MIN_CH, _text2.toString().length + 1)}ch`,
        }}
      />
    </VCenterRow>
  )
}
