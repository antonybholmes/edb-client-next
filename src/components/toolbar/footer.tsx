import { cn } from '@/lib/shadcn-utils'

import type { IChildrenProps } from '@/interfaces/children-props'
import { CENTERED_ROW_CLS } from '@/theme'
import { VCenterRow } from '../layout/v-center-row'

export const TOOLBAR_FOOTER_CLS = cn(
  CENTERED_ROW_CLS,
  'px-2 h-7 text-xs text-alt-foreground overflow-hidden',
  'justify-between grid grid-cols-4 shrink-0 w-full bg-body',
  'border-t border-transparent hover:border-border/70 trans-color'
)

export function Footer({ className }: IChildrenProps) {
  return (
    <footer className={cn(TOOLBAR_FOOTER_CLS, className)} id="footer">
      <VCenterRow id="footer-left" />
      <VCenterRow id="footer-center" className="justify-center col-span-2" />
      <VCenterRow id="footer-right" className="justify-end" />
    </footer>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
