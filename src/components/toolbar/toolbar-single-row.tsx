import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { VCenterRow } from '../layout/v-center-row'
import { TOOLBAR_ROW_CLS } from './toolbar-row'

/**
 * A button row for the single toolbar layout.
 *
 * @param param0
 * @returns
 */
export function ToolbarSingleRow({
  ref,

  className,

  children,
  ...props
}: IDivProps & {
  gap?: string
}) {
  return (
    <VCenterRow
      className={cn(
        TOOLBAR_ROW_CLS,
        'group-data-[ribbon=classic]:hidden',
        className
      )}
      {...props}
    >
      {children}
    </VCenterRow>
  )
}
