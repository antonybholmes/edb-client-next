//'use client'

//import { IS_DEV_MODE } from '@/consts'
import {
  StackedToasts,
  Provider as ToastProvider,
} from '@/components/shadcn/ui/themed/v2/toast'
import type { IChildrenProps } from '@/interfaces/children-props'
import { QCP } from '@/qcp'

//const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

/**
 * These providers are used across the app by most components.
 * If there are providers that are only used in specific parts of the app,
 * they should be added to those parts instead to avoid unnecessary re-renders.
 *
 * @param param0
 * @returns
 */
export function CoreProviders({ children }: IChildrenProps) {
  // Add other providers nested here as needed

  // if (IS_DEV_MODE) {
  //   children = (
  //     <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
  //       {children}
  //     </ClerkProvider>
  //   )
  // }

  return (
    <QCP>
      {/* <EdbSettingsProvider> */}
      {/* <AuthProvider> */}
      {/* <EdbAuthProvider cacheSession={cacheSession}> */}

      {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/"> */}
      {/* <HistoryProvider> */}
      {/* <SelectionRangeProvider>*/}

      {/* <ZoomProvider> */}

      <ToastProvider>
        <StackedToasts />
        {children}
      </ToastProvider>
      {/* </ZoomProvider> */}

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
