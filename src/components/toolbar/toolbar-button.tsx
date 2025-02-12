import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'

import { forwardRef, type ForwardedRef } from 'react'

export const ToolbarButton = forwardRef(function ToolbarButton(
  { ripple = false, size = 'lg', className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      ref={ref}
      multiProps="toolbar"
      size={size}
      className={className}
      ripple={ripple}
      {...props}
    >
      {children}
    </Button>
  )
})
