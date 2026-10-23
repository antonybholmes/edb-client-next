import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { VCenterRow } from '../layout/v-center-row'
import { TOOLBAR_ROW_CLS } from './toolbar-row'

/**
 * A button row for the classic toolbar layout.
 *
 * @param param0
 * @returns
 */
export function ToolbarClassicRow({
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
        'hidden group-data-[ribbon=classic]:flex',
        className
      )}
      {...props}
    >
      {children}
    </VCenterRow>
  )
}
