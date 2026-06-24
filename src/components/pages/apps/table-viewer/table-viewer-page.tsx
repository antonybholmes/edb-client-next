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

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@/icons/clock-rotate-left-icon'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_HISTORY,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
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
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import type { ITab } from '@/components/tabs/tab-provider'

import { useStableId } from '@/hooks/stable-id'
import { DownloadIcon } from '@/icons/download-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { CoreProviders } from '@/providers/core-providers'
import { HistoryPanel } from '../matcalc/history/history-panel'

import { useDialogs } from '@/components/dialogs/dialogs'
import { BaseCol } from '@/components/layout/base-col'

import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-store'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { formatString } from '@/lib/text/format-string'
import {
  useCurrentSheets,
  useFiles,
} from '../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import APP_INFO from './manifest.json'

export function TableViewerPage() {
  const _id = useStableId('table-viewer-page')
  const { openFile, goto } = useHistory()
  const { setAppInfo } = useAppInfo()

  const { file } = useFiles()
  const { sheet } = useCurrentSheets()

  const [showSideBar, setShowSideBar] = useState(false)
  const [rightTab, setRightTab] = useState(TEXT_HISTORY)

  const { open: openDialog } = useDialogs()

  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)

    const tabs: ITab[] = [
      {
        id: 'Home',
        component: () => (
          <>
            <ToolbarTabGroup title={TEXT_FILE}>
              <ToolbarIconButton
                title={TEXT_SAVE_TABLE}
                onClick={() =>
                  openDialog({
                    type: 'save',
                    payload: {
                      name: friendlyFilename(sheet?.name ?? 'table'),
                    },
                  })
                }
              >
                <DownloadIcon />
              </ToolbarIconButton>
            </ToolbarTabGroup>
          </>
        ),
      },
    ]

    setToolbarTabs(tabs)

    const rightTabs: ITab[] = [
      {
        id: 'History',
        icon: <ClockRotateLeftIcon />,
        component: () => <HistoryPanel />,
      },
    ]
    setSideTabs(rightTabs)

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
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
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
              save(`${friendlyFilename(sheet?.name ?? 'table')}.txt`, 'txt')
            }
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() =>
              save(`${friendlyFilename(sheet?.name ?? 'table')}.csv`, 'csv')
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
          selectedSheet={sheet?.id}
          dataFrames={[sheet as AnnotationDataFrame]}
          onTabChange={(selectedTab) => {
            goto({ file, sheet: selectedTab.tab })
          }}
          className="mx-2 mt-2"
        />
      </TabSlideBar>

      <FooterPortal className="justify-end">
        <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
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
