import { Button, type IButtonProps } from '@/themed/v2/button'

export function LinkButton({
  ref,
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
      ref={ref}
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
