'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import { onTextFileChange } from '@/components/pages/open-files'

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
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import {
  HeaderPortal,
  HeaderSlotPortal,
} from '@/components/header/header-portal'
import { useStableId } from '@/hooks/stable-id'
import { AssemblySelect } from '@/lib/edb/assembly-select'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { CoreProviders } from '@/providers/core-provider'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'

import { useToolbarTabs } from '@/components/tabs/tab-store'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home'
import { useOpen } from './use-open'

export function DNAPage() {
  const _id = useStableId('dna-page')
  const { goto, openFile, addSheets } = useHistory()

  const { file } = useFiles()
  const { sheet, sheets } = useCurrentSheets()
  const { setAppInfo } = useAppInfo()
  const [showSideBar, setShowSideBar] = useState(true)

  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()
  const { openFiles } = useOpen()

  useEffect(() => {
    setAppInfo(APP_INFO)
    //openApp(APP_INFO.name)
  }, [])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

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

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/dna.txt')

    try {
      const lines = textToLines(res)

      const table = new DataFrameReader().indexCols(0).read(lines)

      //resolve({ ...table, name: file.name })

      openFile(`DNA Test`, {
        sheets: [table.setName('DNA Test') as AnnotationDataFrame],
      })
    } catch {
      // do nothing
    }
  }

  // const genomesQuery = useQuery({
  //   queryKey: ['genomes'],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()

  //     const res = await httpFetch.getJson<{ data: string[] }>(
  //       API_DNA_GENOMES_URL
  //     )

  //     return res.data
  //   },
  // })

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openDialog({
              type: 'open',
              payload: {
                callback: (message, files) => {
                  onTextFileChange(message, files, openFiles)
                },
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
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      component: () => (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('dna.txt', 'txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('dna.csv', 'csv')}
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

      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
        <></>
        <AssemblySelect />
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <HeaderSlotPortal slot="header-right"></HeaderSlotPortal>

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
                  role="button"
                  title="Load test data."
                  className="text-xs"
                >
                  Test data
                </ToolbarButton>
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
          <TabbedDataFrames
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              goto({ file, sheet: selectedTab.tab })
            }}
            className="mx-2"
          />
        </HistoryLayout>
      </ShortcutLayout>

      <FooterPortal className="justify-end">
        <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
        <></>
        <ZoomSlider />
      </FooterPortal>
    </>
  )
}

export function DNAQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <DNAPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
