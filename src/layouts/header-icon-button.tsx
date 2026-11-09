import { Button, type IButtonProps } from '@/themed/baseui/button'

export function HeaderIconButton({
  ref,
  size = 'header',
  rounded = 'none',
  aspect = 'icon',
  pad = 'none',
  className = '',
  children,
  ...props
}: IButtonProps) {
  return (
    <Button
      ref={ref}
      size={size}
      rounded={rounded}
      aspect={aspect}
      // ripple={ripple}
      pad={pad}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}
