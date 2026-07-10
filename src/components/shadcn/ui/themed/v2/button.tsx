import type { IPos } from '@/interfaces/pos'
import {
  Button as ButtonPrimitive,
  type ButtonProps,
} from '@base-ui/react/button'

import type { ITooltipSide } from '@/interfaces/tooltip-side-props'
import { cn } from '@/lib/shadcn-utils'
import {
  BASE_BUTTON_CLS,
  BASE_ICON_BUTTON_CLS,
  BUTTON_XL_H_CLS,
  BUTTON_XS_H_CLS,
  CENTERED_ROW_CLS,
  CORE_APP_ACCENT_BUTTON_CLS,
  CORE_PRIMARY_BUTTON_CLS,
  CORE_THEME_BUTTON_CLS,
  DESTRUCTIVE_CLS,
  DROPDOWN_BUTTON_CLS,
  DROPDOWN_WITH_ICON_BUTTON_CLS,
  FOCUS_RING_CLS,
  ICON_BUTTON_CLS,
  LARGE_ICON_BUTTON_CLS,
  SM_ICON_BUTTON_CLS,
  TOOLBAR_DROPDOWN_BUTTON_CLS,
  TRANS_COLOR_CLS,
} from '@/theme'
import { cva, type VariantProps } from 'class-variance-authority'
import { gsap } from 'gsap'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

// const BASE_GHOST_CLS =
//   'border border-transparent bg-muted hover:bg-accent data-[checked=true]:bg-accent'

export const BASE_OUTLINE_CLS = cn(
  FOCUS_RING_CLS,
  'focus:border-ring hover:border-ring bg-background',
  'border border-border data-[checked=true]:border-ring'
)

export const BASE_IOS_CLS = cn(
  'border border-transparent hover:border-border/25 hover:bg-background/75',
  'data-[checked=true]:bg-background/75 data-[checked=true]:border-border/75',
  'data-popup-open:bg-background/75 data-popup-open:border-border/75'
)

export const BASE_SECONDARY_CLS = cn(
  FOCUS_RING_CLS,
  'bg-background border border-border data-[checked=false]:hover:bg-faint',
  'data-[checked=true]:bg-faint data-[state=open]:bg-faint'
)

export const BASE_ALT_CLS = cn(
  FOCUS_RING_CLS,
  'bg-faint data-[checked=false]:hover:bg-muted',
  'data-[checked=true]:bg-muted data-[state=open]:bg-muted'
)

export const BASE_FLAT_BUTTON_CLS = cn(
  'hover:bg-muted/50 data-[checked=false]:hover:bg-muted/50',
  'data-[checked=true]:bg-muted/50 data-[state=open]:bg-muted/50',
  'aria-[expanded=true]:bg-muted/50 data-popup-open:bg-muted/50'
)

export const BASE_FLAT_ALT_BUTTON_CLS = cn(
  'hover:bg-muted/70 data-[checked=false]:hover:bg-muted/70',
  'data-[checked=true]:bg-muted/70 data-[state=open]:bg-muted/70',
  'aria-[expanded=true]:bg-muted/70 data-popup-open:bg-muted/70'
)

export const BASE_FLAT_APP_THEME_BUTTON_CLS = cn(
  'hover:bg-app-theme/20 data-[checked=false]:hover:bg-app-theme/20',
  'data-[checked=true]:bg-app-theme/20 data-[state=open]:bg-app-theme/20',
  'aria-[expanded=true]:bg-app-theme/20 data-popup-open:bg-app-theme/20'
)

export const BASE_MUTED_LIGHT_CLS = cn(
  'border border-transparent data-[checked=false]:hover:bg-muted/50',
  'data-[checked=true]:bg-muted/50 data-[state=open]:bg-muted/50'
)

export const THEME_MUTED_CLS = cn(
  'border border-transparent hover:bg-theme/25',
  'data-[checked=true]:bg-theme/25 data-[state=open]:bg-theme/25',
  'aria-[expanded=true]:bg-theme/25'
)

// export const ACCENT_BUTTON_CLS =
//   'data-[mode=flat]:bg-accent data-[mode=flat]:hover:bg-accent hover:bg-accent'

// export const BASE_TOOLBAR_CLS = cn(
//   'border border-transparent data-[checked=false]:hover:bg-muted/50',
//   'data-[checked=true]:bg-muted/50 data-[state=open]:bg-muted/50'
// )

// export const BASE_MUTED_THEME_CLS = cn(
//   'border border-transparent hover:bg-theme-muted data-[checked=false]:hover:bg-theme-muted',
//   'data-[checked=true]:bg-theme-muted data-[state=open]:bg-theme-muted'
// )

