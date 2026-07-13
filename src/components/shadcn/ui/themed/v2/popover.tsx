import { Popover as PopoverPrimitive } from '@base-ui/react/popover'

import { CheckIcon } from '@/components/icons/check-icon'
import { cn } from '@/lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'
import { DROPDOWN_MENU_ICON_CONTAINER_CLS, type IButtonProps } from './button'
import {
  dropdownContentVariants,
  DropdownMenuItemContent,
  dropdownMenuItemVariants,
  POPOVER_CLS,
  POSITIONER_CLS,
} from './dropdown-menu'

export const Popover = PopoverPrimitive.Root

export const PopoverTitle = PopoverPrimitive.Title

//export const PopoverTrigger = PopoverPrimitive.Trigger

export const triggerVariants = cva('', {
  variants: {
    variant: {
      default: '',
    },
    w: {
      none: '',
      sm: 'w-24',
      md: 'w-32',
      lg: 'w-48',
      xl: 'w-64',
      grow: 'grow',
    },
  },
  defaultVariants: {
    variant: 'default',
    w: 'none',
  },
})

export function PopoverTrigger({
  variant,
  w,
  className,
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> &
  VariantProps<typeof triggerVariants> & {
    showIcon?: boolean
  }) {
  return (
    <PopoverPrimitive.Trigger
      className={triggerVariants({ variant, w, className })}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  )
}

export function PopoverContent({
  ref,
  className = '',
  variant = 'content',
  align = 'start',
  sideOffset = 4,
  children,
}: ComponentProps<typeof PopoverPrimitive.Popup> &
  ComponentProps<typeof PopoverPrimitive.Positioner> &
  //ComponentProps<typeof PopoverPrimitive.Viewport> &
  VariantProps<typeof dropdownContentVariants>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        sideOffset={sideOffset}
        className={POSITIONER_CLS}
      >
        <PopoverPrimitive.Popup
          ref={ref}
          //{...props}
          className={dropdownContentVariants({
            variant,
            className: cn(POPOVER_CLS, className),
          })}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export function PopoverSpeechArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="50"
      viewBox="0 0 100 50"
      className="absolute -top-4.5 w-6 h-3 left-1/2 -translate-x-1/2"
    >
      <path
        d="M0,50 L50,0 L100,50 Z"
        className="fill-background"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <path
        d="M0,50 L50,0 L100,50"
        strokeWidth="4"
        className="stroke-border/50"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function PopoverMenuItem({
  ref,
  variant = 'default',
  rounded = 'theme',
  checked,
  className,
  children,
  ...props
}: Omit<IButtonProps, 'variant' | 'rounded'> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  return (
    <button
      ref={ref}
      data-checked={checked}
      className={dropdownMenuItemVariants({ variant, rounded, className })}
      {...props}
    >
      <DropdownMenuItemContent>
        {checked && (
          <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
            <CheckIcon
              size="w-3.5 h-3.5"
              stroke=""
              style={{ strokeWidth: 3 }}
            />
          </span>
        )}

        {children}
      </DropdownMenuItemContent>
    </button>
  )
}
