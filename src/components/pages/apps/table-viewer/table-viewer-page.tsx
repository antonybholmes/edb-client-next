'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import { BasicAlertDialog } from '@/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@/icons/clock-rotate-left-icon'

import { useEffect, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_HISTORY,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  type IDialogParams,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { randId } from '@/lib/id'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
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
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
} from '../matcalc/history/history-store'

import { BaseCol } from '@/components/layout/base-col'
import { formatString } from '@/lib/text/format-string'
import MODULE_INFO from './module.json'

export function TableViewerPage() {
  const _id = useStableId('table-viewer-page')
  const { goto, openFile } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheet = useSheet()!

  const [showSideBar, setShowSideBar] = useState(false)
  const [rightTab, setRightTab] = useState(TEXT_HISTORY)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

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

  const tabs: ITab[] = [
    {
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            {/* <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            /> */}

            <ToolbarIconButton
              title={TEXT_SAVE_TABLE}
              onClick={() => setShowDialog({ id: randId('save') })}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    // {
    //   id: 'Open',
    //   icon: <OpenIcon stroke="" />,
    //   content: (
    //     <DropdownMenuItem
    //       aria-label={TEXT_OPEN_FILE}
    //       onClick={() => setShowDialog({ id: randId('open'), params: {} })}
    //     >
    //       <UploadIcon stroke="" />

    //       <span>{TEXT_OPEN_FILE}</span>
    //     </DropdownMenuItem>
    //   ),
    // },
    {
      id: TEXT_SAVE_AS,
      content: (
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
    <>
      {showDialog.id === 'alert' && (
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name={friendlyFilename(sheet?.name ?? 'table')}
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string; format: ISaveAsFormat }
              save(d.name, d.format.ext)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {/* <HeaderSlotPortal slot="header-left">
        <ModuleInfoButton info={MODULE_INFO} />
      </HeaderSlotPortal> */}

      <ShortcutLayout showHeader={false} signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            extMenus={{
              info: (
                <DropdownMenuItem variant="none" className="h-16">
                  <BaseCol className="text-xs gap-y-0.5">
                    <p>{MODULE_INFO.name}</p>

                    <p>Version {MODULE_INFO.version}</p>
                    <p>{formatString(MODULE_INFO.copyright)}</p>
                  </BaseCol>
                </DropdownMenuItem>
              ),
            }}
          />
          <ToolbarPanel
            groupId={_id}
            tabs={tabs}
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
          id="table-viewer"
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          {/* <Card
            variant="content"
            className="mx-2 pb-0"
            style={{ marginBottom: '-2px' }}
          > */}
          <TabbedDataFrames
            selectedSheet={sheet?.id}
            dataFrames={[sheet as AnnotationDataFrame]}
            onTabChange={(selectedTab) => {
              goto({ app, file, sheet: selectedTab.tab })
            }}
            className="mx-2 mt-2"
            // style={{ marginBottom: '-2px' }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function TableViewerQueryPage() {
  return (
    <CoreProviders>
      <TableViewerPage />
    </CoreProviders>
  )
}
