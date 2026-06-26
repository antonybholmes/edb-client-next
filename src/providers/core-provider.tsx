//'use client'

//import { IS_DEV_MODE } from '@/consts'
import { HistoryProvider } from '@/components/pages/apps/matcalc/history/history-provider/history-provider'
import {
    StackedToasts,
    Provider as ToastProvider,
} from '@/components/shadcn/ui/themed/v2/toast'
import { TabProvider } from '@/components/tabs/tab-provider'
import type { IChildrenProps } from '@/interfaces/children-props'
import { AppInfoProvider } from '@/lib/edb/edb-settings'
import { QCP } from '@/qcp'
import { FooterProvider } from './footer-provider'

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
      <AppInfoProvider>
        <HistoryProvider>
          <TabProvider>
            <FooterProvider>
              <ToastProvider>
                <StackedToasts />
                {children}
              </ToastProvider>
            </FooterProvider>
          </TabProvider>
          {/* </ZoomProvider> */}

          {/* </SelectionRangeProvider> */}
        </HistoryProvider>
      </AppInfoProvider>
      {/* </ClerkProvider> */}
      {/* </EdbAuthProvider> */}
      {/* </SelectionRangeProvider> 
      {/* {/* </HistoryProvider> */}
      {/* </ClerkProvider> */}
      {/* </EdbAuthProvider> */}
      {/* </AuthProvider> */}
      {/* </EdbSettingsProvider> */}
    </QCP>
  )
}
