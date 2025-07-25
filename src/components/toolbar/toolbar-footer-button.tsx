import { cn } from '@lib/shadcn-utils'
import { type IButtonProps } from '@themed/button'
import { forwardRef, type ForwardedRef } from 'react'
import { IconButton } from '../shadcn/ui/themed/icon-button'

export const ToolbarFooterButton = forwardRef(function ToolbarButton(
  {
    variant = 'muted',
    size = 'icon-sm',
    rounded: rounding = 'none',
    className,
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <IconButton
      ref={ref}
      variant={variant}
      size={size}
      rounded={rounding}
      ripple={false}
      className={cn('gap-x-2', className)}
      {...props}
    >
      {children}
    </IconButton>
  )
})
