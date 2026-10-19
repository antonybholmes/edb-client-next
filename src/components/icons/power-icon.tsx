'use client'

import { ICON_CLS } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { CenterRow } from '../layout/center-row'

export function PowerIcon({
  n,
  fontSize = 14,
}: {
  n: number | string
  fontSize?: number
}) {
  const isLetter = /[a-zA-Z]/.test(n.toString())

  return (
    <CenterRow className={cn(ICON_CLS, 'text-base')} style={{ fontSize }}>
      <span>&#x1D465;</span>
      <sup
        className={cn({ italic: isLetter })}
        style={{ fontFamily: 'serif', fontSize: fontSize * 0.75 }}
      >
        {n}
      </sup>
    </CenterRow>
  )
}
