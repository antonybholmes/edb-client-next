import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'
import { ToolbarButton } from './toolbar-button'

export const ToolbarDropdownButton = forwardRef(function ToolbarDropdownButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <ToolbarButton ref={ref} className={cn('gap-x-2', className)} {...props}>
      {children}

      <ChevronRightIcon
        className="rotate-90"
        stroke="stroke-foreground stroke-2"
      />
    </ToolbarButton>
  )
})
