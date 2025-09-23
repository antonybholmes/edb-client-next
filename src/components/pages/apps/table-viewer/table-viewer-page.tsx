'use client'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'

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

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { randID } from '@lib/id'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { FileIcon } from '@icons/file-icon'
import {
  AnnotationDataFrame,
  type ISharedAnnotationDataFrame,
} from '@lib/dataframe/annotation-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import { friendlyFilename } from '@lib/path'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ZoomSlider } from '@toolbar/zoom-slider'

import type { ITab } from '@components/tabs/tab-provider'

import { DownloadIcon } from '@icons/download-icon'
import { HeaderLayout } from '@layouts/header-layout'
import { useSearchParams } from 'next/navigation'
import { HistoryPanel } from '../matcalc/history/history-panel'
import { useHistory } from '../matcalc/history/history-store'

export function TableViewerPage() {
  const { branch, sheet, openBranch, gotoSheet } = useHistory()
  const [showSideBar, setShowSideBar] = useState(false)
  const [rightTab, setRightTab] = useState(TEXT_HISTORY)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const searchParams = useSearchParams()

  //const urlParams = new URLSearchParams(window.location.search)
  const key = searchParams.get('key')

  useEffect(() => {
    if (key) {
      const sharedData = localStorage.getItem(key)
      if (sharedData) {
        const parsedData: ISharedAnnotationDataFrame = JSON.parse(sharedData)

        const rowMetaData = new DataFrame({
          data: parsedData.rowMetaData.data,
          columns: parsedData.rowMetaData.columns,
        })

        const colMetaData = new DataFrame({
          data: parsedData.colMetaData.data,
          columns: parsedData.colMetaData.columns,
        })

        const df = new AnnotationDataFrame({
          name: parsedData.name,
          data: parsedData.data,
          rowMetaData,
          colMetaData,
        })

        openBranch(`Load ${df.name}`, [df])

        // customize page title
        document.title = `${df.name} - Table Viewer`
      }
    }
  }, [key])

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
      //id: nanoid(),
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
              onClick={() => setShowDialog({ id: randID('save') })}
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
      content: <HistoryPanel branchId={branch?.id ?? ''} />,
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
              save(
                data!.name as string,
                (data!.format as ISaveAsFormat)!.ext! as string
              )
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderLayout showHeader={false}>
        <Toolbar tabs={tabs}>
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
              gotoSheet(selectedTab.tab.id)
            }}
            className="mx-2"
            // style={{ marginBottom: '-2px' }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(sheet)}</span>
          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>
      </HeaderLayout>
    </>
  )
}
