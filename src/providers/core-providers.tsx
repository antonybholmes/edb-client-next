//'use client'

import { EdbAuthProvider } from '@/lib/edb/edb-auth-provider'
import { QCP } from '@/query'
import { AlertsProvider } from '@components/alerts/alerts-provider'
import type { IChildrenProps } from '@interfaces/children-props'
import { EdbSettingsProvider } from '../lib/edb/edb-settings-provider'
import { AuthProvider } from './auth-provider'
import { HistoryProvider } from './history-provider'

interface IProps extends IChildrenProps {
  cacheSession?: boolean
}

export function CoreProviders({ cacheSession = true, children }: IProps) {
  // Add other providers nested here as needed
  return (
    <QCP>
      <EdbSettingsProvider>
        <AuthProvider>
          <EdbAuthProvider cacheSession={cacheSession}>
            <HistoryProvider>
              <AlertsProvider>{children}</AlertsProvider>
            </HistoryProvider>
          </EdbAuthProvider>
        </AuthProvider>
      </EdbSettingsProvider>
    </QCP>
  )
}
