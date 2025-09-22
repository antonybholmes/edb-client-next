import { Button, type IButtonProps } from '@themed/button'
import { forwardRef, type ForwardedRef } from 'react'

export const LinkButton = forwardRef(function LinkButton(
  {
    variant = 'link',

    size = 'none',
    justify = 'start',
    className,
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
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
})
