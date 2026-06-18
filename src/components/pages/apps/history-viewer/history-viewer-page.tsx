'use client'

import { HeaderLayout } from '@/layouts/header-layout'
import { CoreProviders } from '@/providers/core-providers'
import { HistoryDevPanel } from '../matcalc/history/history-dev-panel'

export function HistoryViewerPage() {
  return (
    <>
      <HeaderLayout showHeader={false}>
        {/* <Toolbar tabs={tabs}>
          <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                show={showSideBar}
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar> */}

        <HistoryDevPanel />
      </HeaderLayout>
    </>
  )
}

export function HistoryViewerQueryPage() {
  return (
    <CoreProviders>
      <HistoryViewerPage />
    </CoreProviders>
  )
}
