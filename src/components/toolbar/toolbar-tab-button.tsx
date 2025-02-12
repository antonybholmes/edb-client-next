import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'

import { Tooltip } from '@components/tooltip'
import { forwardRef, type ForwardedRef } from 'react'

export const ToolbarTabButton = forwardRef(function ToolbarTabButton(
  { role = 'tab', tooltip, className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const button = (
    <Button
      multiProps="toolbar-tab"
      ref={ref}
      className={className}
      role={role}
      ripple={false}
      {...props}
    >
      {children}
    </Button>
  )

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>
  } else {
    return button
  }
})
