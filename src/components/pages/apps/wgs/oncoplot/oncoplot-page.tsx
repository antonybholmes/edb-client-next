'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { ToolbarButton } from '@/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { OpenIcon } from '@/icons/open-icon'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
} from '@/consts'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { FileImageIcon } from '@/icons/file-image-icon'

import { useEffect, useState } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { MULTI_MODE_MAP, type MultiMode } from './oncoplot-utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeClinicalTracks } from './clinical-utils'
import { OncoplotPanel, PANEL_ID } from './oncoplot-panel'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import type { ITab } from '@/components/tabs/tab-provider'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { useStableId } from '@/hooks/stable-id'
import { FileIcon } from '@/icons/file-icon'
import { HeaderButton } from '@/layouts/header-button'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-providers'
import { useMessages } from '@/providers/messages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
import { HistoryShowButton } from '../../matcalc/history/history-layout'
import { useHistory } from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import APP_INFO from './manifest.json'
import { OncoplotDialogsRoot } from './oncoplot-dialogs'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { useOncoplot } from './oncoplot-store'

function OncoplotPage() {
  const _id = useStableId('oncoplot-page')

  const { addSheets, openFile } = useHistory()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  // const dataTab: ITab = {
  //   //name: nanoid(),
  //   icon: <TableIcon />,
  //   id: 'Table 1',
  //   content: <DataPanel />,
  //   isOpen: true,
  // }
  //const [foldersTab, setFoldersTab] = useState<ITab>(dataTab)
  //const [tab, setTab] = useState<ITab | undefined>(dataTab)
  //const [foldersIsOpen, setShowFolders] = useState(true)
  //const [tabName] = useState('Table 1')

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])

  const { displayProps, setDisplayProps } = useOncoplotSettings()

  const { setClinicalTracks, setGenesFromTable } = useOncoplot()

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { sendMessage } = useMessages('oncoplot') //'onco')

  const { open: openDialog } = useDialogs()
  const { setAppInfo } = useAppInfo()

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [])

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

  function setClinicalData(clinicalTable: BaseDataFrame) {
    const [clinicalTracks, tracksProps] = makeClinicalTracks(clinicalTable)

    setClinicalTracks(clinicalTracks)

    setDisplayProps(
      produce(displayProps, (draft) => {
        draft.legend.clinical.tracks = tracksProps
        draft.legend.clinical.trackOrder = clinicalTracks.map(
          (track) => track.name
        )
      })
    )

    // show sheet in UI
    addSheets([clinicalTable.setName('Clinical')], { mode: 'append' })
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

  function parseFiles(message: string, files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const file = files[0]!
    const name = file.name
    const text = file.text

    if (message.includes('clinical')) {
      const lines = textToLines(text)

      const clinicalTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      setClinicalData(clinicalTable)
    } else if (message.includes('locations')) {
      const lines = textToLines(text)

      const locationTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      addSheets([locationTable.setName('Locations')], { mode: 'append' })
    } else {
      //setFilesToOpen([
      //  { name: "Variants", text, ext: name.split(".").pop() || "" },
      //])

      openFiles(
        [{ name: 'Variants', text, ext: name.split('.').pop() || '' }],
        {
          colNames: 1,
          indexCols: 0,
          delimiter: '\t',
          keepDefaultNA: false,
          skipRows: 0,
        }
      )
    }
    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }
  }

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    //filesToDataFrames(files, historyDispatch, options)

    console.log('Parsing files with options:', files)

    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })

          setGenesFromTable(tables[0]!)
        }
      },
      onError: (error) => {
        console.log('Error parsing files:', error)
        openDialog({
          type: 'alert',
          payload: {
            content: `${error}. Please check the file format and try again.`,
          },
        })
      },
    })

    setShowFileMenu(false)
  }

  function _open(message: string) {
    openDialog({
      type: 'open',
      payload: {
        message,
        callback: (message, files) => {
          onTextFileChange(message, files, (files) =>
            parseFiles(message, files)
          )
        },
      },
    })
  }

  const tabs: ITab[] = [
    {
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpen={() => {
                _open('variants')
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title="Save image"
              onClick={() => {
                //save("txt")
                sendMessage({
                  type: 'info',
                  source: APP_INFO.name,
                  target: PANEL_ID,
                  data: 'save',
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Data">
            <ToolbarCol>
              <ToolbarButton
                aria-label="Open clinical information"
                onClick={() => {
                  _open('clinical')
                }}
              >
                Clinical
              </ToolbarButton>
              <ToolbarButton
                aria-label="Open location data"
                onClick={() => {
                  _open('locations')
                }}
              >
                Locations
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>

          <ToolbarTabGroup
            title="Plot"
            className="gap-x-4"
            style={{ alignItems: 'flex-start' }}
          >
            <ToggleGroup
              value={[
                displayProps.sort.sortGenes ? ['rows'] : [],
                displayProps.sort.sortSamples ? ['columns'] : [],
              ].flat()}
              onValueChange={(v) => {
                const newSettings = produce(displayProps, (draft) => {
                  draft.sort.sortGenes = v.includes('rows')

                  draft.sort.sortSamples = v.includes('columns')
                })

                setDisplayProps(newSettings)
              }}
              size="toolbar"
              justify="start"
              direction="toolbar"
              multiple={true}
              className="gap-x-0.5"
            >
              <GroupToggle value="rows">Sort rows</GroupToggle>

              <GroupToggle value="columns">Sort columns</GroupToggle>
            </ToggleGroup>

            {/* <ToolbarCol>
              <ToolbarButton
                checked={displayProps.sort.sortGenes}
                onClick={() => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.sort.sortGenes = !displayProps.sort.sortGenes
                    })
                  )
                }}
                //className="w-16"
              >
                Sort rows
              </ToolbarButton>
              <ToolbarButton
                // /className="w-16"
                checked={displayProps.sort.sortSamples}
                onClick={() => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.sort.sortSamples = !displayProps.sort.sortSamples
                    })
                  )
                }}
              >
                Sort columns
              </ToolbarButton>
            </ToolbarCol> */}

            <ToolbarCol>
              <Select
                defaultValue={displayProps.multi}
                onValueChange={(v) => {
                  setDisplayProps(
                    produce(displayProps, (draft) => {
                      draft.multi = v as MultiMode
                    })
                  )
                }}
              >
                <SelectTrigger
                  className="w-28"
                  id="plot-mode-select"
                  variant="toolbar"
                >
                  <SelectValue data-placeholder="Select a mode">
                    {(value: MultiMode) => <span>{MULTI_MODE_MAP[value]}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multi">Multi</SelectItem>
                  <SelectItem value="equal-bars">Equal bars</SelectItem>
                  <SelectItem value="stacked-bars">Stacked bars</SelectItem>
                </SelectContent>
              </Select>

              <ToolbarButton
                checked={displayProps.removeEmptySamples}
                onClick={() => {
                  setDisplayProps(
                    produce(displayProps, (draft) => {
                      draft.removeEmptySamples =
                        !displayProps.removeEmptySamples
                    })
                  )
                }}
              >
                No empty samples
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => _open('variants')}
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
      content: (
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
      //id: nanoid(),
      id: 'Export',
      content: (
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
      {/* <DialogsRoot filter={['open', 'alert', 'ok-cancel']} /> */}

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
            groupId={_id}
            tabs={tabs}
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
            groupId={_id}
            tabs={tabs}
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  //save("txt")
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
      <OncoplotPage />
    </CoreProviders>
  )
}
