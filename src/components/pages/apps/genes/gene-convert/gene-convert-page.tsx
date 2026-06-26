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
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'

import { OpenIcon } from '@/icons/open-icon'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { useStableId } from '@/hooks/stable-id'
import { HeaderButton } from '@/layouts/header-button'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import { useAppInfo } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-provider'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'

import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { useFooter } from '@/providers/footer-provider'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { useOpenFiles } from '../../matcalc/hooks/open'
import { useSave } from '../../matcalc/hooks/save'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home-toolbar'

export function GeneConvPage() {
  const _id = useStableId('gene-convert-page')

  const { openFile, goto } = useHistory()

  const { file } = useFiles()
  const { sheets } = useCurrentSheets()

  const { setAppInfo } = useAppInfo()

  const { open: openDialog } = useDialogs()
  const [showSideBar, setShowSideBar] = useState(true)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { openDataFrames } = useOpenFiles()
  const { save } = useSave()
  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  // function openFiles(
  //   files: ITextFileOpen[],
  //   options: IParseOptions = DEFAULT_PARSE_OPTS
  // ) {
  //   //filesToDataFrames(files, historyDispatch, options)

  //   filesToDataFrames(files, {
  //     parseOpts: options,
  //     onSuccess: (tables) => {
  //       if (tables.length > 0) {
  //         openFile(tables[0]!.name, { sheets: tables })
  //       }
  //     },
  //   })

  //   setShowFileMenu(false)
  // }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    try {
      const res = await httpFetch.getText('/data/test/geneconv.txt')

      const lines = textToLines(res)

      const table = new DataFrameReader().indexCols(0).read(lines)

      openFile(`Test`, {
        sheets: [table.setName('Geneconv Test') as AnnotationDataFrame],
      })
    } catch {
      // do nothing
    }
  }

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) =>
                  openDataFrames(files)
                )
              },
            })
          }}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: TEXT_SAVE_AS,
      component: () => (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('gene-convert', 'txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('gene-convert', 'csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  return (
    <>
      <HeaderSlotPortal>
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <HeaderButton
          className="text-xs"
          onClick={() => loadTestData()}
          title="Load test data."
        >
          Test data
        </HeaderButton>
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <HistoryShowButton />
              </>
            }
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

        <HistoryLayout>
          {/* <TabSlideBar
            id="gene-conv"
            side="right"
            tabs={rightTabs}
            value={rightTab}
            onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
            open={showSideBar}
            onOpenChange={setShowSideBar}
          > */}

          <TabbedDataFrames
            //selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            // onTabChange={(selectedTab) => {
            //   goto({ file, sheet: selectedTab.tab })
            // }}
            className="mx-2"
          />

          {/* </TabSlideBar> */}
        </HistoryLayout>
        <FooterPortal className="justify-end">
          <> </>

          <></>
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function GeneConvQueryPage() {
  return (
    <CoreProviders>
      <GeneConvPage />
    </CoreProviders>
  )
}
