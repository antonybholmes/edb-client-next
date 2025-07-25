import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export function BaseGrid({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn('grid', className)} {...props}>
      {children}
    </div>
  )
}
