import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

import { CheckIcon } from '@/icons/check-icon'
import { cn } from '@/lib/shadcn-utils'
import { CENTERED_ROW_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { type IButtonProps } from '@/themed/v2/button'

export type ICheckedChange = (state: boolean) => void

export type ICheckboxProps = IButtonProps & {
  index?: number
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS = `group flex flex-row 
  shrink-0 cursor-pointer whitespace-nowrap 
  text-left items-center outline-hidden 
  gap-x-1.5 p-0 m-0`

export const TICK_CLS = cn(
  FOCUS_INSET_RING_CLS,
  CENTERED_ROW_CLS,
  'rounded-md aspect-square w-4.75 h-4.75 shrink-0 border trans-color',
  'data-[checked=false]:bg-background data-[checked=false]:border-border data-[checked=false]:group-hover:border-ring',
  'data-[checked=true]:bg-theme/80 data-[checked=true]:border-theme/0',
  'data-[checked=true]:hover:bg-theme data-[checked=true]:hover:border-theme',
  'data-[enabled=false]:data-[checked=true]:bg-muted'
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
            w="w-3"
            stroke="stroke-white/90"
            style={{ strokeWidth: 4 }}
          />
        </CheckboxPrimitive.Indicator>
      </span>

      {children && children}
    </CheckboxPrimitive.Root>
  )
}
