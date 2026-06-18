import { cn } from '@/lib/shadcn-utils'
import { Button, type IButtonProps } from '@/themed/v2/button'

export function ToolbarFooterButton({
  ref,
  variant = 'flat',
  size = 'xs',
  rounded = 'sm',
  pad = 'none',
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
      rounded={rounded}
      pad={pad}
      className={cn('gap-x-2', className)}
      {...props}
    >
      {children}
    </Button>
  )
}
