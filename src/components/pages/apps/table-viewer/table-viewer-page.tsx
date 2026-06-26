'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'

import { FileIcon } from '@/icons/file-icon'
import {
  AnnotationDataFrame,
  type ISharedAnnotationDataFrame,
} from '@/lib/dataframe/annotation-dataframe'
import { DataFrame } from '@/lib/dataframe/dataframe'
import { friendlyFilename } from '@/lib/path'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import type { ITab } from '@/components/tabs/tab-provider'

import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { CoreProviders } from '@/providers/core-provider'
import { HistoryPanel } from '../matcalc/history/history-panel'

import { BaseCol } from '@/components/layout/base-col'

import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-provider'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { formatString } from '@/lib/text/format-string'
import { useCurrentSheets } from '../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home-toolbar'

export function TableViewerPage() {
  const { openFile } = useHistory()
  const { setAppInfo } = useAppInfo()

  const { sheets } = useCurrentSheets()

  const [showSideBar, setShowSideBar] = useState(false)

  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  useEffect(() => {
    setSideTabs([
      {
        id: 'History',
        component: HistoryPanel,
      },
    ])
  }, [setSideTabs])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const key = urlParams.get('key')

    if (key) {
      const sharedData = localStorage.getItem(key)
      if (sharedData) {
        const parsedData: ISharedAnnotationDataFrame = JSON.parse(sharedData)

        const rowObs = new DataFrame({
          data: parsedData.rowObs.data,
          columns: parsedData.rowObs.columns,
        })

        const colVars = new DataFrame({
          data: parsedData.colVars.data,
          columns: parsedData.colVars.columns,
        })

        const df = new AnnotationDataFrame({
          name: parsedData.name,
          data: parsedData.data,
          rowObs,
          colVars,
        })

        openFile(df.name, { sheets: [df] })

        // customize page title
        document.title = `${df.name} - Table Viewer`
      }
    }
  }, [])

  const [showFileMenu, setShowFileMenu] = useState(false)

  function save(name: string, format: string) {
    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheets[0] as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: name,
      sep,
    })

    setShowFileMenu(false)
  }

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      component: () => (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() =>
              save(`${friendlyFilename(sheets[0]?.name ?? 'table')}.txt`, 'txt')
            }
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() =>
              save(`${friendlyFilename(sheets[0]?.name ?? 'table')}.csv`, 'csv')
            }
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <ShortcutLayout showHeader={false} signinRequired={false}>
      <Toolbar>
        <ToolbarMenu
          open={showFileMenu}
          onOpenChange={setShowFileMenu}
          fileMenuTabs={fileMenuTabs}
          extMenus={{
            info: (
              <DropdownMenuItem variant="none" className="h-16">
                <BaseCol className="text-xs gap-y-0.5">
                  <p>{APP_INFO.name}</p>

                  <p>Version {APP_INFO.version}</p>
                  <p>{formatString(APP_INFO.copyright)}</p>
                </BaseCol>
              </DropdownMenuItem>
            ),
          }}
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
      </Toolbar>

      <TabSlideBar
        side="right"
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
          //selectedSheet={sheets[0]?.id}
          dataFrames={[sheets[0] as AnnotationDataFrame]}
          //onTabChange={(selectedTab) => {
          //  goto({ file, sheet: selectedTab.tab })
          //}}
          className="mx-2 mt-2"
        />
      </TabSlideBar>

      <FooterPortal className="justify-end">
        <span>{getFormattedShape(sheets[0] as AnnotationDataFrame)}</span>
        <></>
        <ZoomSlider />
      </FooterPortal>
    </ShortcutLayout>
  )
}

export function TableViewerQueryPage() {
  return (
    <CoreProviders>
      <TableViewerPage />
    </CoreProviders>
  )
}
