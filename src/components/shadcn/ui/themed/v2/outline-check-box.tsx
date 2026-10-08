import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'

import { present } from '@/lib/dom-utils'
import { cn } from '@/lib/shadcn-utils'
import { FOCUS_RING_CLS } from '@/theme'
import { Field } from '@base-ui/react/field'
import { Check } from 'lucide-react'
import {
  CSSProperties,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

export type ICheckedChange = (state: boolean) => void

export interface ICheckboxProps extends ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  index?: number
  tooltip?: string
  theme?: 'default' | 'app'
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-row items-center justify-center shrink-0 cursor-pointer',
  'whitespace-nowrap gap-x-1.5 p-0 m-0 group rounded-sm aspect-square',
  'w-4.5 h-4.5 shrink-0 trans-color border border-(--checkbox-theme)/30 data-checked:border-(--checkbox-theme)/30 bg-background'
)

export function OutlineCheckbox({
  ref,
  id = '',
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  theme = 'default',
  children,
  className,
  ...props
}: ICheckboxProps) {
  const [hover, setHover] = useState(false)

  const checkboxTheme =
    theme === 'default' ? 'var(--color-foreground)' : 'var(--color-app-theme)'

  let ret: ReactNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      data-hover={present(hover)}
      onCheckedChange={onCheckedChange}
      className={CHECK_CLS}
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      id={id}
      style={
        {
          '--checkbox-theme': checkboxTheme,
        } as CSSProperties
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator keepMounted={true}>
        <Check
          style={
            {
              '--checkbox-theme': checkboxTheme,
            } as CSSProperties
          }
          className="opacity-0 stroke-(--checkbox-theme) group-data-unchecked:hover:opacity-50 group-data-checked:opacity-70 trans-opacity"
          size={14}
          strokeWidth={3}
        />
      </CheckboxPrimitive.Indicator>
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
