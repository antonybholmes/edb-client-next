import { VCenterRow } from '@/components/layout/v-center-row'
import { FOCUS_INSET_RING_CLS, INPUT_BORDER_CLS } from '@/theme'
import { cn } from '@lib/class-names'
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { CloseIcon } from './icons/close-icon'

export const CONTAINER_CLS = cn(
  'flex flex-row h-8 px-1 gap-x-2 overflow-hidden justify-between disabled:cursor-not-allowed disabled:opacity-50 rounded-theme ring-inset',
  INPUT_BORDER_CLS,
  FOCUS_INSET_RING_CLS
)

const MIN_CH = 8

export const INPUT_CLS = cn(
  'h-full shrink-0 disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50 outline-none border border-red-500 ring-none padding-0 margin-0'
)

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  text1: string | number
  text2: string | number
  onKeyDown1?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyDown2?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  leftChildren?: ReactNode
}

export const DoubleInput = forwardRef<HTMLDivElement, InputProps>(
  (
    { text1, text2, onKeyDown1, onKeyDown2, type, leftChildren, children },
    ref
  ) => {
    const [_text1, setText1] = useState(text1)
    const [_text2, setText2] = useState(text2)
    const [focus, setFocus] = useState(false)

    if (!children) {
      children = <CloseIcon className="-mb-0.5 fill-foreground/50" w="w-2 " />
    }

    return (
      <VCenterRow className={cn(CONTAINER_CLS, [focus, 'ring-2'])} ref={ref}>
        {leftChildren && leftChildren}
        <input
          type={type}
          className={cn(INPUT_CLS, 'text-right')}
          defaultValue={_text1}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            onKeyDown1?.(e)
          }}
          onChange={e => setText1(e.currentTarget.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: `${Math.max(MIN_CH, _text1.toString().length + 1)}ch`,
          }}
        />

        {children && children}

        <input
          type={type}
          className={cn(INPUT_CLS)}
          defaultValue={_text2}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            onKeyDown2?.(e)
          }
          onChange={e => setText2(e.currentTarget.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: `${Math.max(MIN_CH, _text2.toString().length + 1)}ch`,
          }}
        />
      </VCenterRow>
    )
  }
)
