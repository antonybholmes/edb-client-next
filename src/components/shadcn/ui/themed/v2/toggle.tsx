import { cn } from '@/lib/shadcn-utils'
import {
  BUTTON_MD_H_CLS,
  CENTERED_ROW_CLS,
  FOCUS_INSET_RING_CLS,
  ICON_BUTTON_CLS,
  TOOLBAR_BUTTON_H_CLS,
} from '@/theme'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'

const TOGGLE_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'disabled:pointer-events-none disabled:opacity-50 trans-color'
)

export const toggleVariants = cva(TOGGLE_CLS, {
  variants: {
    variant: {
      default: cn(
        CENTERED_ROW_CLS,
        'hover:bg-muted/50 data-pressed:bg-muted/50'
      ),
      outline:
        'border border-transparent bg-transparent data-pressed:font-semibold text-xs data-pressed:bg-background data-pressed:shadow-xs data-pressed:border-border/75 rounded-theme overflow-hidden',
      gray: 'border border-transparent bg-transparent data-[state=off]:hover:bg-faint data-pressed:font-semibold text-xs data-pressed:bg-faint data-pressed:border-border overflow-hidden',
      tab: 'overflow-hidden text-xs rounded-theme data-[state=off]:hover:bg-faint data-pressed:bg-theme/25 data-pressed:font-semibold',
      colorful:
        'flex flex-col gap-y-2 items-center p-2 border-2 border-border border-transparent hover:border-theme/25 data-pressed:shadow-xs data-pressed:border-theme/50 data-pressed:bg-theme/10',
      group:
        'hover:bg-muted/60 data-pressed:text-theme focus-visible:z-10 focus:z-10 outline-2 -outline-offset-2 outline-transparent focus-visible:outline-ring border border-border data-pressed:font-semibold',
    },
    size: {
      sm: 'h-7',
      md: BUTTON_MD_H_CLS,
      lg: 'h-9',
      toolbar: TOOLBAR_BUTTON_H_CLS,
      colorful: 'h-16 w-24',
      icon: ICON_BUTTON_CLS,
    },
    aspect: {
      auto: 'aspect-auto',
      icon: 'aspect-square',
    },
    justify: {
      start: 'justify-start text-left',
      center: 'justify-center',
    },
    rounded: {
      none: '',
      sm: 'rounded-xs',
      default: 'rounded-theme',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
    pad: {
      none: '',
      md: 'px-2',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    rounded: 'default',
    justify: 'center',
    pad: 'md',
    aspect: 'auto',
  },
})

export function Toggle({
  ref,
  pressed = false,
  variant = 'default',
  size,
  justify,
  rounded,
  pad,
  aspect,
  className,
  children,
  ...props
}: ComponentProps<typeof TogglePrimitive> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      pressed={pressed}
      ref={ref}
      className={toggleVariants({
        variant,
        size,
        justify,
        rounded,
        pad,
        aspect,
        className,
      })}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export function IconToggle({
  size = 'icon',
  ...props
}: ComponentProps<typeof Toggle>) {
  return (
    <Toggle {...props} size={size}>
      {props.children}
    </Toggle>
  )
}
