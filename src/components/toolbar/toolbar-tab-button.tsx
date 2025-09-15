import { type IButtonProps } from '@themed/button'

import { forwardRef, type ForwardedRef } from 'react'
import { SimpleTooltip } from '../shadcn/ui/themed/tooltip'
import { ToolbarButton } from './toolbar-button'

export const ToolbarTabButton = forwardRef(function ToolbarTabButton(
  { role = 'tab', tooltip, className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const button = (
    <ToolbarButton
      ref={ref}
      className={className}
      role={role}
      size="sm"
      // ripple={false}
      {...props}
    >
      {children}
    </ToolbarButton>
  )

  if (tooltip) {
    return <SimpleTooltip content={tooltip}>{button}</SimpleTooltip>
  } else {
    return button
  }
})
