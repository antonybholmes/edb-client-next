import * as PopoverPrimitive from '@radix-ui/react-popover'

import { type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import { dropdownContentVariants } from '../baseui/dropdown-menu'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
    VariantProps<typeof dropdownContentVariants>
>(
  (
    {
      className,
      variant = 'default',
      align = 'start',
      sideOffset = 4,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={dropdownContentVariants({ variant, className })}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export function PopoverSpeechArrow() {
  return (
    <>
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-background" />
      <span className="absolute -top-2.25 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-border/75 z-[-1]" />
    </>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
