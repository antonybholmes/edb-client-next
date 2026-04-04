'use client'

import {
  StackedToasts,
  Provider as ToastProvider,
} from '@/components/shadcn/ui/themed/v2/toast'
import type { IChildrenProps } from '@/interfaces/children-props'
import { QCP } from '@/qcp'

export function CoreProviders({ children }: IChildrenProps) {
  // Add other providers nested here as needed
  return (
    <QCP>
      {/* <EdbSettingsProvider> */}
      {/* <AuthProvider> */}
      {/* <EdbAuthProvider cacheSession={cacheSession}> */}

      {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/"> */}
      {/* <HistoryProvider> */}
      {/* <SelectionRangeProvider>*/}

      <ToastProvider>
        <StackedToasts />
        {children}
      </ToastProvider>

      {/* </SelectionRangeProvider> */}
      {/* </HistoryProvider> */}
      {/* </ClerkProvider> */}
      {/* </EdbAuthProvider> */}
      {/* </SelectionRangeProvider> */}
      {/* </HistoryProvider> */}
      {/* </ClerkProvider> */}
      {/* </EdbAuthProvider> */}
      {/* </AuthProvider> */}
      {/* </EdbSettingsProvider> */}
    </QCP>
  )
}
