'use client'

import { ICON_CLS } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { CenterRow } from '../layout/center-row'

export function PowerIcon({ n }: { n: number | string }) {
  return (
    <CenterRow className={cn(ICON_CLS, 'text-base')}>
      <span>&#x1D465;</span>
      <sup className="italic" style={{ fontFamily: 'serif' }}>
        {n}
      </sup>
    </CenterRow>
  )
}
