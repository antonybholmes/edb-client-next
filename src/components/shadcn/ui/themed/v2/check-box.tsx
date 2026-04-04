import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'

import { cn } from '@/lib/shadcn-utils'
import { CENTERED_ROW_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { Field } from '@base-ui/react/field'
import { Check } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

export type ICheckedChange = (state: boolean) => void

export interface ICheckboxProps extends ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  index?: number
  tooltip?: string
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS = `group flex flex-row 
  shrink-0 cursor-pointer whitespace-nowrap 
  text-left items-center outline-hidden 
  gap-x-1.5 p-0 m-0`

export const TICK_CLS = cn(
  FOCUS_INSET_RING_CLS,
  CENTERED_ROW_CLS,
  'rounded-sm aspect-square w-4.5 h-4.5 shrink-0 border trans-color',
  'group-data-unchecked:bg-background group-data-unchecked:border-border/70 group-data-unchecked:group-hover:border-ring',
  'group-data-checked:bg-theme/80 group-data-checked:border-transparent',
  'group-data-checked:hover:bg-theme'
)

export function Checkbox({
  ref,
  id = '',
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  children,
  ...props
}: ICheckboxProps) {
  let ret: ReactNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      //defaultChecked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(CHECK_CLS)}
      disabled={disabled}
      {...props}
    >
      <span
        className={TICK_CLS}
        data-checked={checked}
        data-enabled={!disabled}
      >
        {checked ? (
          <Check className="stroke-white" size={16} strokeWidth={2} />
        ) : (
          <Check
            className="stroke-theme/30 mt-px group-hover:visible invisible"
            size={16}
            strokeWidth={3}
          />
        )}
      </span>
    </CheckboxPrimitive.Root>
  )

  if (children) {
    ret = (
      <Field.Root>
        <Field.Label className="flex flex-row items-center gap-x-2">
          {ret}
          {children}
        </Field.Label>
      </Field.Root>
    )
  }

  return ret
}
