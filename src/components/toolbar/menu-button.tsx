import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'

import { forwardRef, type ForwardedRef } from 'react'
import { BaseMenuButton } from './base-menu-button'

export const MenuButton = forwardRef(function MenuButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <BaseMenuButton
      ref={ref}
      size="xxl"
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </BaseMenuButton>
  )
})
