import { type IDivProps } from '@interfaces/div-props'
import { BaseRow } from '@layout/base-row'
import { cn } from '@lib/shadcn-utils'

const CLS =
  'shrink-0 gap-x-1 text-xs bg-muted/25 grow p-1.5 rounded-lg dark:shadow-none justify-between items-end'

export function ToolbarTabPanel({
  ref,
  children,
  className,
  ...props
}: IDivProps) {
  return (
    <BaseRow ref={ref} className={cn(CLS, className)} {...props}>
      {children}
    </BaseRow>
  )
}
