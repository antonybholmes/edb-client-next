import { cn } from '@lib/shadcn-utils'
import { type IButtonProps } from '@themed/button'

import { BaseMenuButton } from './base-menu-button'

export function MenuButton({
  ref,
  className,
  children,
  ...props
}: IButtonProps) {
  return (
    <BaseMenuButton
      ref={ref}
      size="2xl"
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </BaseMenuButton>
  )
}
