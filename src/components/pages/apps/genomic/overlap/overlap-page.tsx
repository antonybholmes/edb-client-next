'use client'

import {
  DATAFRAME_TABS,
  TabbedDataFrames,
} from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { OpenIcon } from '@/icons/open-icon'

import { useContext, useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OK,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@/icons/upload-icon'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { DeleteIcon } from '@/icons/delete-icon'
import { FileIcon } from '@/icons/file-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import type { ITab } from '@/components/tabs/tab-provider'
import {
  useSideTabs,
  useTabs,
  useToolbarTabs,
} from '@/components/tabs/tab-provider'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { CoreProviders } from '@/providers/core-provider'
import { ZoomSlider } from '@/toolbar/zoom-slider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { FilesPropsPanel } from './files-props-panel'
import APP_INFO from './manifest.json'
import { OverlapContext, OverlapProvider } from './overlap-provider'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useSave } from './use-save'

function OverlapPage() {
  const { dfs, setDfs, selected, setSelected, openOverlapFiles } =
    useContext(OverlapContext)

  const { save } = useSave()

  const { setAppInfo } = useAppInfo()

  //const [rightTab, setRightTab] = useState('Options')
  const [showSideBar, setShowSideBar] = useState(true)

  const { open: openDialog } = useDialogs()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

  const { tabs: dfTabs } = useTabs(DATAFRAME_TABS)

  useEffect(() => {
    setDfs(
      dfTabs
        .map((tab) => {
          const df = dfs.find((df) => df.id === tab.id)

          return df
        })
        .filter((df) => !!df)
    )
  }, [setAppInfo])

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
        id: 'Files',
        component: FilesPropsPanel,
      },
      // {
      //   //id: nanoid(),
      //   icon: <ClockRotateLeftIcon />,
      //   id: 'History',
      //   content: ()=> <HistoryPanel />,
      // },
    ])
  }, [setSideTabs])

  function openFiles(files: ITextFileOpen[]) {
    openOverlapFiles(files)

    setShowFileMenu(false)
  }

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() =>
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, openFiles)
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
      component: () => (
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
              //selectedSheet={selected}
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
              // onTabChange={(v) => {
              //   setSelected(v.tab.id)
              // }}
              // onReorder={(order) => {
              //   setDfs(reorder(dfs, order, (df, id) => df.id === id))
              // }}
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
