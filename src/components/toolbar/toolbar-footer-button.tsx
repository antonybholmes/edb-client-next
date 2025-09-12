import { cn } from '@lib/shadcn-utils'
import { Button, type IButtonProps } from '@themed/button'

export function ToolbarFooterButton({
  ref,
  variant = 'muted',
  size = 'xs',
  rounded: rounding = 'none',
  className,
  children,
  ...props
}: IButtonProps) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      rounded={rounding}
      ripple={false}
      className={cn('gap-x-2', className)}
      {...props}
    >
      {children}
    </Button>
  )
}