// const BASE_ACCENT_CLS =
//   'hover:bg-muted/30 data-[checked=true]:bg-muted/30 data-[state=open]:bg-muted/30'

export const BASE_MENU_CLS = cn(
  'focus:bg-muted',
  'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
  'fill-foreground stroke-foreground',
  'hover:bg-muted'
  //'data-[checked=true]:bg-muted/50 data-[checked=true]:border-border',
  //'data-[state=checked]:bg-muted/50 data-[state=checked]:border-border'
)

export const BASE_THEME_MENU_CLS = cn(
  'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
  'fill-foreground stroke-foreground',
  'border border-transparent',
  'data-[selected=true]:bg-muted/50 data-[selected=true]:border-border/50',
  'data-[selected=true]:text-foreground data-[selected=true]:stroke-foreground'
)

export const THEME_MENU_CLS = cn(
  BASE_THEME_MENU_CLS,
  'focus:text-white focus:fill-white focus:stroke-white',
  'hover:text-white hover:fill-white hover:stroke-white',
  'focus:bg-theme/50 hover:bg-theme/50 data-[popup-open]:bg-theme/50'
)

export const APP_ACCENT_MENU_CLS = cn(
  BASE_THEME_MENU_CLS,
  'focus:bg-app-theme/30 hover:bg-app-theme/30 data-[popup-open]:bg-app-theme/30'
)

export const DROPDOWN_MENU_ICON_CONTAINER_CLS =
  'w-7 aspect-square flex flex-row items-center shrink-0 grow-0 justify-center'

const LINK_CLS = cn(
  FOCUS_RING_CLS,
  'text-app-theme underline-offset-4 hover:underline'
)

const RED_LINK_CLS = cn(
  FOCUS_RING_CLS,
  'text-destructive underline-offset-4 hover:underline'
)

export const RIPPLE_CLS =
  'pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 w-4 h-4'

