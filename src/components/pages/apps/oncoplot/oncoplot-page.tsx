'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { TableIcon } from '@icons/table-icon'

import { ToolbarButton } from '@toolbar/toolbar-button'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { OpenIcon } from '@icons/open-icon'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { FileImageIcon } from '@icons/file-image-icon'
import { SaveIcon } from '@icons/save-icon'

import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'
import { useContext, useEffect, useState } from 'react'

import { ShortcutLayout } from '@layouts/shortcut-layout'

import axios from 'axios'

import { DataPanel } from './data-panel'

import {
  DEFAULT_DISPLAY_PROPS,
  type IOncoColumns,
  type IOncoProps,
} from './oncoplot-utils'
import { PlotsContext, PlotsProvider } from './plots-provider'

import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import { SlideBar } from '@components/slide-bar/slide-bar'
import { ChartIcon } from '@icons/chart-icon'
import { FolderIcon } from '@icons/folder-icon'
import { UploadIcon } from '@icons/upload-icon'
import { findCol, type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { makeNanoIDLen12, randID } from '@lib/id'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { ClinicalDataTrack, makeClinicalTracks } from './clinical-utils'
import { OncoPlotDialog, type OncoplotType } from './oncoplot-dialog'
import { OncoplotPanelWrapper } from './oncoplot-panel'

import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { parseLocation } from '@/lib/genomic/genomic'
import { useMessages } from '@/providers/message-provider'
import type { ITab } from '@components/tabs/tab-provider'
import { VScrollPanel } from '@components/v-scroll-panel'
import { FileIcon } from '@icons/file-icon'
import { BaseCol } from '@layout/base-col'
import { httpFetch } from '@lib/http/http-fetch'
import { textToLines } from '@lib/text/lines'
import { CoreProviders } from '@providers/core-providers'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { findSheet, useHistory } from '../matcalc/history/history-store'
import { UndoShortcuts } from '../matcalc/history/undo-shortcuts'
import MODULE_INFO from './module.json'

function OncoplotPage() {
  const queryClient = useQueryClient()

  const { step, addSheets, openBranch, history } = useHistory()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const dataTab: ITab = {
    //name: nanoid(),
    icon: <TableIcon />,
    id: 'Table 1',
    content: <DataPanel branchId="Table 1" />,
    isOpen: true,
  }
  const [foldersTab, setFoldersTab] = useState<ITab>(dataTab)
  const [tab, setTab] = useState<ITab | undefined>(dataTab)
  const [foldersIsOpen, setShowFolders] = useState(true)
  const [tabName] = useState('Table 1')

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])

  const [displayProps, setDisplayProps] = useState(DEFAULT_DISPLAY_PROPS)

  const [clinicalTracks, setClinicalTracks] = useState<ClinicalDataTrack[]>([])

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { sendMessage } = useMessages() //'onco')

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
    // try {
    //   let res = await queryClient.fetchQuery("test_data", async () => {
    //     return await axios.get(
    //       "/data/test/bcca2024_29cl_20icg_hg19_chr3-187451979-187469971.maf.txt",
    //     )
    //   })

    //   const lines = res.data
    //     .split(/[\r\n]+/g)
    //     .filter((line: string) => line.length > 0)

    //   const table = new DataFrameReader().read(lines)

    //   //resolve({ ...table, name: file.name })

    //   historyDispatch({
    //     type: "reset",
    //     name: `Load "Mutations"`,
    //     sheets: [table.setName("Mutations")],
    //   })
    // } catch (error) {
    //   console.log(error)
    // }

    try {
      let res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () =>
          axios.get(
            '/data/test/adalgisa_oncoplot_20bp_regions_v3.maf.txt' //"/data/test/bcca2024_29cl_20icg_hg19_chr3-187451979-187469971.maf.txt",
          ),
      })

      let lines = textToLines(res.data)

      let table = new DataFrameReader().read(lines)

      //resolve({ ...table, name: file.name })

      openBranch(`Load mutations`, [table.setName('Mutations')])

      res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () =>
          axios.get('/data/test/adalgisa_20bp_windows_for_oncoplot_v3.txt'),
      })

      lines = textToLines(res.data)

      //setLocations(lines.slice(1).map((l: string) => parseLocation(l)))

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      addSheets([table.setName('Locations')])

      res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/adalgisa_clinical_data.txt'),
      })

      lines = textToLines(res.data)

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      setClinicalData(table)

      // get rid of the plot
      plotsDispatch({ type: 'clear' })

      // const table = new DataFrameReader() .read(lines)

      // //resolve({ ...table, name: file.name })
    } catch (error) {
      console.log(error)
    }
  }

  async function loadGeneTestData() {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/onco-plot-test.txt'),
      })

      const lines = textToLines(res.data)

      const table = new DataFrameReader().keepDefaultNA(false).read(lines)

      openBranch(`Load mutations`, [table.setName('Mutations')])

      // get rid of the plot
      plotsDispatch({ type: 'clear' })
    } catch (error) {
      console.log(error)
    }
  }

  async function loadClinicalTestData() {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/onco-plot-clinical-test.txt'),
      })

      const lines = textToLines(res.data)

      const table = new DataFrameReader().keepDefaultNA(false).read(lines)

      setClinicalData(table)

      // get rid of the plot
      plotsDispatch({ type: 'clear' })
    } catch (error) {
      console.log(error)
    }
  }

  function setClinicalData(clinicalTable: BaseDataFrame) {
    const [clinicalTracks, tracksProps] = makeClinicalTracks(clinicalTable)

    setClinicalTracks(clinicalTracks)

    const dp = {
      ...displayProps,
      legend: {
        ...displayProps.legend,
        clinical: { ...displayProps.legend.clinical, tracks: tracksProps },
      },
    }

    setDisplayProps(dp)

    // show sheet in UI
    addSheets([clinicalTable.setName('Clinical')])
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  useEffect(() => {
    //setSelectedSheet(0) //currentStep(history)[0]!.df.length - 1)
    setTab(dataTab)
    //selectionRangeDispatch({ type: 'clear' })
    //setClusterFrame(NO_CF)
  }, [history])

  // useEffect(() => {
  //   if (plotState.plots.length > 0) {
  //     setPanelTab(plotState.plots[plotState.plots.length - 1].name)
  //   }
  // }, [plotState])

  const oncoQuery = useQuery({
    queryKey: ['oncoplot'],
    queryFn: async () => {
      return httpFetch.getJson<IOncoProps>(
        '/data/modules/oncoplot/oncoplot.json'
      )
    },
  })

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
      //  { name: "Mutations", text, ext: name.split(".").pop() || "" },
      //])

      openFiles(
        [{ name: 'Mutations', text, ext: name.split('.').pop() || '' }],
        {
          colNames: 1,
          indexCols: 0,
          delimiter: '\t',
          keepDefaultNA: true,
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

    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openBranch(`Load ${tables[0]!.name}`, tables)
        }
      },
    })

    setShowFileMenu(false)
  }

  function locationOncoplot() {
    const df = findSheet(step!, 'Mutations')!

    console.log(df)

    const locationsDf: BaseDataFrame | undefined = findSheet(step!, 'Locations')

    const locations = locationsDf
      ?.col(0)
      .strs.map((l: string) => parseLocation(l))

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

    console.log(locations, colMap)

    // const [table, legend] = makeLocationOncoPlot(
    //   df,
    //   clinicalDf,
    //   locations,
    //   colMap,
    //   multi,
    //   sort,
    //   removeEmpty,
    //   oncoQuery.data!
    // )

    // const dp = {
    //   ...displayProps,
    //   multi,
    //   legend: {
    //     ...displayProps.legend,
    //     mutations: { ...displayProps.legend.mutations, ...legend },
    //   },
    // }

    // setDisplayProps(dp)

    // plotsDispatch({
    //   type: 'set',
    //   plot: {
    //     mutationFrame: table,
    //     clinicalTracks,
    //     //clinicalTracksColorMaps: [],
    //     displayProps: dp,
    //   },
    // })
  }

  function oncoplot() {
    // Assume first sheet is
    // const df = findSheet('Mutations', step!)[0]!
    // const colMap: IOncoColumns = {
    //   sample: findCol(df, 'Sample'),
    //   chr: findCol(df, 'Chromosome'),
    //   start: findCol(df, 'Start_Position'),
    //   end: findCol(df, 'End_position'),
    //   ref: findCol(df, 'Reference_Allele'),
    //   tum: findCol(df, 'Tumor_Seq_Allele2'),
    //   gene: findCol(df, 'Gene'),
    //   type: findCol(df, 'Type'),
    // }
    // const [table, legend] = makeOncoPlot(
    //   df,
    //   colMap,
    //   multi,
    //   sort,
    //   removeEmpty,
    //   oncoQuery.data!
    // )
    // const dp = {
    //   ...displayProps,
    //   multi,
    //   legend: {
    //     ...displayProps.legend,
    //     mutations: { ...displayProps.legend.mutations, ...legend },
    //   },
    // }
    // setDisplayProps(dp)
    // plotsDispatch({
    //   type: 'add',
    //   plot: {
    //     mutationFrame: table,
    //     clinicalTracks,
    //     displayProps: dp,
    //     //clinicalTracksColorMaps: [],
    //   },
    // })
  }

  const tabs: ITab[] = [
    {
      ////name: nanoid(),
      id: 'Home',
      size: 2.1,
      content: (
        <>
          <ToolbarTabGroup>
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: randID('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title="Save matrix to local file"
              onClick={() => {
                //save("txt")
                sendMessage({
                  source: 'matcalc',
                  target: tabName,
                  text: 'save',
                })
              }}
            >
              <SaveIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Open location data"
              onClick={() =>
                setShowDialog({ id: randID('Location'), params: {} })
              }
            >
              Locations
            </ToolbarButton>
            <ToolbarButton
              aria-label="Open clinical information"
              onClick={() =>
                setShowDialog({ id: randID('clinical'), params: {} })
              }
            >
              Clinical Data
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Create a location oncoplot"
              onClick={() =>
                setShowDialog({
                  id: randID('looncoplot'),
                  params: { type: 'loconcoplot' },
                })
              }
            >
              Loc Oncoplot
            </ToolbarButton>
            <ToolbarButton
              aria-label="Create an oncoplot"
              onClick={() =>
                setShowDialog({
                  id: randID('oncoplot'),
                  params: { type: 'oncoplot' },
                })
              }
            >
              Oncoplot
            </ToolbarButton>
          </ToolbarTabGroup>
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

  useEffect(() => {
    const plotChildren: ITab[] = []

    plotsState.plots.forEach((plot) => {
      plotChildren.push({
        id: makeNanoIDLen12(),
        name: plot.name,
        icon: <ChartIcon className="fill-theme" />,
        onDelete: () => plotsDispatch({ type: 'remove', id: plot.id }),
        content: (
          <OncoplotPanelWrapper
            panelId={plot.id}
            oncoProps={oncoQuery.data!}
            mutationFrame={plot.mutationFrame}
            clinicalTracks={plot.clinicalTracks}
            displayProps={plot.displayProps}
          />
        ),
      })
    })

    const tab: ITab = {
      ...makeFoldersRootNode(),
      children: [
        dataTab,
        {
          ////name: nanoid(),
          id: 'Plots',
          icon: <FolderIcon />,
          isOpen: true,
          children: plotChildren,
        },
      ],
    }

    setFoldersTab(tab)

    console.log(tab)

    // if the children
    if (plotChildren.length > 0) {
      setTab(plotChildren[plotChildren.length - 1])
    } else {
      setTab(dataTab)
    }
  }, [plotsState])

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
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: randID('open'), params: {} })}
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
                  source: 'matcalc',
                  target: 'Data',
                  text: 'save:txt',
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
                source: 'matcalc',
                target: 'Data',
                text: 'save:csv',
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
            aria-label="Download as PNG"
            onClick={() => {
              sendMessage({
                source: 'matcalc',
                target: tabName,
                text: 'save:png',
              })
              // save("txt")}
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as CSV"
            onClick={() => {
              sendMessage({
                source: 'matcalc',
                target: tabName,
                text: 'save:svg',
              })
              // save("txt")}
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  console.log('onco refresh check')

  return (
    <>
      {showDialog.id.includes('oncoplot') && (
        <OncoPlotDialog
          type={showDialog.params!.type as OncoplotType}
          onPlot={(type: OncoplotType) => {
            setShowDialog({ ...NO_DIALOG })

            if (type === 'loconcoplot') {
              locationOncoplot()
            } else {
              oncoplot()
            }
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <ShortcutLayout>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
        </HeaderPortal>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <ToolbarTabButton
                  onClick={() => loadTestData()}
                  title="Load test data to use features."
                >
                  Plot test
                </ToolbarTabButton>

                <ToolbarTabButton
                  onClick={() => loadGeneTestData()}
                  title="Load test data to use features."
                >
                  Gene test
                </ToolbarTabButton>
                <ToolbarTabButton
                  onClick={() => loadClinicalTestData()}
                  title="Load test data to use features."
                >
                  Clinical test
                </ToolbarTabButton>
              </>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  //save("txt")
                  sendMessage({
                    source: 'oncoplot',
                    target: tabName,
                    text: 'show-sidebar',
                  })
                }}
              />
            }
          />
        </Toolbar>
        <SlideBar
          id="onco-folders"
          open={foldersIsOpen}
          onOpenChange={setShowFolders}
          limits={[10, 90]}
          initialPosition={15}
          // mainContent={tab?.content}
          // sideContent={}
        >
          {/* <SlideBarContent /> */}

          <>{tab?.content}</>

          <BaseCol className="pl-2 grow">
            <VScrollPanel className="grow">
              <CollapseTree
                tab={foldersTab}
                value={tab!}
                onValueChange={(t) => {
                  if (t && t.content) {
                    // only use tabs from the tree that have content, otherwise
                    // the ui will appear empty
                    setTab(t)
                  }
                }}
              />
            </VScrollPanel>
          </BaseCol>
        </SlideBar>

        {showDialog.id.includes('open') ||
          showDialog.id.includes('Location') ||
          (showDialog.id.includes('clinical') && (
            <OpenFiles
              open={showDialog.id}
              //onOpenChange={() => setShowDialog({...NO_DIALOG})}
              onFileChange={(message, files) =>
                onTextFileChange(message, files, (files) =>
                  parseFiles(message, files)
                )
              }
            />
          ))}
      </ShortcutLayout>
    </>
  )
}

/** client:only component */
export function OncoplotQueryPage() {
  return (
    <CoreProviders>
      {/* <ZoomProvider> */}

      <PlotsProvider>
        <OncoplotPage />
      </PlotsProvider>

      {/* </ZoomProvider> */}
    </CoreProviders>
  )
}
