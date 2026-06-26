'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ZoomSlider } from '@/toolbar/zoom-slider'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  filesToDataFrames,
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'

import { OpenIcon } from '@/icons/open-icon'
import { ToolbarButton } from '@/toolbar/toolbar-button'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { httpFetch } from '@/lib/http/http-fetch'

import { textToLines } from '@/lib/text/lines'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { CoreProviders } from '@/providers/core-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'

import { AssemblySelect } from '@/lib/edb/assembly-select'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { useZoom } from '@/providers/zoom-provider'
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
import { useBasicSaveAs } from '../../matcalc/hooks/save'
import { useAnnotations } from './annotate-store'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useOpen } from './use-open'

export function AnnotationPage() {
  const { goto, openFile } = useHistory()

  const { file } = useFiles()
  const { sheets } = useCurrentSheets()
  const { setAppInfo } = useAppInfo()
  const { settings } = useAnnotations()
  const { save } = useBasicSaveAs()
  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const { zoom } = useZoom()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { onFileChange } = useOpen()

  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

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

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/annotate.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(0).read(lines)

    openFile(`Test locations`, {
      sheets: [table.setName('Test Locations') as AnnotationDataFrame],
    })
  }

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              onFileChange,
            })
          }}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      component: (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('genomic-annotation.txt', 'txt')}
          >
            <FileIcon />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('genomic-annotation.csv', 'csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <>
            <AppHeaderIcon />
            <AppInfoButton />
          </>
          <></>

          <AssemblySelect />
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  title="Load test data."
                >
                  Test data
                </ToolbarButton>
                <HistoryShowButton />
              </>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <HistoryLayout>
          <TabbedDataFrames
            //selectedSheet={sheet?.id ?? ''}
            //dataFrames=sheets as AnnotationDataFrame[]}
            // onTabChange={(selectedTab) => {
            //   goto({ file, sheet: selectedTab.tab })
            // }}
            className="mx-2"
            zoom={zoom}
            onFileDrop={(files) => {
              if (files.length > 0) {
                onTextFileChange('Open from drag', files, (files) => {
                  filesToDataFrames(files, {
                    parseOpts: { indexCols: 0 },
                    onSuccess: (tables) => {
                      if (tables.length > 0) {
                        openFile(tables[0]!.name, { sheets: tables })
                      }
                    },
                    onError: () => {
                      openDialog({
                        type: 'warning',
                        payload: {
                          content:
                            'Your files could not be opened. Check they are formatted correctly.',
                        },
                      })
                    },
                  })
                })
              }
            }}
          />
        </HistoryLayout>

        <FooterPortal className="justify-end">
          <></>

          <></>

          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function AnnotationQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <AnnotationPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
