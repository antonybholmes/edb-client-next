import { VCenterRow } from '@/components/layout/v-center-row'
import { cn } from '@lib/class-names'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { CloseIcon } from './icons/close-icon'
import { NumericalInput } from './shadcn/ui/themed/numerical-input'

export const CONTAINER_CLS = cn(
  'flex flex-row  gap-x-2 justify-between disabled:cursor-not-allowed disabled:opacity-50'
)

export const INPUT_CLS = cn(
  'h-full shrink-0 disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50'
)

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  v1: number
  v2: number
  onNumChanged1?: (v: number) => void
  onNumChanged2?: (v: number) => void
  limit?: [number, number]
  inc?: number
  inputCls?: string
  dp?: number
  leftChildren?: ReactNode
}

export const DoubleNumericalInput = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      v1 = 1,
      v2 = 1,
      onNumChanged1 = () => {},
      onNumChanged2 = () => {},
      type,
      inputCls = 'w-16 rounded-theme',
      limit = [1, 100],
      inc = 1,
      dp = 3,
      leftChildren,
      children,
    },
    ref
  ) => {
    //const [focus, setFocus] = useState(false)

    if (!children) {
      children = <CloseIcon className="fill-foreground/75" w="w-2" />
    }

    return (
      <VCenterRow
        className={CONTAINER_CLS}
        ref={ref}
        //onFocus={() => setFocus(true)}
        //onBlur={() => setFocus(false)}
      >
        {leftChildren && leftChildren}
        <NumericalInput
          type={type}
          className={inputCls}
          value={v1}
          dp={dp}
          inc={inc}
          limit={limit}
          onNumChanged={onNumChanged1}
        />

        {children && children}

        <NumericalInput
          type={type}
          className={inputCls}
          value={v2}
          dp={dp}
          inc={inc}
          limit={limit}
          onNumChanged={onNumChanged2}
        />
      </VCenterRow>
    )
  }
)
DoubleNumericalInput.displayName = 'DoubleNumericalInput'
