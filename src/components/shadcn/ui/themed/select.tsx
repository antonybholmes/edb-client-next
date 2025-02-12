import { ROUNDED_MD_CLS } from '@/theme'
import { SortIcon } from '@components/icons/sort-icon'
import { CheckIcon } from '@icons/check-icon'
import { cn } from '@lib/class-names'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as SelectPrimitive from '@radix-ui/react-select'

import type { IElementProps } from '@interfaces/element-props'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import {
  DROPDOWN_MENU_CLS,
  DROPDOWN_MENU_ICON_CONTAINER_CLS,
} from './dropdown-menu'
import { GLASS_CLS } from './glass'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const triggerVariants = cva(
  'flex pl-2 pr-1 items-center gap-x-2 justify-between whitespace-nowrap trans-color rounded-theme outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default:
          'bg-background stroke-foreground border border-border focus:border-theme/75 hover:border-theme/75 data-[state=open]:border-theme/75 placeholder:text-foreground/50',
        header: 'stroke-white',
      },
      size: {
        default: 'h-8',
        sm: 'h-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const SelectTrigger = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
    VariantProps<typeof triggerVariants>
>(
  (
    {
      variant = 'default',
      size = 'default',
      className,
      children,
      title,
      ...props
    },
    ref
  ) => {
    if (!props['aria-label']) {
      props['aria-label'] = title
    }

    if (!props['aria-label']) {
      props['aria-label'] = 'Select item'
    }

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={triggerVariants({ variant, size, className })}
        title={title}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          {/* <CaretSortIcon className="h-4 w-4 opacity-50" /> */}
          <SortIcon className="opacity-75" w="w-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    )
  }
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

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

const SelectContent = forwardRef<
  ComponentRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className = 'text-sm', children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        ROUNDED_MD_CLS,
        GLASS_CLS,
        'relative z-modal z-(--z-modal) max-h-96 overflow-hidden border border-border/50 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'px-0.5 py-1.5',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = forwardRef<
  ComponentRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      //BUTTON_H_CLS,
      //'relative flex cursor-default select-none outline-none flex-row items-center focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      DROPDOWN_MENU_CLS,
      className
    )}
    {...props}
  >
    <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
      <SelectPrimitive.ItemIndicator>
        <CheckIcon stroke="" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS} />
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

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

interface ISelectListProps extends IElementProps {
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
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
