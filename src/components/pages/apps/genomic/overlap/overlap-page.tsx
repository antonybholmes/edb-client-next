'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import {
  onTextFileChange,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { OpenIcon } from '@/icons/open-icon'

import { useContext, useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OK,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@/icons/upload-icon'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { DeleteIcon } from '@/icons/delete-icon'
import { FileIcon } from '@/icons/file-icon'
import { SettingsIcon } from '@/icons/settings-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  type OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import type { ITab } from '@/components/tabs/tab-provider'
import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-store'
import { useStableId } from '@/hooks/stable-id'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { reorder } from '@/lib/math/reorder'
import { where } from '@/lib/math/where'
import { CoreProviders } from '@/providers/core-providers'
import { ZoomSlider } from '@/toolbar/zoom-slider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { FilesPropsPanel } from './files-props-panel'
import APP_INFO from './manifest.json'
import { OverlapContext, OverlapProvider } from './overlap-provider'

function OverlapPage() {
  const _id = useStableId('overlap-page')

  const { dfs, setDfs, selected, setSelected, openOverlapFiles } =
    useContext(OverlapContext)

  const { setAppInfo } = useAppInfo()

  //const [rightTab, setRightTab] = useState('Options')
  const [showSideBar, setShowSideBar] = useState(true)

  const { open: openDialog } = useDialogs()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)

    const tabs: ITab[] = [
      {
        //id: nanoid(),
        id: 'Home',
        render: () => (
          <>
            <ToolbarTabGroup title={TEXT_FILE}>
              <ToolbarOpenFile
                onOpen={() => {
                  openDialog({
                    type: 'open',
                    payload: {
                      callback: (message, files) => {
                        onTextFileChange(message, files, openFiles)
                      },
                    },
                  })
                }}
                multiple={true}
              />

              <ToolbarIconButton
                onClick={() => save('txt')}
                title={TEXT_SAVE_TABLE}
              >
                <DownloadIcon />
              </ToolbarIconButton>
            </ToolbarTabGroup>

            <ToolbarTabGroup title="Overlap">
              <ToolbarButton
                title="Calculate minimum common regions for columns of genomic coordinates"
                onClick={() => overlapGenomicLocations('mcr')}
              >
                MCR
              </ToolbarButton>
              <ToolbarButton
                aria-label="Calculate maximum overlap regions for columns of genomic coordinates"
                onClick={() => overlapGenomicLocations('max')}
              >
                Min/max
              </ToolbarButton>
            </ToolbarTabGroup>

            <ToolbarTabGroup title="One Way">
              <ToolbarButton
                title="Calculate minimum common regions for columns of genomic coordinates"
                onClick={() => overlapOneWay()}
              >
                One Way
              </ToolbarButton>
            </ToolbarTabGroup>
          </>
        ),
      },
    ]

    setToolbarTabs(tabs)

    const rightTabs: ITab[] = [
      {
        //id: nanoid(),
        icon: <SettingsIcon />,
        id: 'Files',
        render: () => <FilesPropsPanel />,
      },
      // {
      //   //id: nanoid(),
      //   icon: <ClockRotateLeftIcon />,
      //   id: 'History',
      //   content: ()=> <HistoryPanel />,
      // },
    ]

    setSideTabs(rightTabs)
  }, [setAppInfo])

  function openFiles(files: ITextFileOpen[]) {
    openOverlapFiles(files)

    setShowFileMenu(false)
  }

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    //const dataframes = order.map(id => dfMap.get(id)!)

    const dfOverlaps = createOverlapTableFromDataframes(dfs, mode)

    if (dfOverlaps) {
      setDfs([...dfs, dfOverlaps])
      setSelected(dfOverlaps.id)
    }
  }

  function overlapOneWay() {
    //const dataframes = order.map(id => dfMap.get(id)!)

    const dfOverlaps = oneWayFromDataframes(dfs)

    if (dfOverlaps) {
      setDfs([...dfs, dfOverlaps])
      setSelected(dfOverlaps.id)
    }
  }

  function save(format: 'txt' | 'csv') {
    const sep = format === 'csv' ? ',' : '\t'

    const idx = where(dfs, (df) => df.id === selected)

    if (idx.length > 0) {
      downloadDataFrame(dfs[idx[0]!]! as AnnotationDataFrame, {
        hasHeader: true,
        hasIndex: false,
        file: `table.${format}`,
        sep,
      })
    }

    setShowFileMenu(false)
  }

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      render: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() =>
            openDialog({
              type: 'open',
              payload: {
                callback: (message, files) => {
                  onTextFileChange(message, files, openFiles)
                },
              },
            })
          }
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      render: () => (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <HeaderSlotPortal slot="header-left">
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
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
          //value={rightTab}
          //onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <>
            {/* <Card
            variant="content"
            className="mx-2 pb-0"
            style={{ marginBottom: '-2px' }}
          > */}
            <TabbedDataFrames
              selectedSheet={selected}
              dataFrames={dfs as AnnotationDataFrame[]}
              // onTabChange={selectedTab => {
              //   historyDispatch({
              //     type: 'goto-sheet',
              //     sheetId: selectedTab.index,
              //   })
              // }}
              className="mx-2"
              menuActions={[
                { action: 'Delete', icon: <DeleteIcon stroke="" /> },
              ]}
              menuCallback={(tab: ITab, action: string) => {
                if (action === 'Delete') {
                  openDialog({
                    type: 'warning',
                    payload: {
                      content: 'Are you sure you want to delete this sheet?',
                      callback: (response) => {
                        if (response === TEXT_OK) {
                          setDfs(dfs.filter((df) => df.id !== tab.id))
                        }
                      },
                    },
                  })
                }
              }}
              onTabChange={(v) => {
                setSelected(v.tab.id)
              }}
              onReorder={(order) => {
                setDfs(reorder(dfs, order, (df, id) => df.id === id))
              }}
              allowReorder={true}
              onFileDrop={(files) => {
                if (files.length > 0) {
                  //setDroppedFile(files[0]);
                  //console.log('Dropped file:', files[0])

                  onTextFileChange('Open dropped file', files, openOverlapFiles)
                }
              }}
            />
            {/* </Card> */}
          </>
        </TabSlideBar>

        <FooterPortal className="justify-end">
          <span>{getFormattedShape(dfs[0]!)}</span>
          <></>
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function OverlapQueryPage() {
  return (
    <CoreProviders>
      <OverlapProvider>
        <OverlapPage />
      </OverlapProvider>
    </CoreProviders>
  )
}
