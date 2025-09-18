//// 'use client'

import { QCP } from '@/qcp'
import type { IChildrenProps } from '@interfaces/children-props'
import { ZoomProvider } from './zoom-provider'

//const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY

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

      <ZoomProvider>{children}</ZoomProvider>

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
