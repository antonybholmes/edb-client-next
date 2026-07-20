import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'

import { cn } from '@/lib/shadcn-utils'
import { FOCUS_RING_CLS } from '@/theme'
import { Field } from '@base-ui/react/field'
import { Check } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'

export type ICheckedChange = (state: boolean) => void

export interface ICheckboxProps extends ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  index?: number
  tooltip?: string
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-row items-center justify-center shrink-0 cursor-pointer',
  'whitespace-nowrap gap-x-1.5 p-0 m-0 group',
  'rounded-sm aspect-square w-4.5 h-4.5 shrink-0 border trans-color',
  'data-unchecked:bg-background data-unchecked:border-border/70',
  'data-unchecked:data-[hover=true]:border-app-theme/30',
  'data-checked:bg-app-theme/80 data-checked:border-transparent',
  'data-checked:data-[hover=true]:bg-app-theme',
  'data-disabled:cursor-not-allowed data-disabled:opacity-60'
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
  const [hover, setHover] = useState(false)

  let ret: ReactNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      data-hover={hover}
      onCheckedChange={onCheckedChange}
      className={CHECK_CLS}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      id={id}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="data-unchecked:hidden">
        <Check className="stroke-white" size={14} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (children) {
    ret = (
      <Field.Root>
        <Field.Label className="flex flex-row items-center gap-x-1.5">
          {ret}
          {children}
        </Field.Label>
      </Field.Root>
    )
  }

  return ret
}
