import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'

export const ToolbarFooterButton = forwardRef(function ToolbarButton(
  {
    variant = 'accent',
    size = 'sm',
    pad: padding = 'none',
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
    <Button
      ref={ref}
      variant={variant}
      size={size}
      pad={padding}
      rounded={rounding}
      ripple={false}
      className={cn('gap-x-2', className)}
      {...props}
    >
      {children}
    </Button>
  )
})
