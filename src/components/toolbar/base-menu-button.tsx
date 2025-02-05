import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'

import { Children, forwardRef, type ForwardedRef } from 'react'

export const BaseMenuButton = forwardRef(function BaseMenuButton(
  {
    variant = 'muted',
    size = 'xxl',
    className,
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const c = Children.toArray(children)

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      pad="default"
      className={cn('grow gap-x-4 whitespace-nowrap text-left', className)}
      style={{ justifyContent: 'start' }}
      {...props}
    >
      <span className="w-8 shrink-0">{c.length > 1 && c[0]}</span>

      {c[c.length - 1]}

      <span className="w-8 shrink-0" />
    </Button>
  )
})
