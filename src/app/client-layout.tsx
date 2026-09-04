'use client'

import { ThemeProvider } from '@/components/edb/theme'
import { BaseCol } from '@/components/layout/base-col'
import { IChildrenProps } from '@/interfaces/children-props'
import { CoreProviders } from '@/providers/core-providers'
import { TooltipRenderer } from '@/providers/tooltip-provider'

// client-only wrapper so the root layout can stay a server component
export function ClientLayout({ children }: IChildrenProps) {
  return (
    <>
      <ThemeProvider>
        <CoreProviders>
          <BaseCol className="root isolate grow">{children}</BaseCol>
        </CoreProviders>
      </ThemeProvider>
      <TooltipRenderer />
    </>
  )
}
