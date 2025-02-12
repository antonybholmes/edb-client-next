import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'
import { forwardRef, type ForwardedRef } from 'react'

export const IconButton = forwardRef(function IconButton(
  {
    variant = 'accent',
    multiProps = 'icon',
    ripple = false,
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
      multiProps={multiProps}
      ripple={ripple}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
})
