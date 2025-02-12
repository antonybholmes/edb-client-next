'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { TableIcon } from '@components/icons/table-icon'

import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { OpenIcon } from '@components/icons/open-icon'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'

import {
  COLOR_BLACK,
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
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { FileImageIcon } from '@components/icons/file-image-icon'
import { SaveIcon } from '@components/icons/save-icon'

import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import {
  currentStep,
  findSheet,
  HistoryContext,
} from '@providers/history-provider'
import { useContext, useEffect, useRef, useState } from 'react'

import { ShortcutLayout } from '@layouts/shortcut-layout'

import axios from 'axios'

import {
  MessageContext,
  MessagesProvider,
} from '@/components/pages/message-provider'
import {
  SelectionRangeContext,
  SelectionRangeProvider,
} from '@components/table/use-selection-range'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { findCol } from '@lib/dataframe/dataframe-utils'
import { DataPanel } from './data-panel'
import { LollipopPanelWrapper } from './lollipop-panel'
import { makeLollipopData, type ILollipopColumns } from './lollipop-utils'
import { PlotsContext, PlotsProvider } from './plots-provider'

import { ChartIcon } from '@components/icons/chart-icon'

import { makeRandId, nanoid } from '@lib/utils'

import { SlideBar, SlideBarContent } from '@/components/slide-bar/slide-bar'
import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import { FolderIcon } from '@components/icons/folder-icon'
import { UploadIcon } from '@components/icons/upload-icon'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { range } from '@lib/math/range'
import {
  ProteinContext,
  ProteinProvider,
  searchProteins,
  type IProtein,
} from './protein-context'

import { FileIcon } from '@/components/icons/file-icon'
import { textToLines } from '@/lib/text/lines'
import type { ITab } from '@components/tab-provider'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import MODULE_INFO from './module.json'

function LollipopPage() {
  const queryClient = useQueryClient()

  const { history, historyDispatch } = useContext(HistoryContext)

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)
  const [, selectionRangeDispatch] = useContext(SelectionRangeContext)

  const dataTab: ITab = {
    id: nanoid(),
    icon: <TableIcon />,
    name: 'Table 1',
    content: <DataPanel />,
    isOpen: true,
  }

  const [foldersTab, setFoldersTab] = useState<ITab>(dataTab)
  const [tab, setTab] = useState<ITab | undefined>(dataTab)
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)
  const [tabName] = useState('Table 1')

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])
  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [proteinState, proteinDispatch] = useContext(ProteinContext)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { messageDispatch } = useContext(MessageContext)

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

    const gene = 'BTG1'

    try {
      const proteins = await searchProteins(queryClient, gene)

      const index = range(proteins.length).filter(
        (i) => proteins[i]!.organism === 'Human'
      )[0]!

      proteinDispatch({
        type: 'set',
        search: { text: gene, results: proteins },
        index,
      })
    } catch (e) {
      console.log(e)
    }

    try {
      let res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/btg1_coding_mutations.txt'),
      })

      let lines = textToLines(res.data)

      let table = new DataFrameReader().keepDefaultNA(false).read(lines)

      historyDispatch({
        type: 'open',
        description: `Load mutations`,
        sheets: [table.setName('Mutations')],
      })

      res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/btg1_features.txt'),
      })

      lines = textToLines(res.data)

      // //setLocations(lines.slice(1).map((l: string) => parseLocation(l)))

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      historyDispatch({
        type: 'add-sheets',
        //sheetId: 'Features',
        //name: "Load features",
        sheets: table.setName('Features'),
      })

      // get rid of the plot
      plotsDispatch({ type: 'clear' })

      // const table = new DataFrameReader() .read(lines)

      // //resolve({ ...table, name: file.name })
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  useEffect(() => {
    setTab(dataTab)
    selectionRangeDispatch({ type: 'clear' })
  }, [history])

  // useEffect(() => {
  //   if (plotState.plots.length > 0) {
  //     setPanelTab(plotState.plots[plotState.plots.length - 1].name)
  //   }
  // }, [plotState])

  function parseFiles(message: string, files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const file = files[0]!
    const name = file.name
    const text = file.text

    if (message.includes('Location')) {
      const lines = textToLines(text)

      const locationTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      historyDispatch({
        type: 'add-sheets',
        //sheetId: 'Locations',
        //name: "Load locations",
        sheets: locationTable.setName('Locations'),
      })
    } else {
      //setFilesToOpen([
      //  { name: "Mutations", text, ext: name.split(".").pop() || "" },
      //])

      openFiles(
        [
          {
            name: 'Mutations',
            text,
            ext: name.split('.').pop() || '',
          },
        ],
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
    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          historyDispatch({
            type: 'open',
            description: `Load ${tables[0]!.name}`,
            sheets: tables,
          })
        }
      },
    })

    setShowFileMenu(false)
  }

  function lollipopPlot() {
    const step = currentStep(history)[0]!
    const mutDf = findSheet('Mutations', step)! //currentSheet(history)[0]!

    let featuresDf: BaseDataFrame | null = null

    try {
      featuresDf = findSheet('Features', step)
    } catch {
      // ignore error
    }

    const protein: IProtein = proteinState.protein

    if (!protein.name) {
      return
    }

    const colMap: ILollipopColumns = {
      sample: findCol(mutDf, 'Sample'),
      aa: findCol(mutDf, 'protein_change'),
      variant: findCol(mutDf, 'Variant_Classification'),
    }

    const df = makeLollipopData(protein, mutDf, featuresDf, colMap)

    df.labels = [
      {
        id: nanoid(),
        name: `${protein.seq[0]}1`,
        start: 1,
        color: COLOR_BLACK,
        show: true,
      },
      {
        id: nanoid(),
        name: `${protein.seq[1]}2`,
        start: 2,
        color: COLOR_BLACK,
        show: true,
      },
      {
        id: nanoid(),
        name: `${protein.seq[9]}10`,
        start: 10,
        color: COLOR_BLACK,
        show: true,
      },
    ]

    plotsDispatch({
      type: 'set',
      plot: { id: nanoid(), df },
    })

    // historyDispatch({
    //   type: "add-step",
    //   name: df.name,
    //   sheets: [df],
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
                    id: makeRandId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              aria-label="Save matrix to local file"
              onClick={() => {
                //save("txt")
                messageDispatch({
                  type: 'set',
                  message: {
                    source: 'lollipop',
                    target: tabName,
                    text: 'save',
                  },
                })
              }}
            >
              <SaveIcon className="-scale-100 fill-foreground" />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Open location data"
              onClick={() =>
                setShowDialog({ id: makeRandId('Location'), params: {} })
              }
            >
              Locations
            </ToolbarButton>
            <ToolbarButton
              aria-label="Open features"
              onClick={() =>
                setShowDialog({ id: makeRandId('features'), params: {} })
              }
            >
              Features
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="grow">
            <ToolbarButton
              aria-label="Create an plot"
              onClick={() =>
                // setShowDialog({
                //   name: makeRandId("plot"),
                //   params: { type: "plot" },
                // })

                lollipopPlot()
              }
            >
              Plot
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
  //         downloadRef={downloadRef}
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
  //     onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //     content: (
  //       <LollipopPanelWrapper
  //         panelId={plot.name}
  //         df={plot.df}
  //         canvasRef={canvasRef}
  //         downloadRef={downloadRef}
  //       />
  //     ),
  //   })
  // })

  useEffect(() => {
    const plotChildren: ITab[] = []

    plotsState.plots.forEach((plot) => {
      plotChildren.push({
        id: nanoid(),
        name: plot.name,
        icon: <ChartIcon className="fill-theme" />,
        onDelete: () => plotsDispatch({ type: 'remove', id: plot.id }),
        content: (
          <LollipopPanelWrapper
            panelId={plot.id}
            df={plot.df}
            canvasRef={canvasRef}
            downloadRef={downloadRef}
          />
        ),
      })
    })

    const tab: ITab = {
      ...makeFoldersRootNode(),
      children: [
        {
          //id: nanoid(),
          id: 'Data Tables',
          icon: <FolderIcon />,
          isOpen: true,
          children: [dataTab],
        },
        {
          //id: nanoid(),
          id: 'Plots',
          icon: <FolderIcon />,
          isOpen: true,
          children: plotChildren,
        },
      ],
    }

    setFoldersTab(tab)

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
  //         onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //         content: (
  //           <OncoplotPanel
  //             id={plot.name}
  //             plot={plot}
  //             groups={groups}
  //             canvasRef={canvasRef}
  //             downloadRef={downloadRef}
  //           />
  //         ),
  //       })
  //       break
  //     case "Volcano Plot":
  //       topTabs.push({
  //         // id: randId(),
  //         name: plot.name,
  //         onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //         content: (
  //           <VolcanoPanel
  //             id={plot.name}
  //             plot={plot}
  //             canvasRef={canvasRef}
  //             downloadRef={downloadRef}
  //           />
  //         ),
  //       })
  //       break
  //     default:
  //     // do nothing
  //   }
  // })

  // const fileMenuTabs: ITab[] = [
  //   {
  //     // id: randId(),
  //     name: "Open",
  //     icon: <OpenIcon fill="" w="w-5" />,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Open</h1>

  //         <ul className="flex flex-col gap-y-2 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Open file on your computer"
  //               onClick={() =>
  //                 setShowDialog({ name: makeRandId("open"), params: {} })
  //               }
  //             >
  //               <OpenIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Open local file
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Open a local file on your computer.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     name: TEXT_SAVE_AS,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Save text file"
  //               onClick={() => {
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "matcalc",
  //                     target: "Data",
  //                     text: "save:txt",
  //                   },
  //                 })
  //                 // save("txt")}
  //               }}
  //             >
  //               <FileLinesIcon className="w-6 fill-blue-300" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as TXT
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a tab-delimited text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Save CSV file"
  //               onClick={() => {
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "matcalc",
  //                     target: "Data",
  //                     text: "save:csv",
  //                   },
  //                 })
  //                 // save("txt")}
  //               }}
  //             >
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as CSV
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a comma separated text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     name: "Export",
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Export</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Download as PNG"
  //               onClick={() =>
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "lollipop",
  //                     target: panelTab,
  //                     text: "save:png",
  //                   },
  //                 })
  //               }
  //             >
  //               <FileImageIcon fill="" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as PNG
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save chart as PNG.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Download as SVG"
  //               onClick={() =>
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "lollipop",
  //                     target: panelTab,
  //                     text: "save:svg",
  //                   },
  //                 })
  //               }
  //             >
  //               <></>
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as SVG
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save chart as SVG.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  // ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon fill="" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: makeRandId('open'), params: {} })}
        >
          <UploadIcon fill="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
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
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: 'Data',
                  text: 'save:txt',
                },
              })
              // save("txt")}
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: 'Data',
                  text: 'save:csv',
                },
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
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: tabName,
                  text: 'save:png',
                },
              })
              // save("txt")}
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as CSV"
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: tabName,
                  text: 'save:svg',
                },
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

  return (
    <>
      {/* <OncoPlotDialog
        open={showDialog.name.includes("plot")}
        type={showDialog.params.type}
        onPlot={(
          type: OncoplotType,
          multi: MultiMode,
          sort: boolean,
          removeEmpty: boolean,
        ) => {
          setShowDialog({...NO_DIALOG})

          lollipopPlot(multi, sort, removeEmpty)
        }}
        onCancel={() => setShowDialog({...NO_DIALOG})}
      /> */}

      <ShortcutLayout info={MODULE_INFO}>
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
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Plot test
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  //save("txt")
                  messageDispatch({
                    type: 'set',
                    message: {
                      source: 'lollipop',
                      target: tabName,
                      text: 'show-sidebar',
                    },
                  })
                }}
              />
            }
          />
        </Toolbar>

        <SlideBar
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 90]}
          position={15}
          className="mt-2 mb-6"
          sideContent={
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
              className="pl-1"
            />
          }
          mainContent={<>{tab?.content}</>}
        >
          <SlideBarContent className="grow pr-2" />
        </SlideBar>

        {(showDialog.id.includes('open') ||
          showDialog.id.includes('Location') ||
          showDialog.id.includes('clinical')) && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) =>
                parseFiles(message, files)
              )
            }
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function LollipopQueryPage() {
  return (
    <CoreProviders>
      <MessagesProvider>
        <SelectionRangeProvider>
          <ProteinProvider>
            <PlotsProvider>
              <LollipopPage />
            </PlotsProvider>
          </ProteinProvider>
        </SelectionRangeProvider>
      </MessagesProvider>
    </CoreProviders>
  )
}
