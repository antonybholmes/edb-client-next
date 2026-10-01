import type { IDivProps } from '@/interfaces/div-props'
import { BaseCol } from '@/layout/base-col'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

export function PropsPanel({
  ref,
  className,
  margin = 'pr-1 pb-2',
  children,
  ...props
}: IDivProps & { margin?: string }) {
  return (
    <BaseCol
      //id={randId('props-panel')}
      ref={ref}
      className={cn(
        'min-h-0 overflow-hidden text-xs grow h-full',
        margin,
        className
      )}
      {...props}
    >
      {children}
    </BaseCol>
  )
}
