import {
  BUTTON_MD_H_CLS,
  FOCUS_INSET_RING_CLS,
  TOOLBAR_BUTTON_H_CLS,
} from '@/theme'
import { cn } from '@lib/shadcn-utils'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'

export const toggleVariants = cva(
  cn(FOCUS_INSET_RING_CLS, 'disabled:pointer-events-none disabled:opacity-50'),
  {
    variants: {
      variant: {
        default:
          'hover:bg-muted/50 data-[state=on]:bg-muted rounded-theme border border-transparent data-[state=on]:border-border',
        outline:
          'border border-transparent bg-transparent data-[state=on]:font-semibold text-xs data-[state=on]:bg-background data-[state=on]:shadow-xs data-[state=on]:border-border/75 rounded-theme overflow-hidden',
        gray: 'border border-transparent bg-transparent data-[state=off]:hover:bg-faint data-[state=on]:font-semibold text-xs data-[state=on]:bg-faint data-[state=on]:border-border overflow-hidden',
        tab: 'overflow-hidden text-xs rounded-theme data-[state=off]:hover:bg-faint data-[state=on]:bg-theme/25 data-[state=on]:font-semibold',
        colorful:
          'flex flex-col gap-y-2 items-center p-2 border-2 border-border border-transparent hover:border-theme/25 data-[state=on]:shadow-xs data-[state=on]:border-theme/50 data-[state=on]:bg-theme/10',
        group:
          'hover:bg-muted/50 data-[state=on]:text-theme focus-visible:z-10 focus:z-10 outline-2 -outline-offset-2 outline-transparent focus-visible:outline-ring border border-border data-[state=on]:font-semibold',
      },
      size: {
        sm: 'h-7',
        md: cn(BUTTON_MD_H_CLS, 'px-2'),
        lg: 'h-10 px-3',
        toolbar: TOOLBAR_BUTTON_H_CLS,
        colorful: 'h-16 w-24',
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
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'none',
      justify: 'center',
    },
  }
)

export function Toggle({
  ref,
  pressed = false,
  variant = 'default',
  size,
  className,
  children,
  ...props
}: ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      pressed={pressed}
      ref={ref}
      className={toggleVariants({ variant, size, className })}
      {...props}
    >
      {pressed}
      {pressed && <span>c</span>}
      {children}
    </TogglePrimitive.Root>
  )
}
