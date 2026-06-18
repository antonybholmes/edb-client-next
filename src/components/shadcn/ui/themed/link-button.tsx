import { Button, type IButtonProps } from '@/themed/v2/button'

export function LinkButton({
  variant = 'link',
  size = 'none',
  justify = 'start',
  pad = 'none',
  className = '',
  children,
  ...props
}: IButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      justify={justify}
      pad={pad}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}
