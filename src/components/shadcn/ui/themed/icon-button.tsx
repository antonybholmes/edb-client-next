import { Button, type IButtonProps } from '@themed/button'

export function IconButton({
  ref,
  variant = 'muted',
  size = 'icon',
  aspect = 'icon',
  pad = 'none',
  className,
  children,
  ...props
}: IButtonProps) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      pad={pad}
      // ripple={ripple}
      aspect={aspect}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}
