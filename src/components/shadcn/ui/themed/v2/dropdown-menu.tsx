import { Menu as DropdownMenuPrimitive } from '@base-ui/react/menu'

import { VCenterRow } from '@/components/layout/v-center-row'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { BUTTON_MD_H_CLS, ROUNDED_CLS } from '@/theme'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Dot } from 'lucide-react'
import {
  Children,
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from 'react'
import { GLASS_CLS } from '../glass'
import {
  BASE_MENU_CLS,
  DROPDOWN_MENU_ICON_CONTAINER_CLS,
  THEME_MENU_CLS,
} from './button'

// Standard height for menu items
export const MENU_H_CLS = 'h-7'

export const DROPDOWN_MENU_ITEM_CLS = cn(
  MENU_H_CLS,
  'flex items-center relative cursor-default select-none',
  'gap-x-1 outline-hidden'
)
// export const BASE_DROPDOWN_CONTENT_CLS = cn(
//   DROPDOWN_SHADOW_CLS,
//   'rounded-theme border border-border/50'
// )

//export const DROPDOWN_CONTENT_CLS = cn(GLASS_CLS, BASE_DROPDOWN_CONTENT_CLS)

export const DROPDOWN_MENU_CONTENT_CLS = cn(
  'rounded-lg border border-border/50 shadow-xl',
  'flex flex-col text-xs min-h-0',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

const BASE_TRIGGER_CLS = 'data-[state=open]:bg-muted flex-row items-center'

const THEME_TRIGGER_CLS =
  'data-popup-open:bg-theme/50 data-popup-open:text-white data-popup-open:stroke-white'

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.SubmenuRoot

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuPrimitiveItem = DropdownMenuPrimitive.Item

export const dropdownContentVariants = cva(DROPDOWN_MENU_CONTENT_CLS, {
  variants: {
    variant: {
      none: 'bg-background',
      default: 'bg-background px-1 py-1.5 min-w-48',
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
  align = 'start',
  side = 'bottom',
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Popup> &
  ComponentProps<typeof DropdownMenuPrimitive.Positioner> &
  VariantProps<typeof dropdownContentVariants>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
      >
        <DropdownMenuPrimitive.Popup
          ref={ref}
          className={dropdownContentVariants({ variant, className })}
          {...props}
        />
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  )
}

export const dropdownMenuItemVariants = cva(DROPDOWN_MENU_ITEM_CLS, {
  variants: {
    variant: {
      none: '',
      default: BASE_MENU_CLS,
      theme: THEME_MENU_CLS,
    },
    rounded: {
      default: 'rounded-theme',
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'default',
    },
  },
})

export function BaseDropdownMenuItem({
  ref,
  variant = 'default',
  rounded = 'default',
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitiveItem> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  return (
    <DropdownMenuPrimitiveItem
      ref={ref}
      className={dropdownMenuItemVariants({ variant, rounded, className })}
      {...props}
    >
      {children}
    </DropdownMenuPrimitiveItem>
  )
}

export function DropdownMenuItemContent({ children }: IChildrenProps) {
  const c = Children.toArray(children)

  return (
    <>
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 2 && c[2]}
      </span>
    </>
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
  return (
    <BaseDropdownMenuItem
      ref={ref}
      variant={variant}
      className={cn('flex-row', className)}
      {...props}
    >
      <DropdownMenuItemContent>{children}</DropdownMenuItemContent>
    </BaseDropdownMenuItem>
  )
}

export function DropdownMenuAnchorItem({
  ref,
  href,
  variant = 'theme',
  rounded = 'default',
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
      className={dropdownMenuItemVariants({ variant, rounded, className })}
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
  rounded = 'default',
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
      className={dropdownMenuItemVariants({ variant, rounded, className })}
      checked={checked}
      data-checked={checked}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <DropdownMenuPrimitive.CheckboxItemIndicator
          render={<Check size={16} strokeWidth={2} />}
        />
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
      <DropdownMenuPrimitive.RadioItemIndicator
        render={<Dot className="h-4 w-4 fill-current" />}
      />
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

export function DropdownMenuLabel({
  ref,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.GroupLabel>) {
  return (
    <DropdownMenuPrimitive.GroupLabel
      ref={ref}
      className={cn('px-8 py-1.5 text-xs font-semibold', className)}
      {...props}
    />
  )
}

export function LineSeparator({
  ref,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('my-2 h-px bg-border/50', className)}
      {...props}
    />
  )
}

export function MenuSeparator({
  ref,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('m-2 h-px bg-muted', className)}
      {...props}
    />
  )
}

export function StrikeThroughMenuItem({ className, children }: IChildrenProps) {
  return (
    <VCenterRow className={cn('justify-center gap-x-4', className)}>
      <span className="grow h-px bg-border" />
      <span className="shrink-0 font-semibold">{children}</span>
      <span className="grow h-px bg-border " />
    </VCenterRow>
  )
}

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
      none: '',
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
  rounded = 'default',
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubmenuTrigger> &
  VariantProps<typeof dropdownMenuItemVariants> & {
    inset?: boolean
  }) {
  const c = Children.toArray(children)
  return (
    <DropdownMenuPrimitive.SubmenuTrigger
      ref={ref}
      className={dropdownMenuItemVariants({
        variant,
        rounded,
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
    </DropdownMenuPrimitive.SubmenuTrigger>
  )
}

// export function DropdownMenuSubContent({
//   ref,
//   variant = 'default',
//   className,
//   ...props
// }: ComponentProps<typeof DropdownMenuPrimitive.SubContent> &
//   VariantProps<typeof dropdownContentVariants>) {
//   return (
//     <DropdownMenuPrimitive.SubContent
//       ref={ref}
//       className={dropdownContentVariants({ variant, className })}
//       {...props}
//     />
//   )
// }

export function DropdownMenuSubContent({
  side = 'left',

  ...props
}: ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent side={side} {...props} />
}

export function DropdownSortOrderGroup({
  asc,
  labels = ['A to Z', 'Z to A'],
  setAsc,
}: {
  asc: boolean
  labels?: [string, string]
  setAsc?: (asc: boolean) => void
}) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
      <DropdownMenuCheckboxItem
        checked={asc}
        onClick={() => setAsc?.(true)}
        aria-label="Sort items ascendingly"
      >
        <span>{labels[0]}</span>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={!asc}
        onClick={() => setAsc?.(false)}
        aria-label="Sort items descendingly"
      >
        <span>{labels[1]}</span>
      </DropdownMenuCheckboxItem>
    </DropdownMenuGroup>
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
}
