import { Button, type IButtonProps } from '@themed/button'

export function DropDownButton({
  ref,
  variant = 'muted',
  ripple = false,
  size = 'dropdown',
  rounded = 'theme',
  className,
  children,
  ...props
}: IButtonProps) {
  return (
    <Button
      ref={ref}
      variant={variant}
      ripple={ripple}
      size={size}
      rounded={rounded}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}
