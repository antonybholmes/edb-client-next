import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { VCenterRow } from '../layout/v-center-row'
import { TOOLBAR_ROW_CLS } from './toolbar-row'

/**
 * Shows vertically centered content in a row layout. This is used for rows of
 * buttons in the toolbar.
 * The parent toolbar should have a data attribute `data-ribbon` set to either `classic` or `single`
 * for this to work. The height is fixed so UI controls of different sizes can be aligned properly.
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
