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
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { OpenIcon } from '@/icons/open-icon'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { FileImageIcon } from '@/icons/file-image-icon'

import { useEffect, useState } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import {
  makeOncoPlot,
  MULTI_MODE_MAP,
  type IOncoColumns,
  type MultiMode,
} from './oncoplot-utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { randId } from '@/lib/id'
import { makeClinicalTracks } from './clinical-utils'
import { OncoplotPanel, PANEL_ID } from './oncoplot-panel'

import { HeaderSlotPortal } from '@/components/header/header-slot-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
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
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-providers'
import { useMessages } from '@/providers/message-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
import { HistoryShowButton } from '../../matcalc/history/history-layout'
import {
  findSheet,
  useFile,
  useHistory,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import MODULE_INFO from './module.json'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { useOncoplot } from './oncoplot-store'

function OncoplotPage() {
  const _id = useStableId('oncoplot-page')

  const { store, state, addSheets, openFile } = useHistory()
  const file = useFile()

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

  const { mutations, displayProps, setDisplayProps, setMutations } =
    useOncoplotSettings()

  const {
    genes,
    clinicalTracks,
    setMutationFrame,
    setVariantsInUse,
    setClinicalTracks,
    setGenesFromTable,
  } = useOncoplot()

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { sendMessage } = useMessages('oncoplot') //'onco')

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

      addSheets([table.setName('Locations')])

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
    addSheets([clinicalTable.setName('Clinical')])
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
    } else if (message.includes('Location')) {
      const lines = textToLines(text)

      const locationTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      addSheets([locationTable.setName('Locations')])
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

    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })

          setGenesFromTable(tables[0]!)
        }
      },
    })

    setShowFileMenu(false)
  }

  // function locationOncoplot() {
  //   const df = sheet?.df as BaseDataFrame

  //   console.log(df)

  //   const locationsDf: BaseDataFrame | undefined = findSheet('Locations', step!)
  //     ?.df as BaseDataFrame

  //   const locations = locationsDf
  //     ?.col(0)
  //     .strs.map((l: string) => parseGenLoc(l))

  //   const colMap: IOncoColumns = {
  //     sample: findCol(df, 'Sample'),
  //     chr: findCol(df, 'Chromosome'),
  //     start: findCol(df, 'Start_Position'),
  //     end: findCol(df, 'End_position'),
  //     ref: findCol(df, 'Reference_Allele'),
  //     tum: findCol(df, 'Tumor_Seq_Allele2'),
  //     gene: findCol(df, 'Gene'),
  //     type: findCol(df, 'Type'),
  //   }

  //   console.log(locations, colMap)

  //   // const [table, legend] = makeLocationOncoPlot(
  //   //   df,
  //   //   clinicalDf,
  //   //   locations,
  //   //   colMap,
  //   //   multi,
  //   //   sort,
  //   //   removeEmpty,
  //   //   oncoQuery.data!
  //   // )

  //   // const dp = {
  //   //   ...displayProps,
  //   //   multi,
  //   //   legend: {
  //   //     ...displayProps.legend,
  //   //     mutations: { ...displayProps.legend.mutations, ...legend },
  //   //   },
  //   // }

  //   // setDisplayProps(dp)

  //   // plotsDispatch({
  //   //   type: 'set',
  //   //   plot: {
  //   //     mutationFrame: table,
  //   //     clinicalTracks,
  //   //     //clinicalTracksColorMaps: [],
  //   //     displayProps: dp,
  //   //   },
  //   // })
  // }

  useEffect(() => {
    function oncoplot() {
      if (genes.length === 0 || mutations.length === 0) {
        return
      }

      // Assume first sheet is
      const sheet = findSheet(store, state, file, 'Variants')

      if (!sheet) {
        return
      }

      const df = sheet as BaseDataFrame

      console.log('Generating oncoplot from df:', df, mutations)

      const colMap: IOncoColumns = {
        sample: findCol(df, 'Sample'),
        chr: findCol(df, 'Chromosome'),
        start: findCol(df, 'Start_Position'),
        end: findCol(df, 'End_position'),
        ref: findCol(df, 'Reference_Allele'),
        tum: findCol(df, 'Tumor_Seq_Allele2'),
        gene: findCol(df, 'Gene'),
        type: findCol(df, 'Type'),
      }

      // for people who don't use the correct names

      if (colMap.sample === -1) {
        colMap.sample = findCol(df, 'Tumor_Sample_Barcode')
      }

      if (colMap.type === -1) {
        colMap.type = findCol(df, 'Variant Classification')
      }

      //const multi = 'multi'
      //const sort = true
      //const removeEmpty = true

      const { oncoFrame, mutationsInUse, newMutations } = makeOncoPlot(
        df,
        mutations,
        colMap,
        displayProps.multi,
        displayProps.sort,
        displayProps.removeEmptySamples,
        genes,
        clinicalTracks
      )

      setMutationFrame(oncoFrame)
      setVariantsInUse(mutationsInUse)

      console.log('Variants in use:', mutationsInUse)

      // setDisplayProps(
      //   produce(displayProps, draft => {
      //     draft.legend.mutations.names = legend.names
      //     draft.legend.mutations.colorMap = legend.colorMap
      //   })
      // )

      if (newMutations.length > 0) {
        setMutations([...mutations, ...newMutations])
      }

      // if (colMap.sample !== -1) {
      //   // see if table might contain clinical info
      //   const cooCol = findCol(df, 'COO')
      //   const lymphGenCol = findCol(df, 'LymphGen')

      //   if (cooCol !== -1 && lymphGenCol !== -1) {
      //     const dfClinical = df.iloc(':', [colMap.sample, cooCol, lymphGenCol])

      //     console.log(dfClinical, 'aha')

      //     setClinicalData(dfClinical)
      //   }
      // }
    }

    // auto make oncoplot when data or settings change
    oncoplot()
  }, [
    file,

    mutations,
    genes,
    clinicalTracks,
    displayProps.multi,
    displayProps.sort,
    displayProps.removeEmptySamples,
    setMutationFrame,
    setVariantsInUse,
    setMutations,
    //oncoQuery.data,
  ])

  const tabs: ITab[] = [
    {
      ////name: nanoid(),
      id: 'Home',

      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  console.log('open file menu ')
                  setShowDialog({
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title="Save image"
              onClick={() => {
                //save("txt")
                sendMessage({
                  type: 'info',
                  source: MODULE_INFO.name,
                  target: PANEL_ID,
                  data: 'save',
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Data">
            <ToolbarCol>
              <ToolbarButton
                aria-label="Open clinical information"
                onClick={() =>
                  setShowDialog({ id: randId('clinical'), params: {} })
                }
              >
                Clinical
              </ToolbarButton>
              <ToolbarButton
                aria-label="Open location data"
                onClick={() =>
                  setShowDialog({ id: randId('Location'), params: {} })
                }
              >
                Locations
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup
            title="Plot"
            className="gap-x-4"
            style={{ alignItems: 'flex-start' }}
          >
            {/* <ToolbarButton
              onClick={() =>
                setShowDialog({
                  id: randId('oncoplot'),
                  params: { type: 'oncoplot' },
                })
              }
              title="Create Oncoplot"
            >
              <PlayIcon />
              <span>Oncoplot</span>
            </ToolbarButton> */}

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

            {/* <ToolbarButton
              aria-label="Create a location oncoplot"
              onClick={() =>
                setShowDialog({
                  id: randId('looncoplot'),
                  params: { type: 'loconcoplot' },
                })
              }
            >
              Location Oncoplot
            </ToolbarButton> */}
          </ToolbarTabGroup>

          <ToolbarSeparator />
        </>
      ),
    },
  ]

  // const rightTabs: ITab[] = [
  //   {
  //     // id: randId(),
  //     icon: <LayerIcon />,
  //     name: "Groups",
  //     content: (
  //       <GroupsPanel
  //         df={history.step.dataframe}
  //         groups={groups}
  //         onGroupsChange={groupsDispatch}
  //         selection={selection}
  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <FilterIcon />,
  //     name: "Filter Table",
  //     content: (
  //       <FilterPanel
  //         df={history.step.dataframe}

  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <ClockRotateLeftIcon />,
  //     name: "History",
  //     content: (
  //       <HistoryPanel />
  //     ),
  //   },
  // ]

  // const plotRightTabs: ITab[] = [
  //   {
  //     icon: <SlidersIcon />,
  //     label: "Display",
  //     content: (
  //       <DisplayPropsPanel
  //         cf={clusterFrame.cf}
  //         displayProps={displayProps}
  //         onChange={props => setDisplayProps(props)}
  //       />
  //     ),
  //   },
  // ]

  // let svgPanel: ReactNode = null
  // if (clusterFrame.cf) {
  //   // switch (clusterFrame.type) {
  //   // case "heatmap":
  //   svgPanel = (
  //     <HeatMapSvg
  //       ref={svgRef}
  //       cf={clusterFrame.cf}
  //       groups={groups}
  //       search={search}
  //       displayProps={displayProps}
  //     />
  //   )

  // }

  // const topTabs: ITab[] = [
  //   {
  //     id: nanoid(),
  //     icon: <TableIcon className="fill-theme" />,
  //     name: "Data",
  //     content: (
  //       <DataPanel />

  //     ),
  //   },
  // ]

  // plotState.plots.forEach((plot: IPlot) => {
  //   topTabs.push({
  //     id: nanoid(),
  //     name: plot.name,
  //     icon: <ChartIcon className="fill-theme" />,
  //     onDelete: () => plotsDispatch({ type: "remove", id: plot.id }),
  //     content: (
  //       <OncoplotPanelWrapper
  //         panelId={plot.name}
  //         oncoProps={oncoQuery.data}
  //         mutationFrame={plot.mutationFrame}
  //         clinicalTracks={plot.clinicalTracks}
  //         displayProps={plot.displayProps}
  //       />
  //     ),
  //   })
  // })

  // useEffect(() => {
  //   const plotChildren: ITab[] = []

  //   plotsState.plots.forEach(plot => {
  //     plotChildren.push({
  //       id: NANOID12(),
  //       name: plot.name,
  //       icon: <ChartIcon className="fill-theme" />,
  //       onDelete: () => plotsDispatch({ type: 'remove', id: plot.id }),
  //       content: (
  //         <OncoplotPanel panelId={plot.id} oncoProps={oncoQuery.data!} />
  //       ),
  //     })
  //   })

  //   const tab: ITab = {
  //     ...makeFoldersRootNode(),
  //     children: [
  //       dataTab,
  //       {
  //         ////name: nanoid(),
  //         id: 'Plots',
  //         icon: <FolderIcon />,
  //         isOpen: true,
  //         children: plotChildren,
  //       },
  //     ],
  //   }

  //   setFoldersTab(tab)

  //   console.log(tab)

  //   // if the children
  //   if (plotChildren.length > 0) {
  //     setTab(plotChildren[plotChildren.length - 1])
  //   } else {
  //     setTab(dataTab)
  //   }
  // }, [plotsState])

  // plots.plots.forEach(plot => {
  //   switch (plot.type) {
  //     case "Heatmap":
  //     case "Dot Plot":
  //       topTabs.push({
  //         // id: randId(),
  //         name: plot.name,
  //         onDelete: () => plotsDispatch({ type: "remove", id: plot.id }),
  //         content: (
  //           <OncoplotPanel
  //             id={plot.name}
  //             plot={plot}
  //             groups={groups}
  //           />
  //         ),
  //       })
  //       break
  //     case "Volcano Plot":
  //       topTabs.push({
  //         // id: randId(),
  //         name: plot.name,
  //         onDelete: () => plotsDispatch({ type: "remove", id: plot.id }),
  //         content: (
  //           <VolcanoPanel
  //             id={plot.name}
  //             plot={plot}
  //           />
  //         ),
  //       })
  //       break
  //     default:
  //     // do nothing
  //   }
  // })

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: randId('open'), params: {} })}
        >
          <UploadIcon stroke="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      //name: nanoid(),
      id: '<divider>',
    },
    {
      //id: nanoid(),
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
                source: MODULE_INFO.name,
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
                source: MODULE_INFO.name,
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

  console.log('onco refresh check', showDialog.id)

  return (
    <>
      {(showDialog.id.startsWith('open:') ||
        showDialog.id.includes('Location') ||
        showDialog.id.includes('clinical')) && (
        <OpenFiles
          message={showDialog.id}
          //onOpenChange={() => setShowDialog({...NO_DIALOG})}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) =>
              parseFiles(message, files)
            )
          }
        />
      )}

      {/* {showDialog.id.includes('oncoplot') && (
        <OncoPlotDialog
          type={showDialog.params!.type as OncoplotType}
          onPlot={(type: OncoplotType) => {
            setShowDialog({ ...NO_DIALOG })

            if (type === 'loconcoplot') {
              locationOncoplot()
            } else {
              //oncoplot()
            }
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )} */}

      <HeaderSlotPortal slot="header-left">
        <ModuleInfoButton info={MODULE_INFO} />
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

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
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
                    source: MODULE_INFO.name,
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
