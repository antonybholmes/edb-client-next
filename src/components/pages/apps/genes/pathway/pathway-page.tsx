'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'
import { FooterPortal } from '@/components/toolbar/footer-portal'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { OpenIcon } from '@/icons/open-icon'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'

import {
  DOCS_URL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { truncate } from '@/lib/text/text'
import { useEffect, useState } from 'react'

import type { ITab } from '@/components/tabs/tab-provider'

import { FileIcon } from '@/icons/file-icon'

import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'

import APP_INFO from './manifest.json'
//import { toast } from '@/themed/use-toast'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { CoreProviders } from '@/providers/core-providers'

import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'

import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { useFooter } from '@/providers/footer-provider'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { useSave } from '../../matcalc/hooks/save'
import { PathwayPropsPanel } from './pathway-props-panel'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useOpen } from './use-open'

const HELP_URL = DOCS_URL + '/apps/pathway'

export function PathwayPage() {
  const { setAppInfo } = useAppInfo()

  const { settings } = useEdbSettings()

  const [toolbarTab, setToolbarTab] = useState('Home')

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { openFile } = useHistory()

  const { open: openLocalFile } = useOpen()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { addDFSize } = useFooter()
  const { save } = useSave()
  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
      // {
      //   id: 'Help',
      //   render: () => <ToolbarHelpTabGroup url={HELP_URL} />,
      // },
    ])
  }, [setToolbarTabs])

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/pathway.txt')

    try {
      const lines = textToLines(res)

      const table = new DataFrameReader()
        .keepDefaultNA(false)
        .indexCols(0)
        .read(lines)
        .setName('Genesets')

      //resolve({ ...table, name: file.name })

      openFile(`Load ${table.name}`, {
        sheets: [table.setName(truncate(table.name, { length: 16 }))],
      })
    } catch {
      // do nothing
    }
  }

  function open(table: BaseDataFrame) {
    // if (workerRef.current) {
    //   workerRef.current.terminate()
    // }

    openFile(`Load ${table.name}`, {
      sheets: [table.setName(truncate(table.name, { length: 16 }))],
    })
  }

  function openFiles(files: ITextFileOpen[]) {
    if (files.length > 0) {
      filesToDataFrames(files, {
        parseOpts: {
          ...DEFAULT_PARSE_OPTS,
          indexCols: 0,
          colNames: files[0]!.name.includes('gmx') ? 0 : 1,
          skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
          delimiter: files[0]!.ext === 'csv' ? ',' : '\t',
        },
        onSuccess: (tables) => {
          if (tables.length > 0) {
            open(tables[0]!)
          }
        },
      })
    }
  }

  // function save(name: string, format: string) {
  //   if (sheets.length === 0) {
  //     return
  //   }

  //   const sep = format === 'csv' ? ',' : '\t'

  //   downloadDataFrame(df, {
  //     hasHeader: true,
  //     hasIndex: false,
  //     file: name,
  //     sep,
  //   })

  //   setShowFileMenu(false)
  // }

  // useEffect(() => {
  //   setDatasetsForUse(
  //     new Map<string, boolean>(
  //       datasetInfos
  //         .map(org =>
  //           org.datasets.map(
  //             (dataset: IDatasetInfo) =>
  //               [makeDatasetId(dataset), true] as [string, boolean]
  //           )
  //         )
  //         .flat()
  //     )
  //   )

  //   setDatasetInfoTabs(datasetInfos.map((org: IOrgInfo) => org.name))
  // }, [datasetInfos])

  // useEffect(() => {
  //   setDatasetsForUse(
  //     new Map<string, boolean>(
  //       datasetInfos
  //         .map(org =>
  //           org.datasets.map(
  //             (dataset: IDatasetInfo) =>
  //               [makeDatasetId(dataset), selectAllDatasets] as [string, boolean]
  //           )
  //         )
  //         .flat()
  //     )
  //   )
  // }, [selectAllDatasets])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
      render: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              onFileChange: openLocalFile,
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
      render: (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('pathways.txt', 'txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('pathways.csv', 'csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {/* <DialogsRoot /> */}

      <HeaderSlotPortal>
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            value={toolbarTab}
            onValueChange={setToolbarTab}
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

          <ToolbarPanel
            tabShortcutMenu={<OptsSidebarMenu open={settings.sidebar.show} />}
          />
        </Toolbar>
        <HistoryLayout>
          <ResizableSidebar side="right">
            {/* <Card variant="content" className="mx-2 pb-0"> */}
            <TabbedDataFrames
              //selectedSheet={df?.id ?? ''}
              //dataFrames=sheets.map((s) => s as AnnotationDataFrame)}
              //onTabChange={(selectedTab) => {
              //  goto({ file, sheet: selectedTab.tab })
              //}}
              onFileDrop={(files) => {
                if (files.length > 0) {
                  onTextFileChange('Open dropped file', files, openFiles)
                }
              }}
              className="mx-2"
            />
            <PathwayPropsPanel />
          </ResizableSidebar>
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

export function PathwayQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <PathwayPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
