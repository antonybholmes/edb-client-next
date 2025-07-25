import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export function BaseCol({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {children}
    </div>
  )
}
