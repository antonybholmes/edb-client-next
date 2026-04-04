import type { IStringMap } from '@/interfaces/string-map'
import { cn } from '@/lib/shadcn-utils'
import { CENTERED_ROW_CLS, FOCUS_RING_CLS, V_CENTERED_ROW_CLS } from '@/theme'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

const RADIO_CLS = cn(
  V_CENTERED_ROW_CLS,
  'group gap-x-1.5 text-primary disabled:cursor-not-allowed disabled:opacity-50 min-w-0'
)

const RADIO_BUTTON_CLS = cn(
  FOCUS_RING_CLS,
  CENTERED_ROW_CLS,
  'aspect-square h-4.5 w-4.5 rounded-full bg-background border',
  'data-[state=unchecked]:border-border group-hover:data-[state=unchecked]:border-ring',
  'data-[state=checked]:border-transparent data-[state=checked]:bg-theme/90',
  'data-[state=checked]:hover:bg-theme'
)

const RadioGroup = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={className} {...props} ref={ref} />
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(RADIO_CLS, className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className={RADIO_BUTTON_CLS}
        forceMount={true}
      >
        <RadioGroupPrimitive.Indicator className="aspect-square h-2 w-2 rounded-full bg-white"></RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Indicator>

      {children && children}
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

interface SideRadioGroupItemProps extends ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
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

const BORDER_MAP: IStringMap = {
  off: '',
  top: '-rotate-90',
  bottom: 'rotate-90',
  left: 'rotate-180',
  right: '',
}

export const SideRadioGroupItem = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Item>,
  SideRadioGroupItemProps
>(({ title, value, currentValue, className, disabled, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      data-enabled={!disabled}
      data-state={value === currentValue ? 'checked' : 'unchecked'}
      {...props}
      className={cn(SIDE_BUTTON_CLS, BORDER_MAP[value], className)}
      aria-label={title ?? value}
      title={title ?? value}
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
            [value.includes('upper'), 'bottom-1/2', 'bottom-0']
          )}
        />
      )}
    </RadioGroupPrimitive.Item>
  )
})
SideRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
