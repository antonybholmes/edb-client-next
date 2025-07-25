import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { DotFilledIcon } from '@radix-ui/react-icons'

import { BUTTON_MD_H_CLS, ROUNDED_CLS } from '@/theme'
import { CheckIcon } from '@icons/check-icon'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { cn } from '@lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Children,
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from 'react'
import {
  BASE_MENU_CLS,
  DROPDOWN_MENU_ICON_CONTAINER_CLS,
  THEME_MENU_CLS,
} from './button'
import { GLASS_CLS } from './glass'

export const DROPDOWN_MENU_ITEM_CLS = cn(
  BUTTON_MD_H_CLS,
  'flex items-center relative rounded-menu cursor-default select-none',
  'gap-x-1 outline-hidden'
)
// export const BASE_DROPDOWN_CONTENT_CLS = cn(
//   DROPDOWN_SHADOW_CLS,
//   'rounded-theme border border-border/50'
// )

//export const DROPDOWN_CONTENT_CLS = cn(GLASS_CLS, BASE_DROPDOWN_CONTENT_CLS)

const CONTENT_CLS = cn(
  'rounded-lg border border-border/50 shadow-xl',
  'flex flex-col text-xs z-(--z-modal) min-h-0',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

// const CHECK_CLS = cn(
//   DROPDOWN_MENU_ITEM_CLS
//   //'outline-hidden data-[state=checked]:text-popover-alt data-[state=checked]:fill-popover-alt',
//   //'data-[state=checked]:stroke-popover-alt'
// )

// const SUBCONTENT_CLS = cn(
//   BASE_DROPDOWN_CONTENT_CLS,
//   'z-modal z-(--z-modal) min-w-56 flex flex-col text-xs p-1 data-[state=open]:animate-in',
//   'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
//   'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1.5',
//   'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
// )

const BASE_TRIGGER_CLS = 'data-[state=open]:bg-muted flex-row items-center'

const THEME_TRIGGER_CLS = cn(
  'data-[state=open]:bg-theme/50 data-[state=open]:text-white data-[state=open]:stroke-white',
  'data-[state=open]:fill-white'
)

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuPrimitiveItem = DropdownMenuPrimitive.Item

export const dropdownContentVariants = cva(CONTENT_CLS, {
  variants: {
    variant: {
      default: 'bg-background p-1 min-w-48',
      content: 'bg-background p-2',
      header: 'bg-background p-4',
      glass: cn(GLASS_CLS, 'p-1.5'),
    },
    defaultVariants: {
      variant: 'default',
    },
  },
})

export function DropdownMenuContent({
  ref,
  variant = 'default',
  sideOffset = 4,
  side = 'bottom',
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content> &
  VariantProps<typeof dropdownContentVariants>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        className={dropdownContentVariants({ variant, className })}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export const dropdownMenuItemVariants = cva(DROPDOWN_MENU_ITEM_CLS, {
  variants: {
    variant: {
      default: BASE_MENU_CLS,
      theme: THEME_MENU_CLS,
    },
    defaultVariants: {
      variant: 'default',
    },
  },
})

export function BaseDropdownMenuItem({
  ref,
  variant = 'default',
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitiveItem> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  return (
    <DropdownMenuPrimitiveItem
      ref={ref}
      className={dropdownMenuItemVariants({ variant, className })}
      {...props}
    >
      {children}
    </DropdownMenuPrimitiveItem>
  )
}

export function DropdownMenuItem({
  ref,
  variant = 'theme',
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitiveItem> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  const c = Children.toArray(children)

  return (
    <BaseDropdownMenuItem
      ref={ref}
      variant={variant}
      className={cn('flex-row', className)}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 2 && c[2]}
      </span>
    </BaseDropdownMenuItem>
  )
}

export function DropdownMenuAnchorItem({
  ref,
  href,
  variant = 'theme',
  className,
  children,
  ...props
}: ComponentProps<'a'> &
  VariantProps<typeof dropdownMenuItemVariants> & { href: string }) {
  const c = Children.toArray(children)

  return (
    <a
      ref={ref}
      href={href}
      className={dropdownMenuItemVariants({ variant, className })}
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
    </a>
  )
}

export function DropdownMenuCheckboxItem({
  ref,
  variant = 'theme',
  className = '',
  children,
  checked = false,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  const c = Children.toArray(children)

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={dropdownMenuItemVariants({ variant, className })}
      checked={checked}
      data-checked={checked}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon w="w-3.5 h-3.5" stroke="" style={{ strokeWidth: 3 }} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>

      {/* <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span> */}

      <span className="grow">{c[0]}</span>

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[1]}

        {/* {checked ? (
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon w="w-3.5 h-3.5" stroke="" style={{ strokeWidth: 3 }} />
          </DropdownMenuPrimitive.ItemIndicator>
        ) : (
          <>{c.length > 2 && c[0]}</>
        )} */}
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      ROUNDED_CLS,
      BUTTON_MD_H_CLS,
      'relative flex cursor-default select-none items-center text-xs outline-hidden focus:bg-muted focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    {...props}
  >
    <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

export function DropdownMenuLabel({
  ref,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn('px-[2.25rem] pt-2 pb-1 text-xs font-semibold', className)}
      {...props}
    />
  )
}

const MenuSeparator = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-muted', className)}
    {...props}
  />
))
MenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export const dropdownMenuSubTriggerVariants = cva('', {
  variants: {
    variant: {
      default: BASE_TRIGGER_CLS,
      theme: THEME_TRIGGER_CLS,
    },
    defaultVariants: {
      variant: 'default',
    },
  },
})

export function DropdownMenuSubTrigger({
  ref,
  variant = 'theme',
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> &
  VariantProps<typeof dropdownMenuItemVariants> & {
    inset?: boolean
  }) {
  const c = Children.toArray(children)
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={dropdownMenuItemVariants({
        variant,
        className: dropdownMenuSubTriggerVariants({
          variant,
          className: cn(BASE_TRIGGER_CLS, inset && 'pl-8', className),
        }),
      })}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <ChevronRightIcon w="w-4" stroke="" />
      </span>
    </DropdownMenuPrimitive.SubTrigger>
  )
}

export function DropdownMenuSubContent({
  ref,
  variant = 'default',
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent> &
  VariantProps<typeof dropdownContentVariants>) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={dropdownContentVariants({ variant, className })}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuPrimitiveItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuTrigger,
  MenuSeparator,
}
