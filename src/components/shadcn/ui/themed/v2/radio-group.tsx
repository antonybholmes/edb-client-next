import { cn } from '@/lib/shadcn-utils'
import { CENTERED_ROW_CLS, FOCUS_RING_CLS } from '@/theme'
import { Field } from '@base-ui/react/field'
import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'

import { type ComponentProps, type ReactNode } from 'react'

// const RADIO_CLS = cn(
//   V_CENTERED_ROW_CLS,
//   'group gap-x-1.5 text-primary disabled:cursor-not-allowed disabled:opacity-50 min-w-0'
// )

const RADIO_BUTTON_CLS = cn(
  FOCUS_RING_CLS,
  CENTERED_ROW_CLS,
  'aspect-square h-4.5 w-4.5 rounded-full bg-background border',
  'data-unchecked:border-border hover:data-unchecked:border-ring group-hover:data-unchecked:border-ring',
  'data-checked:border-transparent data-checked:bg-theme/90',
  'data-checked:hover:bg-theme shrink-0'
)

export const Radio = RadioPrimitive.Root
export const RadioGroup = RadioGroupPrimitive

export function RadioGroupItem({
  ref,
  className = '',
  children,
  ...props
}: ComponentProps<typeof Radio>) {
  let ret: ReactNode = (
    <Radio className={RADIO_BUTTON_CLS} {...props}>
      <RadioPrimitive.Indicator className="aspect-square h-2 w-2 rounded-full bg-white" />
    </Radio>
  )

  if (children) {
    ret = (
      <Field.Root>
        <Field.Label
          className={cn('flex flex-row items-center gap-x-2', className)}
        >
          {ret}
          {children}
        </Field.Label>
      </Field.Root>
    )
  }

  return ret
}

interface SideRadioGroupItemProps extends ComponentProps<typeof Radio> {
  currentValue?: string
  title?: string
}

const SIDE_BUTTON_CLS = cn(
  'relative h-5.5 w-5.5 rounded-sm aspect-square overflow-hidden group',
  'border data-[state=checked]:border-theme data-[state=unchecked]:border-foreground/50',
  'data-[state=unchecked]:hover:border-foreground/75',
  'bg-background'
)

// const BORDER_CLS = cn(
//   'absolute left-0 top-0 right-0 bottom-0 border trans-color z-10',
//   'data-[state=checked]:border-theme',
//   'data-[state=unchecked]:border-foreground'
// )

type Sides = 'off' | 'top' | 'bottom' | 'left' | 'right'

const BORDER_MAP: Record<Sides, string> = {
  off: '',
  top: '-rotate-90',
  bottom: 'rotate-90',
  left: 'rotate-180',
  right: '',
}

export function SideRadioGroupItem({
  ref,
  title,
  value = 'off',
  currentValue,
  className = '',
  disabled = false,
  ...props
}: SideRadioGroupItemProps) {
  return (
    <Radio
      ref={ref}
      value={value}
      disabled={disabled}
      data-enabled={!disabled}
      data-state={value === currentValue ? 'checked' : 'unchecked'}
      {...props}
      className={cn(
        SIDE_BUTTON_CLS,
        BORDER_MAP[(String(value) ?? 'off') as Sides],
        className
      )}
      //aria-label={title ?? value}
      // title={title ?? value}
    >
      {/* <span
        data-state={value === currentValue ? 'checked' : 'unchecked'}
        data-enabled={!disabled}
        className={BORDER_CLS}
      /> */}

      {value !== 'Off' && (
        <span
          data-state={value === currentValue ? 'checked' : 'unchecked'}
          data-enabled={!disabled}
          className={cn(
            'absolute right-0 top-0 z-20 w-1.5 data-[state=checked]:bg-theme',
            'data-[state=unchecked]:bg-foreground/50',
            'data-[state=unchecked]:group-hover:bg-foreground/75',
            [String(value).includes('upper'), 'bottom-1/2', 'bottom-0']
          )}
        />
      )}
    </Radio>
  )
}
