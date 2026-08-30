'use client'

import { HeaderLayout } from '@/layouts/header-layout'
import { ClientLayout } from '@/app/client-layout'
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
    <ClientLayout>
      <HistoryViewerPage />
    </ClientLayout>
  )
}
