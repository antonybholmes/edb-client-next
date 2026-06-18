import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

export const CENTERED_ROW_CLS = 'flex flex-row items-center justify-center grow'

export function CenterRow({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn(CENTERED_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
}
