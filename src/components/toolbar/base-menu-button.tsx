import { cn } from '@lib/shadcn-utils'
import { Button, type IButtonProps } from '@themed/button'

import { Children } from 'react'

export function BaseMenuButton({
  variant = 'muted',
  size = '2xl',
  ref,
  className,
  children,
  ...props
}: IButtonProps) {
  const c = Children.toArray(children)

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn('grow gap-x-4 whitespace-nowrap text-left', className)}
      style={{ justifyContent: 'start' }}
      {...props}
    >
      <span className="w-8 shrink-0">{c.length > 1 && c[0]}</span>

      {c[c.length - 1]}

      <span className="w-8 shrink-0" />
    </Button>
  )
}
