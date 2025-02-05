import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'

import { forwardRef, type ForwardedRef } from 'react'

export const ModuleInfoButton = forwardRef(function ModuleInfoButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      ref={ref}
      variant="header"
      rounded="none"
      size="none"
      //pad="lg"
      ripple={false}
      className={cn('h-11 gap-x-2 text-sm font-semibold truncate', className)}
      {...props}
    >
      {children}
    </Button>
  )
})
