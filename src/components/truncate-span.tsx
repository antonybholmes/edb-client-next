import { cn } from '@/lib/shadcn-utils'
import { type ComponentProps } from 'react'

/**
 *  A span that truncates its content with an ellipsis if it overflows.
 *  It uses an absolutely positioned child span to work consistently.
 *
 * @param param0
 * @returns
 */
export function TruncateSpan({
  className,
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span className={cn('overflow-hidden relative', className)} {...props}>
      <span className="absolute -translate-y-1/2 top-1/2 left-0 right-0 truncate">
        {children}
      </span>
    </span>
  )
}
