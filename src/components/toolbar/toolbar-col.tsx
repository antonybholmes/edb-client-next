import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

export function ToolbarCol({ ref, className, children, ...props }: IDivProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex group-data-[ribbon=classic]:flex-col group-data-[ribbon=single]:flex-row items-start justify-start gap-y-0.5 gap-x-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
