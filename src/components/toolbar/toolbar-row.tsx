import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { VCenterRow } from '../layout/v-center-row'

export const TOOLBAR_ROW_CLS = 'h-toolbar-button shrink-0'

/**
 * Shows vertically centered content in a row layout. This is used for rows of
 * buttons in the toolbar.
 * The parent toolbar should have a data attribute `data-ribbon` set to either `classic` or `single`
 * for this to work. The height is fixed so UI controls of different sizes can be aligned properly.
 *
 * @param param0
 * @returns
 */
export function ToolbarRow({
  ref,
  className,
  gap = 'gap-x-0.5',
  children,
  ...props
}: IDivProps & { gap?: string }) {
  //const { settings } = useEdbSettings()
  //const ribbon = settings.toolbars.ribbon.style

  // if (ribbon === 'single') {
  //   return children
  // }

  return (
    <VCenterRow className={cn(TOOLBAR_ROW_CLS, gap, className)} {...props}>
      {children}
    </VCenterRow>
  )
}
