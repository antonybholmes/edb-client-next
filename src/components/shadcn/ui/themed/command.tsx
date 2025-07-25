import type { DialogProps } from '@radix-ui/react-dialog'
import { Command as CommandPrimitive } from 'cmdk'

import { BUTTON_MD_H_CLS } from '@/theme'
import { SearchIcon } from '@icons/search-icon'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import { Dialog, DialogContent } from '@themed/dialog'
import type { VariantProps } from 'class-variance-authority'
import {
  Children,
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from 'react'
import { DROPDOWN_MENU_ICON_CONTAINER_CLS } from './button'
import { dropdownMenuItemVariants } from './dropdown-menu'

const Command = forwardRef<
  ComponentRef<typeof CommandPrimitive>,
  ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn('flex flex-col overflow-hidden', className)}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-foreground/50 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = forwardRef<
  ComponentRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <VCenterRow className="gap-x-2 border border-border/50 px-3 bg-background mt-1 mb-2 rounded-theme">
    <SearchIcon className="shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        BUTTON_MD_H_CLS,
        'flex bg-transparent text-sm outline-hidden placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </VCenterRow>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = forwardRef<
  ComponentRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar',
      className
    )}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = forwardRef<
  ComponentRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = forwardRef<
  ComponentRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden py-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-foreground/50',
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = forwardRef<
  ComponentRef<typeof CommandPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

export function CommandItem({
  ref,
  variant = 'default',
  className,
  children,
  ...props
}: ComponentProps<typeof CommandPrimitive.Item> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  const c = Children.toArray(children)

  return (
    <CommandPrimitive.Item
      ref={ref}
      className={dropdownMenuItemVariants({
        variant,
        className: cn(
          '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          className
        ),
      })}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      {c.length > 2 && (
        <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>{c[2]}</span>
      )}
    </CommandPrimitive.Item>
  )
}

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-foreground/50',
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = 'CommandShortcut'

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
