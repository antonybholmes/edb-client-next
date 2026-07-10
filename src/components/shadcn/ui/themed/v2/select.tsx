import { cn } from '@/lib/shadcn-utils'
import { BUTTON_XS_H_CLS } from '@/theme'
import { Select as SelectPrimitive } from '@base-ui/react/select'

import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { type ComponentProps } from 'react'
import {
  BASE_FLAT_BUTTON_CLS,
  DROPDOWN_MENU_ICON_CONTAINER_CLS,
} from '../v2/button'
import {
  dropdownContentVariants,
  dropdownMenuItemVariants,
  POPOVER_CLS,
  POSITIONER_CLS,
} from '../v2/dropdown-menu'

export const Select = SelectPrimitive.Root

export const SelectGroup = SelectPrimitive.Group

export const SelectValue = SelectPrimitive.Value

export const BaseSelectTrigger = SelectPrimitive.Trigger

export const triggerVariants = cva(
  cn(
    //FOCUS_INSET_RING_CLS,
    'flex flex-row items-center gap-x-1 justify-between trans-color',
    'disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-background  pl-2 pr-1 stroke-foreground border border-border/50 hover:border-app-theme/50',
          'data-[popup-open]:border-app-theme/50 placeholder:text-foreground/50 rounded-theme'
        ),
        toolbar: cn(
          'h-toolbar-button rounded-theme border border-transparent focus:border-app-theme/50 pl-2 pr-1',
          'hover:border-border/60 data-[popup-open]:border-border/60 aria-[expanded=true]:border-border/60'
        ),
        button: cn(BASE_FLAT_BUTTON_CLS, 'h-button rounded-theme'),
        footer: cn(BASE_FLAT_BUTTON_CLS, BUTTON_XS_H_CLS),
        header: cn(BASE_FLAT_BUTTON_CLS, 'h-button-lg px-2 pl-3 rounded-theme'),
        glass: '',
      },
      h: {
        footer: 'h-6',
        default: 'h-8',
        full: 'h-full',
      },
      w: {
        auto: '',
        xxxxs: 'w-12',
        xxxs: 'w-14',
        xxs: 'w-18',
        xs: 'w-20',
        sm: 'w-24',
        md: 'w-32',
        lg: 'w-48',
        xl: 'w-64',
        grow: 'grow',
      },
    },
    defaultVariants: {
      variant: 'default',
      w: 'auto',
      h: 'default',
    },
  }
)

export function SelectTrigger({
  ref,
  variant,
  w,
  h,
  title,
  showIcon = true,
  className,
  children,

  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof triggerVariants> & {
    showIcon?: boolean
  }) {
  if (!props['aria-label']) {
    props['aria-label'] = title
  }

  if (!props['aria-label']) {
    props['aria-label'] = 'Select item'
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={triggerVariants({ variant, w, h, className })}
      title={title}
      {...props}
    >
      {children}

      {showIcon && (
        <SelectPrimitive.Icon>
          <ChevronDown size={16} />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  )
}

export function SelectScrollUpButton({
  ref,
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      ref={ref}
      className={cn(
        'flex cursor-default items-center justify-center py-1 w-full border',
        className
      )}
      {...props}
    >
      <ChevronUp />
    </SelectPrimitive.ScrollUpArrow>
  )
}

export function SelectScrollDownButton({
  ref,
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      ref={ref}
      className={cn(
        'flex cursor-default items-center justify-center w-full py-1',
        className
      )}
      {...props}
    >
      <ChevronDown />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export function SelectContent({
  ref,
  variant = 'default',
  //position = 'popper',
  align = 'start',
  side = 'bottom',
  alignItemWithTrigger = false,
  sideOffset = 3,
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Portal> &
  ComponentProps<typeof SelectPrimitive.Positioner> &
  VariantProps<typeof dropdownContentVariants>) {
  return (
    <SelectPrimitive.Portal ref={ref} {...props}>
      <SelectPrimitive.Positioner
        align={align}
        side={side}
        alignItemWithTrigger={alignItemWithTrigger}
        sideOffset={sideOffset}
        //ref={ref}
        // className={cn(
        //   ROUNDED_MD_CLS,
        //   GLASS_CLS,
        //   'relative z-modal z-(--z-modal) min-w-48 max-h-96 overflow-hidden border border-border/50 text-popover-foreground',
        //   'shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        //   'data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        //   'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
        //   'data-[side=top]:slide-in-from-bottom-2',
        //   //position === 'popper' &&
        //   //  'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        //   className
        // )}

        //position={position}
        className={POSITIONER_CLS}
      >
        <SelectPrimitive.Popup
          className={dropdownContentVariants({
            variant,
            className: cn(POPOVER_CLS, 'border', className),
          })}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

export function SelectLabel({
  ref,
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn(
        'px-8 h-7 flex flex-row items-center text-xs font-semibold',
        className
      )}
      {...props}
    />
  )
}

export function SelectItem({
  ref,
  variant = 'app-theme',
  rounded = 'theme',
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={dropdownMenuItemVariants({
        variant,
        rounded,
        className,
      })}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <SelectPrimitive.ItemIndicator>
          <Check size={16} />
        </SelectPrimitive.ItemIndicator>
      </span>

      {/* <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS} /> */}

      <span className="grow">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({
  ref,
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
}

interface ISelectListProps
  extends ComponentProps<typeof Select>, VariantProps<typeof triggerVariants> {
  className?: string
}

export function SelectList({
  variant,
  w = 'md',
  multiple = false,
  className = '',
  children,
  ...props
}: ISelectListProps) {
  return (
    <Select multiple={multiple} {...props}>
      <SelectTrigger w={w} variant={variant} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
