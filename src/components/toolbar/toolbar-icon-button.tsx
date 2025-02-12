import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { forwardRef, type ForwardedRef } from 'react'
import { ToolbarButton } from './toolbar-button'

export const ToolbarIconButton = forwardRef(function ToolbarIconButton(
  {
    variant = 'toolbar',
    size = 'icon-lg',
    pad = 'none',
    className,
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <ToolbarButton
      ref={ref}
      variant={variant}
      size={size}
      pad={pad}
      className={className}
      {...props}
    >
      {children}
    </ToolbarButton>
  )
})
