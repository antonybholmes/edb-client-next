import { cn } from '@lib/shadcn-utils'

import { BUTTON_XS_H_CLS, CENTERED_ROW_CLS } from '@/theme'
import type { IChildrenProps } from '@interfaces/children-props'
import { VCenterRow } from '../layout/v-center-row'

export const TOOLBAR_FOOTER_CLS = cn(
  CENTERED_ROW_CLS,
  BUTTON_XS_H_CLS,
  'px-2 text-xs text-alt-foreground overflow-hidden justify-between grid grid-cols-4 shrink-0 w-full bg-body border-t border-transparent hover:border-border/75 trans-color'
)

export function ToolbarFooter({ className }: IChildrenProps) {
  return (
    <footer className={cn(TOOLBAR_FOOTER_CLS, className)} id="toolbar-footer">
      <VCenterRow id="toolbar-footer-left" />
      <VCenterRow
        id="toolbar-footer-center"
        className="justify-center col-span-2"
      />
      <VCenterRow id="toolbar-footer-right" className="justify-end" />
    </footer>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
