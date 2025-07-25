import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

import { CENTERED_ROW_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { CheckIcon } from '@icons/check-icon'
import { cn } from '@lib/shadcn-utils'
import { type IButtonProps } from '@themed/button'

export type ICheckedChange = (state: boolean) => void

export interface ICheckboxProps extends IButtonProps {
  index?: number
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS =
  'group flex flex-row shrink-0 cursor-pointer whitespace-nowrap text-left items-center outline-hidden gap-x-1.5 p-0 m-0'

export const TICK_CLS = cn(
  FOCUS_INSET_RING_CLS,
  CENTERED_ROW_CLS,
  'rounded-sm aspect-square w-4.5 h-4.5 shrink-0 border',
  'data-[checked=false]:bg-background data-[checked=false]:border-border data-[checked=false]:group-hover:border-ring',
  'data-[enabled=true]:data-[checked=true]:bg-theme data-[enabled=false]:data-[checked=true]:bg-muted',
  'data-[checked=true]:border-theme'
)

export function Checkbox({
  ref,
  checked = false,

  onCheckedChange = () => {},
  className,
  children,
  ...props
}: ICheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      //defaultChecked={checked}
      onCheckedChange={state =>
        onCheckedChange?.(state === 'indeterminate' ? false : state)
      }
      className={cn(CHECK_CLS, className)}
    >
      <span
        className={TICK_CLS}
        data-checked={checked}
        data-enabled={!props.disabled}
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon
            w="w-3.5"
            stroke="stroke-white/90"
            style={{ strokeWidth: 3 }}
          />
        </CheckboxPrimitive.Indicator>
      </span>

      {children && children}
    </CheckboxPrimitive.Root>
  )
}
