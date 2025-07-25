import { cn } from '@lib/shadcn-utils'

import type { IDivProps } from '@interfaces/div-props'
import { Children } from 'react'
import { HCenterRow } from './h-center-row'

export function ContentDiv({ ref, className, children, ...props }: IDivProps) {
  const c = Children.toArray(children)

  if (c.length === 0) {
    return null
  }

  return (
    <HCenterRow
      ref={ref}
      className={cn('px-2 min-h-0 grow', className)}
      {...props}
    >
      {c.length > 1 && <div>{c[0]}</div>}
      <div className="w-9/10 lg:w-3/5 min-h-0">
        {c.length > 1 ? c[1] : c[0]}
      </div>
      {c.length > 1 && <div>{c.length > 2 && c[2]}</div>}
    </HCenterRow>
  )
}
