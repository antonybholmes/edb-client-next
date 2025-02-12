import { cn } from '@lib/class-names'

import type { IDivProps } from '@interfaces/div-props'
import { Children, forwardRef, type ForwardedRef } from 'react'

export const ContentDiv = forwardRef(function ContentDiv(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const c = Children.toArray(children)

  if (c.length === 0) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-1 xl:grid-cols-8 2xl:grid-cols-4 px-2 min-h-0',
        className
      )}
      {...props}
    >
      <div>{c.length > 1 && c[0]}</div>
      <div className="col-span-1 xl:col-span-6 2xl:col-span-2 min-h-0">
        {c.length > 1 ? c[1] : c[0]}
      </div>
      <div>{c.length > 2 && c[2]}</div>
    </div>
  )
})
