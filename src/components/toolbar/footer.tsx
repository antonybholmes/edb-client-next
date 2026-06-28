import { cn } from '@/lib/shadcn-utils'

import type { IChildrenProps } from '@/interfaces/children-props'
import { useFooter } from '@/providers/footer-provider'
import { CENTERED_ROW_CLS } from '@/theme'
import { VCenterRow } from '../layout/v-center-row'
import { renderTab } from '../tabs/tab-provider'

export const TOOLBAR_FOOTER_CLS = cn(
  CENTERED_ROW_CLS,
  'px-2 h-7 text-xs text-alt-foreground overflow-hidden',
  'justify-between grid grid-cols-4 shrink-0 w-full bg-body',
  'border-t border-transparent hover:border-border/70 trans-color'
)

export function Footer({ className }: IChildrenProps) {
  const { left, center, right } = useFooter()

  return (
    <footer className={cn(TOOLBAR_FOOTER_CLS, className)} id="footer">
      <VCenterRow id="footer-left">{left && renderTab(left)}</VCenterRow>
      <VCenterRow id="footer-center" className="justify-center col-span-2">
        {center && renderTab(center)}
      </VCenterRow>
      <VCenterRow id="footer-right" className="justify-end">
        {right && renderTab(right)}
      </VCenterRow>
    </footer>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
