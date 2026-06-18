import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

export const TOOLBAR_COL_CLS = `flex justify-start 
  group-data-[ribbon=classic]:flex-col group-data-[ribbon=classic]:items-start
  group-data-[ribbon=classic]:gap-y-0.5
  group-data-[ribbon=single]:flex-row group-data-[ribbon=single]:items-center`

/**
 * Shows content in a column layout if ribbon is in classic mode, and row layout if ribbon is in single mode.
 * This is used in the toolbar to layout buttons in a column or row depending on the ribbon style.
 * The parent toolbar should have a data attribute `data-ribbon` set to either `classic` or `single` for this to work.
 *
 * @param param0
 * @returns
 */
export function ToolbarCol({
  ref,
  className,
  gap = 'gap-x-0.5',
  children,
  ...props
}: IDivProps & { gap?: string }) {
  return (
    <div ref={ref} className={cn(TOOLBAR_COL_CLS, gap, className)} {...props}>
      {children}
    </div>
  )
}
