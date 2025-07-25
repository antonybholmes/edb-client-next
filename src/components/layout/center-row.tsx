import { CENTERED_ROW_CLS } from '@/theme'
import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export function CenterRow({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn(CENTERED_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
}
