import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

const toggleVariants = cva(
  'inline-flex items-center text-xs font-medium trans-color hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground',
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-muted/50 data-[state=on]:bg-accent/50',
        outline:
          'border border-border bg-transparent shadow-sm hover:bg-muted data-[state=on]:bg-muted',
        tab: '',
        colorful:
          'border-2 border-border border-transparent hover:border-theme/25 data-[state=on]:shadow-sm data-[state=on]:border-theme/50 data-[state=on]:bg-theme/10',
      },
      size: {
        default: 'h-8 px-2',
        md: 'h-9 px-2',
        lg: 'h-10 px-3',
        toolbar: 'h-9',
        colorful: 'w-24 h-16',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
      },
      rounded: {
        none: '',
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-theme',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'none',
      justify: 'center',
    },
  }
)

const Toggle = forwardRef<
  ComponentRef<typeof TogglePrimitive.Root>,
  ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(
  (
    {
      pressed = false,
      variant = 'default',
      size,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <TogglePrimitive.Root
      pressed={pressed}
      ref={ref}
      className={toggleVariants({ variant, size, className })}
      {...props}
    >
      ss
      {pressed}
      {pressed && <span>c</span>}
      {children}
    </TogglePrimitive.Root>
  )
)

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
