'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { OpenIcon } from '@/icons/open-icon'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
} from '@/consts'

import { FileImageIcon } from '@/icons/file-image-icon'

import { useEffect, useState } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { OncoplotPanel, PANEL_ID } from './oncoplot-panel'

import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import { HeaderButton } from '@/layouts/header-button'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-provider'
import { useMessages } from '@/providers/message-provider'
import { HistoryShowButton } from '../../matcalc/history/history-layout'

import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { SVGProvider } from '@/providers/svg-provider'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import APP_INFO from './manifest.json'
import { OncoplotDialogsRoot } from './oncoplot-dialogs'
import { useOncoplot } from './oncoplot-store'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useOpen } from './use-open'

function OncoplotPage() {
  const { addSheets, openFile } = useHistory()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  // const dataTab: ITab = {
  //   //name: nanoid(),
  //   icon: <TableIcon />,
  //   id: 'Table 1',
  //   content: ()=> <DataPanel />,
  //   isOpen: true,
  // }
  //const [foldersTab, setFoldersTab] = useState<ITab>(dataTab)
  //const [tab, setTab] = useState<ITab | undefined>(dataTab)
  //const [foldersIsOpen, setShowFolders] = useState(true)
  //const [tabName] = useState('Table 1')

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])

  const { setClinicalTracks, setGenesFromTable } = useOncoplot()

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { sendMessage } = useMessages('oncoplot') //'onco')

  const { open, setClinicalData } = useOpen()
  const { setAppInfo } = useAppInfo()
  const { setTabs: setToolbarTabs } = useToolbarTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  //const [clusterFrame, setClusterFrame] = useState<IClusterFrameProps>(NO_CF)

  // useEffect(() => {
  //   if (dataFrames.length > 0) {
  //     let df: IDataFrame = dataFrames[0]

  //     if (getSize(df) == 0) {
  //       return
  //     }

  //     const h = new HCluster(completeLinkage, euclidean)

  //     const clusterRows = false
  //     const clusterCols = true
  //     const zScore = true

  //     const rowTree = clusterRows ? h.run(df) : null
  //     const colTree = clusterCols ? h.run(transpose(df)) : null

  //     if (zScore) {
  //       df = colZScore(df)
  //     }

  //     setClusterFrame({ ...df, rowTree, colTree })
  //   }
  // }, [dataFrames])

  //const { data } = useFetch("/z_test.txt")

  async function loadTestData() {
    try {
      let res = await httpFetch.getText(
        '/data/test/adalgisa_oncoplot_20bp_regions_v3.maf.txt' //"/data/test/bcca2024_29cl_20icg_hg19_chr3-187451979-187469971.maf.txt",
      )

      let lines = textToLines(res)

      let table = new DataFrameReader().read(lines)

      //resolve({ ...table, name: file.name })

      openFile(`Variants`, { sheets: [table.setName('Variants')] })

      res = await httpFetch.getText(
        '/data/test/adalgisa_20bp_windows_for_oncoplot_v3.txt'
      )

      lines = textToLines(res)

      //setLocations(lines.slice(1).map((l: string) => parseLocation(l)))

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      addSheets([table.setName('Locations')], { mode: 'append' })

      res = await httpFetch.getText('/data/test/adalgisa_clinical_data.txt')

      lines = textToLines(res)

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      setClinicalData(table)

      // get rid of the plot
      //plotsDispatch({ type: 'clear' })

      // const table = new DataFrameReader() .read(lines)

      //resolve({ ...table, name: file.name })
    } catch (error) {
      console.log(error)
    }
  }

  async function loadGeneTestData() {
    try {
      const res = await httpFetch.getText('/data/test/onco-plot-test.txt')

      const lines = textToLines(res)

      const table = new DataFrameReader().keepDefaultNA(false).read(lines)

      table.setName('Variants', true)

      setGenesFromTable(table)

      openFile(`Variants`, { sheets: [table] })

      loadClinicalTestData()
    } catch (error) {
      console.log(error)
    }
  }

  async function loadClinicalTestData() {
    try {
      const res = await httpFetch.getText(
        '/data/test/onco-plot-clinical-test.txt'
      )

      const lines = textToLines(res)

      const table = new DataFrameReader().keepDefaultNA(false).read(lines)

      setClinicalData(table)

      // get rid of the plot
      //plotsDispatch({ type: 'clear' })
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  // useEffect(() => {
  //   //setSelectedSheet(0) //currentStep(history)[0]!.df.length - 1)
  //   //setTab(dataTab)
  //   //selectionRangeDispatch({ type: 'clear' })
  //   //setClusterFrame(NO_CF)
  // }, [history])

  // useEffect(() => {
  //   if (plotState.plots.length > 0) {
  //     setPanelTab(plotState.plots[plotState.plots.length - 1].name)
  //   }
  // }, [plotState])

  // const oncoQuery = useQuery({
  //   queryKey: ['oncoplot'],
  //   queryFn: async () => {
  //     return httpFetch.getJson<IOncoProps>(
  //       '/data/modules/oncoplot/oncoplot.json'
  //     )
  //   },
  // })

  // function _open(message: string) {
  //   openDialog({
  //     type: 'open',
  //     payload: {
  //       message,
  //       callback: (message, files) => {
  //         onTextFileChange(message, files, (files) =>
  //           parseFiles(message, files)
  //         )
  //       },
  //     },
  //   })
  // }

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => open('variants')}
        >
          <UploadIcon stroke="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: '<divider>',
    },
    {
      id: TEXT_SAVE_AS,
      component: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => {
              {
                sendMessage({
                  type: 'info',
                  source: 'matcalc',
                  target: 'Data',
                  data: 'save:txt',
                })
              }
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: 'Data',
                data: 'save:csv',
              })
              // save("txt")}
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      id: 'Export',
      component: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: APP_INFO.name,
                target: PANEL_ID,
                data: 'save:png',
              })
              // save("txt")}
            }}
          >
            <FileImageIcon fill="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: APP_INFO.name,
                target: PANEL_ID,
                data: 'save:svg',
              })
              // save("txt")}
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <HeaderSlotPortal>
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<HeaderButton className="text-xs">Test Data</HeaderButton>}
          />

          <DropdownMenuContent align="end" className="text-sm">
            {/* <DropdownMenuItem onClick={() => loadTestData()}>
              Plot
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => loadGeneTestData()}>
              Gene
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => loadClinicalTestData()}>
              Clinical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HeaderSlotPortal>

      <OncoplotDialogsRoot />

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={APP_INFO}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={<HistoryShowButton />}
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  sendMessage({
                    type: 'info',
                    source: APP_INFO.name,
                    target: PANEL_ID,
                    data: 'show-sidebar',
                  })
                }}
              />
            }
          />
        </Toolbar>

        <OncoplotPanel panelId="oncoplot-panel" />
      </ShortcutLayout>
    </>
  )
}

/** client:only component */
export function OncoplotQueryPage() {
  return (
    <CoreProviders>
      <SVGProvider>
        <OncoplotPage />
      </SVGProvider>
    </CoreProviders>
  )
}
