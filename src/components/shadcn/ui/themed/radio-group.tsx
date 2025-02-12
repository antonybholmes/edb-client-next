import { CENTERED_ROW_CLS, FOCUS_RING_CLS, V_CENTERED_ROW_CLS } from '@/theme'
import type { IStringMap } from '@interfaces/string-map'
import { cn } from '@lib/class-names'
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
  'aspect-square h-5 w-5 rounded-full bg-background border-2',
  'data-[state=unchecked]:border-border data-[state=checked]:border-theme',
  'data-[state=unchecked]:group-hover:border-theme/50',
  'trans-color'
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
        <RadioGroupPrimitive.Indicator className="aspect-square h-3 w-3 rounded-full bg-theme"></RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Indicator>

      {children && children}
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

interface SideRadioGroupItemProps
  extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  currentValue?: string
}

const SIDE_BUTTON_CLS =
  'relative h-6 w-6 rounded-sm aspect-square overflow-hidden group bg-background border border-transparent data-[enabled=false]:border-foreground/25 data-[enabled=true]:data-[state=checked]:border-foreground  data-[state=unchecked]:border-foreground/25 data-[enabled=true]:data-[state=unchecked]:hover:border-foreground/75 trans-color'

const BORDER_MAP: IStringMap = {
  Off: '',
  Top: '-rotate-90',
  Bottom: 'rotate-90',
  Left: 'rotate-180',
  Right: '',
}

export const SideRadioGroupItem = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Item>,
  SideRadioGroupItemProps
>(({ value, currentValue, className, disabled, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      data-enabled={!disabled}
      {...props}
      className={cn(SIDE_BUTTON_CLS, BORDER_MAP[value], className)}
      aria-label={value}
      title={value}
    >
      {/* <span className="absolute left-0 top-0 z-10 border border-dashed border-primary border-primary/50 h-full" /> */}

      {value !== 'Off' && (
        <span
          data-state={value === currentValue ? 'checked' : 'unchecked'}
          data-enabled={!disabled}
          className={cn(
            'absolute right-px top-px z-20 w-[3px] data-[enabled=false]:bg-foreground/25 data-[enabled=true]:data-[state=checked]:bg-foreground data-[state=unchecked]:bg-foreground/25 data-[enabled=true]:group-hover:bg-foreground/75 trans-color',
            [value.includes('Upper'), 'bottom-1/2', 'bottom-px']
          )}
        />
      )}
    </RadioGroupPrimitive.Item>
  )
})
SideRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
