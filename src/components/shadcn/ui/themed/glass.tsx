import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export const BASE_GLASS_CLS = 'backdrop-blur-lg'
// export const GLASS_CLS = cn(
//   'shadow-glass dark:shadow-dark-glass',
//   BASE_GLASS_CLS
// )

export const GLASS_CLS = cn(
  'bg-gray-100/50 dark:bg-gray-800/50',
  BASE_GLASS_CLS
)

export function Glass({ ref, className, children, ...props }: IDivProps) {
  return (
    <div ref={ref} className={cn(GLASS_CLS, className)} {...props}>
      {children}
    </div>
  )
}
