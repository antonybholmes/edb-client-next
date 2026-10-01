import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'

import { present } from '@/lib/dom-utils'
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
  icon?: ReactNode
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-row items-center justify-center shrink-0 cursor-pointer',
  'group aspect-square shrink-0 border border-border/80 w-4.5 h-4.5 rounded-xs'
)

export function SmallCheckbox({
  ref,
  id = '',
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  children,
  className,
  style,
  title,
  icon,
  'aria-label': ariaLabel,
  ...props
}: ICheckboxProps) {
  const [hover, setHover] = useState(false)

  if (!ariaLabel) {
    ariaLabel = title
  }

  if (!icon) {
    icon = <Check className="mt-0.5" size={14} strokeWidth={3} />
  }

  let ret: ReactNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      data-hover={present(hover)}
      onCheckedChange={onCheckedChange}
      className={CHECK_CLS}
      style={style}
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      id={id}
      title={title}
      aria-label={ariaLabel}
      {...props}
    >
      <CheckboxPrimitive.Indicator>{icon}</CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (children) {
    ret = (
      <Field.Root className={className}>
        <Field.Label className="flex flex-row items-center gap-x-1">
          {ret}
          {children}
        </Field.Label>
      </Field.Root>
    )
  }

  return ret
}
