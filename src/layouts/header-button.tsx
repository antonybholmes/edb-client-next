import { Button, type IButtonProps } from '@/themed/v2/button'

export function HeaderButton({
  ref,

  size = 'lg',
  //rounded = 'none',

  className = '',
  children,
  ...props
}: IButtonProps) {
  return (
    <Button
      ref={ref}
      size={size}
      //rounded={rounded}
      // ripple={ripple}

      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}
