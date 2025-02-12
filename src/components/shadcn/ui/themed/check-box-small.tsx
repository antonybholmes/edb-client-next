import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { forwardRef, type ForwardedRef } from 'react'

import { CENTERED_ROW_CLS, GROUP_FOCUS_RING_CLS } from '@/theme'
import { CheckIcon } from '@icons/check-icon'
import { cn } from '@lib/class-names'
import type { ICheckboxProps } from './check-box'

export type ICheckedChange = (state: boolean) => void

export const CHECK_CLS = cn(
  'group flex flex-row shrink-0 cursor-pointer whitespace-nowrap text-left items-center outline-none'
)

export const TICK_CLS = cn(
  GROUP_FOCUS_RING_CLS,
  CENTERED_ROW_CLS,
  'rounded aspect-square w-4 h-4 shrink-0 bg-background border border-border'
)

export const CheckboxSmall = forwardRef(function CheckboxSmall(
  {
    checked = false,
    gap = 'gap-x-2.5',
    onCheckedChange,
    className,
    children,
  }: ICheckboxProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={state =>
        onCheckedChange?.(state === 'indeterminate' ? false : state)
      }
      className={cn(CHECK_CLS, gap, className)}
    >
      <span className={TICK_CLS} data-checked={checked}>
        <CheckboxPrimitive.Indicator>
          <CheckIcon stroke="stroke-3" w="w-3" />
        </CheckboxPrimitive.Indicator>
      </span>

      {children && children}
    </CheckboxPrimitive.Root>
  )
})