export const buttonVariants = cva(BASE_BUTTON_CLS, {
  variants: {
    variant: {
      none: '',
      primary: CORE_PRIMARY_BUTTON_CLS,
      theme: CORE_THEME_BUTTON_CLS,
      'app-theme': CORE_APP_ACCENT_BUTTON_CLS,
      destructive: DESTRUCTIVE_CLS,
      trans: 'hover:bg-white/20 data-[checked=true]:bg-white/20',
      secondary: BASE_SECONDARY_CLS,
      //alt: BASE_ALT_CLS,
      //ghost: BASE_GHOST_CLS,
      //ios: BASE_IOS_CLS,
      input: BASE_OUTLINE_CLS,
      flat: BASE_FLAT_BUTTON_CLS,
      'flat-alt': BASE_FLAT_ALT_BUTTON_CLS,
      'muted-light': BASE_MUTED_LIGHT_CLS,
      'theme-muted': THEME_MUTED_CLS,
      //accent: BASE_ACCENT_CLS,
      side: 'hover:bg-background',
      menu: BASE_MENU_CLS,
      link: LINK_CLS,
      'red-link': RED_LINK_CLS,
      footer: 'hover:bg-primary/20 data-[checked=true]:bg-primary/20',
    },
    flow: {
      row: 'flex row',
      column: 'flex flex-col',
    },
    font: {
      none: '',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    aspect: {
      auto: 'aspect-auto',
      icon: 'aspect-square',
    },
    rounded: {
      none: '',
      theme: 'rounded-theme',
      xs: 'rounded-xs',
      sm: 'rounded-xs',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full ',
      menu: 'rounded-menu',
    },
    ring: {
      'offset-1': 'ring-offset-1',
      'offset-2': 'ring-offset-2',
      inset: 'ring-inset',
    },
    items: {
      center: 'items-center',
      start: 'items-start',
      end: 'items-end',
    },
    justify: {
      center: 'justify-center',
      start: 'justify-start',
      end: 'justify-end',
    },
    size: {
      xs: BUTTON_XS_H_CLS,
      //sm: BUTTON_SM_H_CLS,
      md: 'h-button-md',
      toolbar: 'h-toolbar-button',
      'toolbar-dropdown': TOOLBAR_DROPDOWN_BUTTON_CLS,
      //'toolbar-icon': cn(TOOLBAR_BUTTON_W_CLS, TOOLBAR_BUTTON_H_CLS),
      lg: 'h-button-lg',
      xl: BUTTON_XL_H_CLS,
      '2xl': BUTTON_XL_H_CLS,
      icon: cn(ICON_BUTTON_CLS, 'justify-center'),
      'icon-lg': cn(
        BASE_ICON_BUTTON_CLS,
        CENTERED_ROW_CLS,
        LARGE_ICON_BUTTON_CLS
      ),

      'icon-sm': SM_ICON_BUTTON_CLS,
      //'icon-xs': XS_ICON_BUTTON_CLS,
      dropdown: DROPDOWN_BUTTON_CLS,
      'dropdown-with-icon': DROPDOWN_WITH_ICON_BUTTON_CLS,
      // header: 'h-header',
      none: '',
    },
    pad: {
      none: '',
      md: 'px-3',
      lg: 'px-4',
      xl: 'px-5',
      sm: 'px-2',
      xs: 'px-1',
    },
    gap: {
      none: '',
      default: 'gap-2',
      sm: 'gap-1',
      xs: 'gap-0.5',
    },
    animation: {
      default: TRANS_COLOR_CLS,
      color: TRANS_COLOR_CLS,
      none: '',
    },
  },
  defaultVariants: {
    variant: 'theme',
    justify: 'center',
    items: 'center',
    flow: 'row',
    gap: 'sm',
    size: 'md',
    font: 'none',
    ring: 'offset-1',
    rounded: 'theme',
    pad: 'md',
    animation: 'default',
    aspect: 'auto',
  },
})

export type ButtonState = 'active' | 'inactive'

// export interface IButtonVariantProps {
//   variant?: string
//   size?: string
//   rounded?: string
//   ring?: string
//   font?: string
//   pad?: string
//   gap?: string
//   justify?: string
//   items?: string
//   animation?: string
//   multiProps?: string
// }

export interface IExtButtonProps
  extends
    ComponentProps<'button'>,
    VariantProps<typeof buttonVariants>,
    ITooltipSide {
  checked?: boolean
  open?: boolean
  ripple?: boolean
}

export type IButtonProps = ButtonProps & IExtButtonProps

export function Button({
  size,
  rounded,
  ring,
  font,
  pad,
  gap,
  justify,
  flow,
  items,
  aspect,
  animation,
  variant = 'flat',
  checked = false,
  open = false,
  ripple = false,
  disabled = false,
  'aria-label': ariaLabel,
  tooltipSide = 'bottom',
  onMouseUp,
  onMouseDown,
  onMouseLeave,
  title,
  ref,
  className,
  children,
  ...props
}: IButtonProps) {
  if (!ariaLabel) {
    ariaLabel = title
  }

  const rippleRef = useRef<HTMLSpanElement>(null)
  const [clickProps, setClickProps] = useState<IPos>({ x: -1, y: -1 })

  useEffect(() => {
    if (clickProps.x === -1 || clickProps.y === -1) {
      return
    }

    if (clickProps.x !== -1) {
      gsap.fromTo(
        rippleRef.current,
        {
          scale: 1,
          opacity: 0.8,
        },
        {
          scale: 12,
          opacity: 0,
          duration: 2,
          ease: 'power2.out',
        }
      )
    }
    // Trigger an animation on click
    // animate(
    //   scope.current,
    //   {
    //     transform: ['scale(1)', 'scale(8)'], // Scale up then back down
    //     opacity: [0.9, 0], // Rotate 360 degrees
    //   },
    //   {
    //     duration: 1, // Animation duration (in seconds)
    //     ease: 'easeInOut', // Easing for a smooth effect
    //   }
    // )
  }, [clickProps.x, clickProps.y])

  function _onMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
    //setClickProps({ x: -1, y: -1 })

    onMouseUp?.(e)
  }

  function _onMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
    if (ripple) {
      setClickProps({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
    }

    onMouseDown?.(e)
  }

  function _onMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    //setClickProps({ x: -1, y: -1 })
    onMouseLeave?.(e)
  }

  return (
    <ButtonPrimitive
      // className={buttonVariants({
      //   variant,
      //   size,
      //   rounded,
      //   ring,
      //   font,
      //   pad,
      //   gap,
      //   justify,
      //   items,
      //   animation,
      //   className: cn("relative", className),
      // })}
      className={buttonVariants({
        variant,
        size,
        rounded,
        ring,
        font,
        gap,
        flow,
        justify,
        pad,
        aspect,
        items,
        animation,
        className: cn('relative text-nowrap group shrink-0', className),
      })}
      ref={ref}
      data-checked={checked}
      data-state={open ? 'open' : 'closed'}
      disabled={disabled}
      onMouseDown={_onMouseDown}
      onMouseUp={_onMouseUp}
      onMouseLeave={_onMouseLeave}
      title={title}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
      {ripple && (
        <span
          ref={rippleRef}
          className={RIPPLE_CLS}
          style={{ left: clickProps.x, top: clickProps.y }}
        />
      )}
    </ButtonPrimitive>
  )
}
