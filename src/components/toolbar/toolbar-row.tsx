import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { VCenterRow } from '../layout/v-center-row'

export const TOOLBAR_ROW_CLS = 'min-h-toolbar-button shrink-0'

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
  title,
  smallTitle,
  titleCls,
  className,
  gap = 'gap-x-1',
  children,
  ...props
}: IDivProps & {
  title?: string
  smallTitle?: string
  gap?: string
  titleCls?: string
}) {
  if (!smallTitle) {
    smallTitle = title
  }

  return (
    <VCenterRow className={cn(TOOLBAR_ROW_CLS, gap, className)} {...props}>
      {title && (
        <span className={cn('group-data-[ribbon=single]:hidden', titleCls)}>
          {title}
        </span>
      )}

      {smallTitle && (
        <span className={'hidden group-data-[ribbon=single]:inline-flex'}>
          {smallTitle}
        </span>
      )}

      {children}
    </VCenterRow>
  )
}
