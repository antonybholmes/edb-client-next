import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export const CENTERED_COL_CLS = 'flex flex-col items-center justify-center grow'

export function CenterCol({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn(CENTERED_COL_CLS, className)} {...props}>
      {children}
    </div>
  )
}
