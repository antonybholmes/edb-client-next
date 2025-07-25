import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export const BETWEEN_ROW_CLS =
  'flex flex-row items-center justify-between gap-x-2'

export function BetweenRow({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn(BETWEEN_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
}
