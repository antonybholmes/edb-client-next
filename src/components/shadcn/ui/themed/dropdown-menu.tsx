import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { DotFilledIcon } from '@radix-ui/react-icons'

import {
  BUTTON_H_CLS,
  BUTTON_W_CLS,
  ROUNDED_CLS,
  V_CENTERED_ROW_CLS,
} from '@/theme'
import { CheckIcon } from '@components/icons/check-icon'
import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { cn } from '@lib/class-names'
import {
  Children,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type PropsWithoutRef,
} from 'react'
import { GLASS_CLS } from './glass'

export const DROPDOWN_SHADOW_CLS = 'shadow-xl'

export const BASE_DROPDOWN_CONTENT_CLS = cn(
  GLASS_CLS,
  DROPDOWN_SHADOW_CLS,
  'rounded-menu border border-border/50'
)

export const DROPDOWN_MENU_CLS = cn(
  BUTTON_H_CLS,
  V_CENTERED_ROW_CLS,
  'relative rounded-menu cursor-default select-none gap-x-1 outline-none',
  'fill-foreground stroke-foreground',
  'focus:bg-theme/60 focus:text-white focus:fill-white focus:stroke-white',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  'hover:bg-theme/60 hover:text-white hover:fill-white hover:stroke-white'
)

const CONTENT_CLS = cn(
  BASE_DROPDOWN_CONTENT_CLS,
  'flex flex-col text-xs p-1 z-modal z-(--z-modal) overflow-hidden min-h-0 min-w-56',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-1.5 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

const CHECK_CLS = cn(
  DROPDOWN_MENU_CLS
  //'outline-none data-[state=checked]:text-popover-alt data-[state=checked]:fill-popover-alt',
  //'data-[state=checked]:stroke-popover-alt'
)

export const DROPDOWN_MENU_ICON_CONTAINER_CLS = cn(
  BUTTON_W_CLS,
  'flex flex-row items-center shrink-0 grow-0 justify-center'
)

const SUBCONTENT_CLS = cn(
  BASE_DROPDOWN_CONTENT_CLS,
  'z-modal z-(--z-modal) min-w-56 flex flex-col text-xs p-1 data-[state=open]:animate-in',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1.5',
  'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const TRIGGER_CLS = cn(
  DROPDOWN_MENU_CLS,
  'data-[state=open]:bg-theme/60 data-[state=open]:text-white data-[state=open]:stroke-white',
  'data-[state=open]:fill-white'
)

const DropdownMenuSubTrigger = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => {
  const c = Children.toArray(children)
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(TRIGGER_CLS, inset && 'pl-8', className)}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <ChevronRightIcon w="w-3.5" stroke="" />
      </span>
    </DropdownMenuPrimitive.SubTrigger>
  )
})

DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(SUBCONTENT_CLS, className)}
    {...props}
  />
))

DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(CONTENT_CLS, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuPrimitiveItem = DropdownMenuPrimitive.Item

const DropdownMenuItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitiveItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveItem>
>(({ className, children, ...props }, ref) => {
  const c = Children.toArray(children)

  return (
    <DropdownMenuPrimitiveItem
      ref={ref}
      className={cn(DROPDOWN_MENU_CLS, className)}
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
    </DropdownMenuPrimitiveItem>
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuAnchorItem = forwardRef<
  HTMLAnchorElement,
  PropsWithoutRef<HTMLAttributes<HTMLAnchorElement>> & { href: string }
>(({ href, className, children, ...props }, ref) => {
  const c = Children.toArray(children)

  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        DROPDOWN_MENU_CLS,

        className
      )}
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
})
DropdownMenuAnchorItem.displayName = 'DropdownMenuAnchorItem'

const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className = '', children, checked = false, ...props }, ref) => {
  const c = Children.toArray(children)

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(CHECK_CLS, className)}
      checked={checked}
      {...props}
    >
      {/* <span className="inline-flex flex-row">
        <span className={DROPDOWN_MENU_ICON_CONT_CLS}>
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon w="w-4" fill="" />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>

        <span className={DROPDOWN_MENU_ICON_CONT_CLS}>
          {c.length > 1 && c[0]}
        </span>
      </span> */}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {checked ? (
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon w="w-3.5 h-3.5" stroke="" style={{ strokeWidth: 3 }} />
          </DropdownMenuPrimitive.ItemIndicator>
        ) : (
          <>{c.length > 1 && c[0]}</>
        )}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS} />
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      ROUNDED_CLS,
      BUTTON_H_CLS,
      'relative flex cursor-default select-none items-center text-xs outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
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

const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-9 pt-2 pb-1 text-xs font-semibold rounded-theme mb-1',

      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const MenuSeparator = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-foreground/10', className)}
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

export {
  DropdownMenu,
  DropdownMenuAnchorItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPrimitiveItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
}
