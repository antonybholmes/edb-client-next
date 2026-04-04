import { Button, type IButtonProps } from '@/themed/v2/button'
import { forwardRef, type ForwardedRef } from 'react'

export const LinkButton = forwardRef(function LinkButton(
  {
    variant = 'link',

    size = 'none',
    justify = 'start',
    pad = 'none',
    className = '',
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
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
})
