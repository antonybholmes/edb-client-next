import { BUTTON_MD_H_CLS, BUTTON_SM_H_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { CheckIcon } from '@icons/check-icon'
import { cn } from '@lib/shadcn-utils'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as SelectPrimitive from '@radix-ui/react-select'

import { ChevronRightIcon } from '@/components/icons/chevron-right-icon'
import type { IDivProps } from '@interfaces/div-props'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import { DROPDOWN_MENU_ICON_CONTAINER_CLS } from './button'
import {
  dropdownContentVariants,
  dropdownMenuItemVariants,
} from './dropdown-menu'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const triggerVariants = cva(
  cn(
    FOCUS_INSET_RING_CLS,
    'flex items-center gap-x-2 justify-between whitespace-nowrap trans-color',
    'disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-background stroke-foreground border border-border focus:border-ring hover:border-ring',
          'data-[state=open]:border-ring placeholder:text-foreground/50 rounded-theme pl-2 pr-1',
          BUTTON_MD_H_CLS
        ),
        toolbar: cn(
          'bg-background stroke-foreground border border-border focus:border-ring hover:border-ring',
          'data-[state=open]:border-ring placeholder:text-foreground/50 rounded-theme pl-2 pr-1',
          BUTTON_SM_H_CLS
        ),
        header: 'px-2',
        glass: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function SelectTrigger({
  ref,
  variant = 'default',
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof triggerVariants>) {
  if (!props['aria-label']) {
    props['aria-label'] = title
  }

  if (!props['aria-label']) {
    props['aria-label'] = 'Select item'
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={triggerVariants({ variant, className })}
      title={title}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        {/* <CaretSortIcon className="h-4 w-4 opacity-50" /> */}
        {/* <ChevronUpDownIcon className="opacity-50" w="w-4" /> */}
        <ChevronRightIcon className="opacity-50 rotate-90" w="w-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

const SelectScrollUpButton = forwardRef<
  ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = forwardRef<
  ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

export function SelectContent({
  ref,
  side = 'bottom',
  variant = 'default',
  position = 'popper',
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content> &
  VariantProps<typeof dropdownContentVariants>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
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
        className={dropdownContentVariants({
          variant,
          className,
        })}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
        // className={cn(
        //   'px-0.5 py-1.5',
        //   position === 'popper' &&
        //     'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]'
        // )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

const SelectLabel = forwardRef<
  ComponentRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-9 py-2 text-xs font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

export function SelectItem({
  ref,
  variant = 'theme',
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
        className,
      })}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon w="w-3.5 h-3.5" stroke="" />
        </SelectPrimitive.ItemIndicator>
      </span>

      {/* <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS} /> */}

      <span className="grow">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
    </SelectPrimitive.Item>
  )
}

const SelectSeparator = forwardRef<
  ComponentRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

interface ISelectListProps extends IDivProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function SelectList({
  value = '',
  defaultValue = '',
  onValueChange = () => {},
  className,
  children,
}: ISelectListProps) {
  const [open, setOpen] = useState(false)

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onOpenChange={setOpen}
    >
      <SelectTrigger className={className} data-open={open}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}

export {
  Select,
  SelectGroup,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
