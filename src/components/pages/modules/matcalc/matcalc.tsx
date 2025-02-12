'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@components/toolbar/toolbar-optional-dropdown-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { makeGCT } from '@lib/dataframe/dataframe-utils'

import {
  APP_NAME,
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_HELP,
  TEXT_HOME,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/shadcn/ui/themed/dropdown-menu'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { type IClusterFrame } from '@lib/math/hcluster'
import {
  currentBranch,
  currentSheet,
  currentSheets,
  currentStep,
  getCurrentStep,
  HISTORY_STEP_TYPE_OPEN,
  HistoryContext,
  newPlot,
  type IHistItemAddr,
} from '@providers/history-provider'

import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { OpenDialog } from '@/components/pages/modules/matcalc/open-dialog'
import { ShortcutLayout } from '@layouts/shortcut-layout'

import { GeneConvertDialog } from './gene-convert-dialog'
import { DotPlotDialog } from './modules/heatmap/dot-plot-dialog'
import { HeatMapDialog } from './modules/heatmap/heatmap-dialog'
import { VolcanoDialog } from './modules/volcano/volcano-dialog'
import { SortRowDialog } from './sort-row-dialog'
import { TopRowsDialog } from './top-rows-dialog'

import { SlideBar, SlideBarContent } from '@/components/slide-bar/slide-bar'
import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import {
  SelectionRangeContext,
  SelectionRangeProvider,
} from '@components/table/use-selection-range'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { makeRandId } from '@lib/utils'
import axios from 'axios'

import { GroupsContext, GroupsProvider } from './groups-provider'
import { HeatMapPanel } from './modules/heatmap/heatmap-panel'
import { MotifToGeneDialog } from './modules/motif-to-gene/motif-to-gene-dialog'

import { VolcanoPanel } from './modules/volcano/volcano-panel'
import { type PlotStyle } from './plots-provider'

import { HelpIcon } from '@/components/icons/help-icon'
import { ImageIcon } from '@/components/icons/image-icon'
import {
  MessageContext,
  MessagesProvider,
} from '@/components/pages/message-provider'

import { BoxWhiskerChartIcon } from '@/components/icons/box-whisker-chart-icon'
import { DataSortIcon } from '@/components/icons/data-sort-icon'
import { DownloadIcon } from '@/components/icons/download-icon'
import { FileIcon } from '@/components/icons/file-icon'
import { FileImageIcon } from '@/components/icons/file-image-icon'
import { FilterIcon } from '@/components/icons/filter-icon'
import { HeatmapChartIcon } from '@/components/icons/heatmap-chart-icon'
import { OpenIcon } from '@/components/icons/open-icon'
import { TableIcon } from '@/components/icons/table-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import { BaseCol } from '@/components/layout/base-col'
import { ToastSpinner } from '@/components/shadcn/ui/themed/toast'
import { HelpSlideBar } from '@/components/slide-bar/help-slide-bar'
import {
  dfLog,
  dfRowZScore,
  dfStdev,
  dfTranspose,
} from '@/components/table/dataframe-ui'
import { useToast } from '@/hooks/use-toast'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  type OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import { snrRankGenes } from '@/lib/gsea/gsea'
import { textToLines } from '@/lib/text/lines'
import { SearchFilterProvider } from '@/providers/search-filter-provider'
import { TransposeIcon } from '@components/icons/transpose-icon'
import { ShowSideButton } from '@components/pages/show-side-button'
import { Tabs, TabsContent } from '@components/shadcn/ui/themed/tabs'
import { getTabName, type ITab } from '@components/tab-provider'
import { VScrollPanel } from '@components/v-scroll-panel'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { Folder } from 'lucide-react'
import { DEFAULT_EXT_GSEA_PROPS } from '../gene/gsea/ext-gsea-store'
import { DataPanel } from './data-panel'
import { GenesetsContext, GenesetsProvider } from './genesets-provider'
import {
  MatcalcSettingsContext,
  MatcalcSettingsProvider,
} from './matcalc-settings-provider'
import MODULE_INFO from './module.json'
import { BoxPlotDialog } from './modules/boxplot/boxplot-dialog'
import { BoxPlotPanel } from './modules/boxplot/boxplot-panel'
import { ExtGseaPanel } from './modules/gsea/ext-gsea-panel'

interface IClusterFrameProps {
  cf: IClusterFrame | null
  type: PlotStyle
  //params: IFieldMap
}

export const NO_CF: IClusterFrameProps = {
  cf: null,
  type: 'Heatmap',
  //
}

const HELP_URL = '/help/modules/matcalc'

export const HIGHLIGHT_PANEL_CLS = 'bg-muted grow p-3 mb-2 rounded-lg'

export const DEFAULT_TABLE_NAME = 'Table 1'

export const TAB_DATA_TABLES = 'Data Tables'
export const TAB_PLOTS = 'Plots'

// const DEFAULT_DATA_TABLE_TAB: ITab = {
//   //id: nanoid(),
//   id: DEFAULT_TABLE_NAME,
//   icon: <TableIcon />,
//   isOpen: true,
// }

const DEFAULT_DATA_TABLES_TAB: ITab = {
  //id: nanoid(),
  id: TAB_DATA_TABLES,
  icon: <Folder className="w-5" strokeWidth={1.5} />,
  isOpen: true,
  children: [],
}

const DEFAULT_TREE_TAB: ITab = {
  ...makeFoldersRootNode(),
  children: [{ ...DEFAULT_DATA_TABLES_TAB }],
}

const PLOTS_TAB: ITab = {
  //id: nanoid(),
  id: 'Plots',
  icon: <Folder className="w-5" strokeWidth={1.5} />,

  //content: <DataPanel />,
  isOpen: true,
}

function MatcalcPage() {
  const queryClient = useQueryClient()

  const { history, historyDispatch } = useContext(HistoryContext)

  //const { plotsState, plotsDispatch } = useContext(PlotsContext)
  const { toast } = useToast()
  //const {toast} = useToast()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const { settings: matcalcSettings, updateSettings: updateMatcalcSettings } =
    useContext(MatcalcSettingsContext)

  const [treeFoldersTab, setTreeFoldersTab] = useState<ITab>(DEFAULT_TREE_TAB)
  const [dataTableTab, setDataTableTab] = useState<ITab | undefined>(undefined)
  const [selectedTab, setSelectedTab] = useState<ITab | undefined>(undefined)
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)

  const [selection] = useContext(SelectionRangeContext)

  const [toolbarTabName, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  // const [displayProps, setDisplayProps] = useState<IHeatMapProps>(
  //   DEFAULT_DISPLAY_PROPS,
  // )

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showHelp, setShowHelp] = useState(false)

  const { groupState, groupsDispatch } = useContext(GroupsContext)

  const { genesetState, genesetDispatch } = useContext(GenesetsContext)

  const { messageDispatch } = useContext(MessageContext)

  const extGseaWorkerRef = useRef<Worker | null>(null)

  useEffect(() => {
    extGseaWorkerRef.current = new Worker(
      new URL('./modules/gsea/ext-gsea.worker.ts', import.meta.url)
    )

    return () => {
      // Terminate the worker when component unmounts
      extGseaWorkerRef.current?.terminate()
      extGseaWorkerRef.current = null
    }
  }, [])

  async function loadZTestData() {
    let res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/z_table.txt'),
    })

    const lines = textToLines(res.data)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: 'open',
      description: `Load "Z Test"`,
      sheets: [table.setName('Z Test')],
    })

    res = await queryClient.fetchQuery({
      queryKey: ['groups'],
      queryFn: () => axios.get('/data/test/groups.json'),
    })

    groupsDispatch({ type: 'set', groups: res.data })
  }

  async function loadDeseqTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/deseq2.tsv'),
    })

    const lines = textToLines(res.data)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: 'open',
      description: `Load "Deseq Test"`,
      sheets: [table.setName('Deseq Test')],
    })
  }

  async function loadGeneTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/geneconv.txt'),
    })

    const lines = textToLines(res.data)

    const table = new DataFrameReader().read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: HISTORY_STEP_TYPE_OPEN,
      description: `Load "Gene Test"`,
      sheets: [table.setName('Gene Test')],
    })
  }

  async function loadExtGseaTestData() {
    let res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/extgsea/vst_tpm0-01_in_3.tsv'),
    })

    const lines = textToLines(res.data)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: HISTORY_STEP_TYPE_OPEN,
      description: `Load "Ext GSEA Test"`,
      sheets: [table.setName('Ext GSEA Test')],
    })

    res = await queryClient.fetchQuery({
      queryKey: ['groups'],
      queryFn: () => axios.get('/data/test/extgsea/groups.json'),
    })

    groupsDispatch({ type: 'set', groups: res.data })

    res = await queryClient.fetchQuery({
      queryKey: ['genesets'],
      queryFn: () => axios.get('/data/test/extgsea/genesets.json'),
    })

    genesetDispatch({ type: 'set', genesets: res.data })
  }

  // useEffect(() => {
  //   // if file opened, reset groups. you should open groups after opening a table
  //   if (history.steps.length <2 && currentStep(history)[0]!.type === HISTORY_STEP_TYPE_OPEN) {
  //     groupsDispatch({ type: 'clear' })
  //   }
  // }, [currentStep(history)])

  // useEffect(() => {
  //   if (historyAction === 'reset') {
  //     const tab: ITab = {
  //       ...DEFAULT_DATA_TABLE_TAB,
  //       id: history.steps[0]?.sheets[0]?.id ?? DEFAULT_TABLE_NAME,
  //       children: [{ ...PLOTS_TAB }],
  //     }

  //     setDataTableTab(tab)

  //     setSelectedTab(tab)

  //     const tablesTabs: ITab = {
  //       //id: nanoid(),
  //       id: TAB_DATA_TABLES,
  //       icon: <FolderIcon />,

  //       isOpen: true,
  //       children: [tab],
  //     }

  //     const treeTabs: ITab = {
  //       ...treeFoldersTab,
  //       children: [tablesTabs],
  //     }

  //     setTreeFoldersTab(treeTabs)

  //     selectionRangeDispatch({ type: 'clear' })
  //   }
  //   //setClusterFrame(NO_CF)
  // }, [historyAction])

  useEffect(() => {
    if (!treeFoldersTab) {
      return
    }

    const branch = currentBranch(history)

    if (branch[1] === -1) {
      return
    }

    const step = currentStep(history)

    if (step[1] === -1) {
      return
    }

    // const plotChildrenFromPlotState: ITab[] = plotsState.plots.map(plot => ({
    //   id: plot.id,
    //   name: plot.name, //plot.name,
    //   icon: <ImageIcon />,
    //   onDelete: () => {
    //     plotsDispatch({ type: 'remove', id: plot.id })
    //   },

    //   isOpen: true,
    // }))

    const plotChildrenFromHistory: ITab[] = step[0]!.plots
      .map((id) => step[0]!.plotMap[id]!)
      .map((plot) => ({
        id: plot.id,
        name: plot.name, //plot.name,
        icon: <ImageIcon />,
        onDelete: () => {
          historyDispatch({
            type: 'remove-plot',
            plotId: plot.id,
          })
        },

        isOpen: true,
      }))

    const plotChildren = plotChildrenFromHistory

    const tableTab: ITab = {
      id: branch[0]!.id,
      icon: <TableIcon />,
      name: branch[0]!.name,
      children: [
        { ...PLOTS_TAB, children: plotChildren },
        // ...branch[0]!.steps.map(step => ({
        //   id: step.id,
        //   icon: <TableIcon />,
        //   name: step.name,
        // })),
      ],
    }

    setDataTableTab(tableTab)

    const dataTablesTab = {
      ...treeFoldersTab.children![0]!,
      children: [tableTab],
    }

    const tab: ITab = {
      ...treeFoldersTab,
      children: [dataTablesTab],
    }

    setTreeFoldersTab(tab)

    //if a plot was added, select tab, otherwise the table node
    //TODO: fix auto selection in tree

    //console.log(history.actions[history.actions.length - 1])

    const lastHistoryAction = history.actions[history.actions.length - 1]!

    // if the history says we just added a plot, then try to select it
    if (lastHistoryAction.includes('open')) {
      // otherwise select the
      setSelectedTab(tableTab)
    } else if (lastHistoryAction.includes('add-plot')) {
      const plotsTab = tableTab.children![0]!

      setSelectedTab(plotsTab.children![plotsTab.children!.length - 1]!)
    } else if (lastHistoryAction.includes('remove-plot')) {
      const plotsTab = tableTab.children![0]!

      if (plotsTab.children!.length > 0) {
        setSelectedTab(plotsTab.children![plotsTab.children!.length - 1]!)
      } else {
        // no children so go to table
        setSelectedTab(tableTab)
      }
    } else {
      // do nothing
    }

    //setSelectedTab(tableTab)
  }, [history])

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
      onFailure: () => {
        toast({
          title: MODULE_INFO.name,
          description:
            'Your files could not be opened. Check they are formatted correctly.',
          variant: 'destructive',
        })
      },
    })

    // remove existing plots
    //plotsDispatch({ type: 'clear' })

    setShowFileMenu(false)

    //setFilesToOpen([])

    setShowDialog({ ...NO_DIALOG })
  }

  function gct() {
    let df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    df = makeGCT(df)

    historyDispatch({
      type: 'add-step',
      description: df.name,
      sheets: [df],
    })

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    const dataframes = currentSheets(history)[0]!

    const dfOverlaps = createOverlapTableFromDataframes(dataframes, mode)

    if (dfOverlaps) {
      historyDispatch({
        type: 'add-sheets',
        //description: dfOverlaps.name,
        sheets: dfOverlaps,
      })
    }

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function overlapOneWay() {
    const dataframes = currentSheets(history)[0]!

    const dfOverlaps = oneWayFromDataframes(dataframes)

    if (dfOverlaps) {
      console.log(dfOverlaps, 'boop')

      historyDispatch({
        type: 'add-sheets',

        sheets: dfOverlaps,
      })
    }
  }

  function runExtGsea() {
    const df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    if (groupState.groups.size < 2) {
      toast({
        title: 'Extended GSEA',
        description: 'You need 2 groups/phenotypes.',
        variant: 'destructive',
      })
      return
    }

    if (genesetState.genesets.size < 2) {
      toast({
        title: 'Extended GSEA',
        description: 'You need 2 gene sets.',
        variant: 'destructive',
      })
      return
    }

    /* const { dismiss: dismissSpinnerToast } = toast({
      title: 'Extended GSEA',
      description: (
        <ToastSpinner>
          Running extended GSEA, please do not refresh your browser window...
        </ToastSpinner>
      ),
      durationMs: 60000,
    })

    setTimeout(() => {
      const group1 = groupState.groups[groupState.order[0]!]!
      const group2 = groupState.groups[groupState.order[1]!]!

      const rankedGenes = rankGenes(df, group1, group2)

      const extGsea = new ExtGSEA(rankedGenes)

      const gs1 = genesetState.genesets[genesetState.order[0]!]!
      const gs2 = genesetState.genesets[genesetState.order[1]!]!

      // run and cache results
      extGsea.runExtGsea(gs1, gs2)

      dismissSpinnerToast()

      plotsDispatch({
        type: 'add',
        style: 'Extended GSEA',
        //cf: { df },
        customProps: { extGsea },
      })
    }, 1000) */

    if (extGseaWorkerRef.current) {
      const { dismiss: dismissSpinnerToast } = toast({
        title: 'Extended GSEA',
        description: (
          <ToastSpinner>
            Running extended GSEA, please do not refresh your browser window...
          </ToastSpinner>
        ),
        durationMs: 60000,
      })

      const group1 = groupState.groups.get(groupState.order[0]!)!
      const group2 = groupState.groups.get(groupState.order[1]!)!

      const rankedGenes = snrRankGenes(df, group1, group2)

      const gs1 = genesetState.genesets.get(genesetState.order[0]!)!
      const gs2 = genesetState.genesets.get(genesetState.order[1]!)!

      extGseaWorkerRef.current.onmessage = function (e) {
        const { extGseaRes, gseaRes1, gseaRes2 } = e.data

        // plotsDispatch({
        //   type: 'add',
        //   style: 'Extended GSEA',
        //   //cf: { df },
        //   customProps: {
        //     rankedGenes,
        //     gs1,
        //     gs2,
        //     extGseaRes,
        //     gseaRes1,
        //     gseaRes2,
        //   },
        // })

        const plot = {
          ...newPlot('Extended GSEA'),
          customProps: {
            rankedGenes,
            gs1,
            gs2,
            extGseaRes,
            gseaRes1,
            gseaRes2,
            displayOptions: { ...DEFAULT_EXT_GSEA_PROPS },
          },
        }

        historyDispatch({ type: 'add-plots', plots: plot })

        // we've finished so get rid of the animations
        dismissSpinnerToast()
      }

      extGseaWorkerRef.current.postMessage({ rankedGenes, gs1, gs2 })
    }
  }

  function makeClusterMap(isClusterMap: boolean) {
    const df = currentSheet(history)[0]!

    // if (df.shape[0] > MAX_HEATMAP_DIM) {
    //   toast({
    //     type: 'set',
    //     alert: makeErrorAlert({
    //       title: MODULE_INFO.name,
    //       content: `You cannot plot a table with more than ${MAX_HEATMAP_DIM} rows.`,
    //       size: 'dialog',
    //     }),
    //   })
    //   return
    // }

    // if (df.shape[1] > MAX_HEATMAP_DIM) {
    //   toast({
    //     type: 'set',
    //     alert: makeErrorAlert({
    //       title: MODULE_INFO.name,
    //       content: `You cannot plot a table with more than ${MAX_HEATMAP_DIM} columns.`,
    //       size: 'dialog',
    //     }),
    //   })
    //   return
    // }

    setShowDialog({ id: makeRandId('heatmap'), params: { df, isClusterMap } })
  }

  function makeDotPlot() {
    if (groupState.groups.size === 0) {
      setShowDialog({
        id: makeRandId('alert'),
        params: { title: APP_NAME, message: 'You must create some groups.' },
      })
      return
    }

    setShowDialog({ id: makeRandId('dotplot'), params: {} })
  }

  function makeVolcanoPlot() {
    const df = currentSheet(history)[0]!

    if (df.index.type !== 'data') {
      toast({
        title: MODULE_INFO.name,
        description:
          'You must load a table using the first column as the index when creating a volcano plot.',
        variant: 'destructive',
      })

      return
    }

    setShowDialog({ id: makeRandId('volcano'), params: { df } })
  }

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

  // function adjustScale(index: number, scale: number) {
  //   setScaleIndex(index)
  //   setDisplayProps({ ...displayProps, scale })
  // }

  function transpose() {
    dfTranspose(currentSheet(history)[0]!, historyDispatch)
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_HOME,
      //size: 2.1,
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: makeRandId('open'),
                  })
                }
              }}
            />

            <ToolbarIconButton
              title="Download"
              onClick={() => {
                messageDispatch({
                  type: 'set',
                  message: {
                    source: 'matcalc',
                    target: selectedTab?.id ?? '',
                    text: 'save',
                  },
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Plot">
            <ToolbarButton
              onClick={() => makeClusterMap(false)}
              title="Make a heatma from the current table"
            >
              <HeatmapChartIcon />
              <span>Heatmap</span>
            </ToolbarButton>
            <ToolbarButton
              title="Make a dot plot from the current table"
              onClick={() => makeDotPlot()}
            >
              Dot
            </ToolbarButton>

            <ToolbarButton
              title="Make a volcano plot from the current table"
              onClick={() => makeVolcanoPlot()}
            >
              Volcano
            </ToolbarButton>

            <ToolbarButton
              title="Make a box plot plot from table"
              onClick={() =>
                setShowDialog({ id: makeRandId('box-whiskers'), params: {} })
              }
            >
              <BoxWhiskerChartIcon />
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    {
      //id: nanoid(),
      id: 'Data',
      //size: 2,
      content: (
        <>
          <ToolbarTabGroup title="Matrix">
            <ToolbarIconButton
              title="Transpose table"
              onClick={() => transpose()}
            >
              <TransposeIcon />
            </ToolbarIconButton>

            <ToolbarOptionalDropdownButton
              icon="Log2(x)"
              onMainClick={() =>
                dfLog(currentSheet(history)[0]!, historyDispatch, 2, 1)
              }
            >
              <DropdownMenuItem
                aria-label="Log2(x)"
                onClick={() =>
                  dfLog(currentSheet(history)[0]!, historyDispatch, 2, 0)
                }
              >
                Log2(x)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log2(x+1)"
                onClick={() =>
                  dfLog(currentSheet(history)[0]!, historyDispatch, 2, 1)
                }
              >
                Log2(x+1)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log10(x)"
                onClick={() =>
                  dfLog(currentSheet(history)[0]!, historyDispatch, 10, 0)
                }
              >
                Log10(x)
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Log10(x+1)"
                onClick={() =>
                  dfLog(currentSheet(history)[0]!, historyDispatch, 10, 1)
                }
              >
                Log10(x+1)
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Rows">
            <ToolbarIconButton
              title="Filter top rows using statistics"
              onClick={() =>
                setShowDialog({ id: makeRandId('top-rows'), params: {} })
              }
            >
              <FilterIcon />
              {/* <span>Top Rows</span> */}
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Sort table columns by specific rows"
              onClick={() =>
                setShowDialog({ id: makeRandId('sort-row'), params: {} })
              }
            >
              <DataSortIcon />
              {/* <span>Sort By Rows</span> */}
            </ToolbarIconButton>

            <ToolbarButton
              title="Add row standard deviation column to table"
              onClick={() =>
                dfStdev(currentSheet(history)[0]!, historyDispatch)
              }
            >
              Stdev
            </ToolbarButton>
            <ToolbarButton
              title="Transform table to row z-scores"
              onClick={() =>
                dfRowZScore(currentSheet(history)[0]!, historyDispatch)
              }
            >
              Z-score
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    {
      //id: nanoid(),
      id: 'Gene',
      //size: 2,
      content: (
        <>
          <ToolbarTabGroup title="Annotation">
            <ToolbarButton
              title="Convert gene symbols between mouse and human"
              onClick={() =>
                setShowDialog({ id: makeRandId('mouse-human'), params: {} })
              }
            >
              Convert Species
            </ToolbarButton>

            <ToolbarButton
              title="Convert motifs to gene symbols"
              onClick={() =>
                setShowDialog({ id: makeRandId('motif-to-gene'), params: {} })
              }
            >
              Motif To Gene
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="GSEA">
            <ToolbarButton
              title="Run extended GSEA"
              onClick={() => runExtGsea()}
            >
              Extended GSEA
            </ToolbarButton>

            <ToolbarButton
              title="Convert matrix to GCT format"
              onClick={() => gct()}
            >
              GCT
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    {
      //id: nanoid(),
      id: 'Genomic',
      //size: 2,
      content: (
        <>
          <ToolbarTabGroup title="Overlap">
            <ToolbarButton
              title="Calculate minimum common regions for columns of genomic coordinates"
              onClick={() => overlapGenomicLocations('mcr')}
            >
              MCR
            </ToolbarButton>
            <ToolbarButton
              aria-label="Calculate maximum overlap regions for columns of genomic coordinates"
              onClick={() => overlapGenomicLocations('max')}
            >
              Min/Max
            </ToolbarButton>

            <ToolbarButton
              title="Perform a one way overlap of files"
              onClick={() => overlapOneWay()}
            >
              One Way
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    {
      id: 'Help',
      content: (
        <>
          <ToolbarTabGroup title="Help">
            <ToolbarButton
              onClick={() => setShowHelp(true)}
              title="Get help using MatCalc"
            >
              <HelpIcon /> <span>{TEXT_HELP}</span>
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon stroke="" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: makeRandId('open'), params: {} })}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
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
                  target: dataTableTab?.id ?? '',
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
            aria-label={TEXT_DOWNLOAD_AS_CSV}
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: dataTableTab?.id ?? '',
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
                  target: selectedTab?.id ?? '',
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
                  target: selectedTab?.id ?? '',
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

  const mainContent = useMemo(() => {
    const branch = currentBranch(history)

    if (branch[0] === null) {
      return null
    }

    const step = getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return null
    }

    // console.log(
    //   step[0]!.plots,
    //   step[0]!.plotMap,
    //   selectedTab?.id,
    //   step[0]!.plots.map(id => step[0]!.plotMap[id]!)
    // )

    return (
      <Tabs
        //defaultValue={selectedTab.id}
        value={selectedTab?.id ?? ''}
        className="min-h-0 h-full flex flex-col grow"
      >
        {dataTableTab && (
          <TabsContent value={dataTableTab.id} asChild>
            <DataPanel panelId={dataTableTab.id} />
          </TabsContent>
        )}

        {step[0]!.plots
          .map((id) => step[0]!.plotMap[id]!)
          .map((plot) => {
            // construct an address
            const plotAddr: IHistItemAddr = [branch[1], step[1], plot.id]
            switch (plot.style) {
              case 'Heatmap':
              case 'Dot Plot':
                return (
                  <TabsContent value={plot.id} key={plot.id} asChild>
                    <HeatMapPanel
                      //plotId={plot.id}
                      plotAddr={plotAddr}
                      canvasRef={canvasRef}
                      downloadRef={downloadRef}
                    />
                  </TabsContent>
                )
              case 'Volcano':
                return (
                  <TabsContent value={plot.id} key={plot.id} asChild>
                    <VolcanoPanel
                      //plotId={plot.id}
                      plotAddr={plotAddr}
                      canvasRef={canvasRef}
                      downloadRef={downloadRef}
                    />
                  </TabsContent>
                )
              case 'Box Plot':
                return (
                  <TabsContent value={plot.id} key={plot.id} asChild>
                    <BoxPlotPanel
                      plotAddr={plotAddr}
                      canvasRef={canvasRef}
                      downloadRef={downloadRef}
                    />
                  </TabsContent>
                )
              case 'Extended GSEA':
                return (
                  <TabsContent value={plot.id} key={plot.id} asChild>
                    <ExtGseaPanel
                      plotAddr={plotAddr}
                      canvasRef={canvasRef}
                      downloadRef={downloadRef}
                    />
                  </TabsContent>
                )
              default:
                return null
            }
          })}
      </Tabs>
    )
  }, [selectedTab, history])

  const sideContent = useMemo(() => {
    return (
      <BaseCol className="pl-2 grow">
        <VScrollPanel className="grow">
          <CollapseTree
            tab={treeFoldersTab}
            value={selectedTab}
            showRoot={false}
            onValueChange={(tab) => {
              // only change view if tab is a leaf (no children)
              // since this will be an actual table or plot
              if (
                tab &&
                (!tab.children ||
                  (tab.children.length > 0 &&
                    getTabName(tab.children[0]!) === 'Plots'))
              ) {
                setSelectedTab(tab)
              }
            }}

            ///asChild={false}
          />
        </VScrollPanel>
      </BaseCol>
    )
  }, [treeFoldersTab, selectedTab])

  //console.log('render check')

  return (
    <>
      {showDialog.id.startsWith('open-file-dialog') && (
        <OpenDialog
          files={showDialog.params!.files as ITextFileOpen[]}
          openFiles={(files, options) => {
            openFiles(files, options)
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => {
            //setFilesToOpen([])
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.startsWith('top-rows') && (
        <TopRowsDialog
          df={currentSheet(history)[0]!}
          onFilter={() => {
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('heatmap') && (
        <HeatMapDialog
          isClusterMap={showDialog.params!.isClusterMap as boolean}
          df={showDialog.params!.df as BaseDataFrame}
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('dotplot') && (
        <DotPlotDialog
          df={currentSheet(history)[0]!}
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('volcano') && (
        <VolcanoDialog
          df={showDialog.params!.df as BaseDataFrame}
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('box-whiskers') && (
        <BoxPlotDialog
          df={currentSheet(history)[0]!}
          // onPlot={(df, x, y, hue, xOrder, hueOrder) => {
          //   setShowDialog({ ...NO_DIALOG })

          //   // we need props for each hue of each x for each plot

          // }}
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('mouse-human') && (
        <GeneConvertDialog
          df={currentSheet(history)[0]!}
          selection={selection}
          onConversion={() => setShowDialog({ ...NO_DIALOG })}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('motif-to-gene') && (
        <MotifToGeneDialog
          df={currentSheet(history)[0]!}
          selection={selection}
          onConversion={() => setShowDialog({ ...NO_DIALOG })}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('sort-row') && (
        <SortRowDialog
          df={currentSheet(history)[0]!}
          selection={selection}
          onSort={() => setShowDialog({ ...NO_DIALOG })}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('alert') && (
        <BasicAlertDialog onReponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as ReactNode}
        </BasicAlertDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} showSignInError={false}>
        <Toolbar
          value={toolbarTabName}
          onTabChange={(selectedTab) => {
            if (selectedTab) {
              setToolbarTab(selectedTab.tab.id)
            }
          }}
          tabs={tabs}
        >
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            leftShortcuts={
              <>
                <ShowSideButton
                  onClick={() => setFoldersIsOpen(!foldersIsOpen)}
                />
                <UndoShortcuts />
              </>
            }
            rightShortcuts={
              <DropdownMenu>
                <DropdownMenuTrigger>Test Data</DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => loadZTestData()}>
                    Plot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadDeseqTestData()}>
                    Deseq
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadGeneTestData()}>
                    Genes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadExtGseaTestData()}>
                    Ext GSEA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                show={matcalcSettings.data.sidebar.show}
                onClick={() => {
                  const newSettings = produce(matcalcSettings, (draft) => {
                    draft.data.sidebar.show = !draft.data.sidebar.show
                  })

                  updateMatcalcSettings(newSettings)
                }}
              />
            }
          />
        </Toolbar>

        <HelpSlideBar
          open={showHelp}
          onOpenChange={setShowHelp}
          helpUrl={HELP_URL}
          className="grow"
        >
          <SlideBar
            open={foldersIsOpen}
            onOpenChange={setFoldersIsOpen}
            limits={[10, 90]}
            position={15}
            side="Left"
            mainContent={mainContent}
            sideContent={sideContent}
          >
            <SlideBarContent className="grow" />
          </SlideBar>
        </HelpSlideBar>

        {showDialog.id.startsWith('open:') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => {
                setShowDialog({
                  id: makeRandId('open-file-dialog'),
                  params: { files },
                })
              })
            }
          />
        )}
        <a ref={downloadRef} className="hidden" href="#" />
        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function MatcalcQueryPage() {
  return (
    <CoreProviders>
      <MatcalcSettingsProvider>
        <SearchFilterProvider>
          <SelectionRangeProvider>
            <GroupsProvider>
              <GenesetsProvider>
                <MessagesProvider>
                  <MatcalcPage />
                </MessagesProvider>
              </GenesetsProvider>
            </GroupsProvider>
          </SelectionRangeProvider>
        </SearchFilterProvider>
      </MatcalcSettingsProvider>
    </CoreProviders>
  )
}
