import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export const STRETCH_ROW_CLS = 'flex flex-row items-stretch'

export function StretchRow({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn(STRETCH_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
}
