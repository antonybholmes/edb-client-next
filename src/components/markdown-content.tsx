import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'

export const MarkdownContent = forwardRef(function MarkdownContent(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <main ref={ref} className={cn('markdown', className)} {...props}>
      {children}
    </main>
  )
})
