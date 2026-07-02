import { useStableId } from '@/hooks/stable-id'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { type ReactNode } from 'react'
import { CloseIcon } from './icons/close-icon'
import { NumericalInput } from './shadcn/ui/themed/numerical-input'
import type { IInputProps } from './shadcn/ui/themed/v2/input'

export const CONTAINER_CLS = cn(
  'flex flex-row gap-x-1 justify-between disabled:cursor-not-allowed disabled:opacity-50'
)

export const INPUT_CLS = cn(
  'h-full shrink-0 disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50'
)

export interface InputProps extends IInputProps {
  v1: number
  v2: number
  onNumChange1?: (v: number) => void
  onNumChange2?: (v: number) => void
  onNumChanged1?: (v: number) => void
  onNumChanged2?: (v: number) => void
  limit?: [number, number]
  inc?: number
  inputCls?: string

  dp?: number
  leftChildren?: ReactNode
}

export function DoubleNumericalInput({
  id,
  v1 = 1,
  v2 = 1,
  onNumChange1 = () => {},
  onNumChange2 = () => {},
  onNumChanged1 = () => {},
  onNumChanged2 = () => {},
  type,
  inputCls = 'rounded-theme',
  w = 'xxs',
  limit = [1, 100],
  h,
  inc = 1,
  dp = 3,
  leftChildren,

  children,
}: InputProps) {
  //const [focus, setFocus] = useState(false)

  const _id = id ?? useStableId('double-numerical-input')
  const id2 = `${_id}:2`

  if (!children) {
    children = <CloseIcon size={14} />
  }

  return (
    <VCenterRow
      className={CONTAINER_CLS}
      //ref={ref}
      //onFocus={() => setFocus(true)}
      //onBlur={() => setFocus(false)}
    >
      {leftChildren && leftChildren}
      <NumericalInput
        id={_id}
        type={type}
        className={inputCls}
        value={v1}
        dp={dp}
        step={inc}
        limit={limit}
        onNumChange={onNumChange1}
        onNumChanged={onNumChanged1}
        w={w}
        h={h}
      />

      {children && children}

      {/* <label htmlFor={id2} className="sr-only">
        Max {_id}
      </label> */}

      <NumericalInput
        id={id2}
        type={type}
        className={inputCls}
        value={v2}
        dp={dp}
        step={inc}
        limit={limit}
        onNumChange={onNumChange2}
        onNumChanged={onNumChanged2}
        w={w}
        h={h}
      />
    </VCenterRow>
  )
}
