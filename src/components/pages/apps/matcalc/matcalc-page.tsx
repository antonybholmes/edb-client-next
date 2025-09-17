'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { ToolbarButton } from '@toolbar/toolbar-button'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@toolbar/toolbar-optional-dropdown-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  colZScore,
  log,
  makeGCT,
  rowStdev,
  rowZScore,
  zscore,
} from '@lib/dataframe/dataframe-utils'

import {
  DOCS_URL,
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_HOME,
  TEXT_OPEN_FILE,
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
import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@themed/dropdown-menu'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { type IClusterFrame } from '@lib/math/hcluster'

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { OpenDialog } from '@components/pages/apps/matcalc/open-dialog'
import { ShortcutLayout } from '@layouts/shortcut-layout'

import { GeneConvertDialog } from './apps/gene-convert/gene-convert-dialog'
import { HeatMapDialog } from './apps/heatmap/heatmap-dialog'
import { VolcanoDialog } from './apps/volcano/volcano-dialog'
import { SortRowDialog } from './sort-row-dialog'
import { TopRowsDialog } from './top-rows-dialog'

import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import { nanoid, randId } from '@lib/utils'
import { useSelectionRange } from '@providers/selection-range'
import axios from 'axios'

import { MotifToGeneDialog } from './apps/motif-to-gene/motif-to-gene-dialog'

import { VolcanoPanel } from './apps/volcano/volcano-panel'
import { type PlotStyle } from './plots-provider'

import { BoxWhiskerChartIcon } from '@icons/box-whisker-chart-icon'
import { DataSortIcon } from '@icons/data-sort-icon'
import { DownloadIcon } from '@icons/download-icon'
import { FileIcon } from '@icons/file-icon'
import { FileImageIcon } from '@icons/file-image-icon'
import { FilterIcon } from '@icons/filter-icon'
import { HeatmapChartIcon } from '@icons/heatmap-chart-icon'
import { OpenIcon } from '@icons/open-icon'
import { TableIcon } from '@icons/table-icon'
import { UploadIcon } from '@icons/upload-icon'
import { BaseCol } from '@layout/base-col'

import { ToolbarDropdownButton } from '@toolbar/toolbar-dropdown-button'

import { ShowSideButton } from '@components/pages/show-side-button'
import { type ITab } from '@components/tabs/tab-provider'
import { VScrollPanel } from '@components/v-scroll-panel'
import { TransposeIcon } from '@icons/transpose-icon'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { oneWayFromDataframes } from '@lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  type OVERLAP_MODE,
} from '@lib/genomic/overlap/overlap'
import { snrRankGenes } from '@lib/gsea/gsea'
import { textToLines } from '@lib/text/lines'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent } from '@themed/tabs'
import { produce } from 'immer'
import { DEFAULT_EXT_GSEA_PROPS } from '../genes/gsea/ext-gsea-store'

import { BoxPlotDialog } from './apps/boxplot/boxplot-dialog'
import { BoxPlotPanel } from './apps/boxplot/boxplot-panel'
import MODULE_INFO from './module.json'

import { useSettingsTabs } from '@/components/dialog/settings/setting-tabs-store'
import { SlideBar } from '@components/slide-bar/slide-bar'
import { CubeIcon } from '@icons/cube-icon'
import { ExportIcon } from '@icons/export-icon'
import { toast } from '@themed/crisp'
import { ToastSpinner } from '@themed/toast'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { useMessages } from '@/providers/message-provider'
import { logrankExample } from '@lib/math/logrank'
import { toast as sonnerToast } from 'sonner'
import { GexDialog } from './apps/gex/gex-dialog'
import { ExtGseaPanelQuery } from './apps/gsea/ext-gsea-panel'
import { DotPlotDialog } from './apps/heatmap/dot-plot-dialog'
import { KmeansDialog } from './apps/kmeans/kmeans-dialog'
import { DataPanel } from './data/data-panel'

import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { ToolbarHelpTabGroup } from '@help/toolbar-help-tab-group'
import { ChartLine } from 'lucide-react'
import { HeatmapPanel } from './apps/heatmap/heatmap-panel'
import { LollipopPanelQuery } from './apps/lollipop/lollipop-panel'
import {
  currentPlots,
  currentSheets,
  currentSteps,
  HISTORY_ACTION_OPEN_APP,
  HISTORY_ACTION_OPEN_BRANCH,
  newPlot,
  useHistory,
  type IPlot,
} from './history/history-store'
import { UndoShortcuts } from './history/undo-shortcuts'
import { useMatcalcSettings } from './settings/matcalc-settings'
import { SettingsAppsPanel } from './settings/settings-apps-panel'
import { SettingsPanel } from './settings/settings-panel'

interface IClusterFrameProps {
  cf: IClusterFrame | null
  type: PlotStyle
  //params: IFieldMap
}

export const NO_CF: IClusterFrameProps = {
  cf: null,
  type: 'heatmap',
  //
}

const HELP_URL = DOCS_URL + '/apps/matcalc'

export const HIGHLIGHT_PANEL_CLS = 'bg-muted grow p-3 mb-2 rounded-lg'

export const TAB_DATA_TABLES = 'Data Tables'
export const TAB_PLOTS = 'Plots'

// const DEFAULT_DATA_TABLE_TAB: ITab = {
//   //id: nanoid(),
//   id: DEFAULT_TABLE_NAME,
//   icon: <TableIcon />,
//   isOpen: true,
// }

const DATA_TABLES_TAB: ITab = {
  //id: nanoid(),
  id: TAB_DATA_TABLES,
  //icon: <Folder strokeWidth={1.5} />,
  isOpen: true,
  //isGroup: true,
  children: [],
}

const GRAPHS_TAB: ITab = {
  id: 'Graphs',
  name: 'Graphs',
  //icon: <FolderIcon strokeWidth={1.5} />,

  //content: <DataPanel />,
  showChildren: 'always',
  isOpen: true,
}

const TREE_ROOT_TAB: ITab = {
  ...makeFoldersRootNode(),
  children: [{ ...DATA_TABLES_TAB }, { ...GRAPHS_TAB }],
}

/**
 * Clone the plots tab, but give it a unique id
 * @returns
 */
// function makeGraphsTab() {
//   return { ...GRAPHS_TAB, id: nanoid() }
// }

export function MatcalcPage() {
  const queryClient = useQueryClient()

  const {
    history,
    branches,

    allPlots,
    sheet,
    sheets,
    historyActions,
    groups,
    genesets,
    dispatch,
    //openAppHistory,
    //sheet,
    openBranch,
    gotoBranch,
    gotoPlot,
    addStep,
    addSheets,

    removeBranch,
    //gotoBranch,
    addPlots,
  } = useHistory()
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  //const {toast} = useToast()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const { settings, updateSettings } = useMatcalcSettings()

  const [treeRootTab, setTreeRootTab] = useState<ITab>(TREE_ROOT_TAB)
  //const [dataTableTab, setDataTableTab] = useState<ITab | undefined>(undefined)
  //const [branch?.id??'', setbranch?.id??''] = useState('')
  const [selectedTab, setSelectedTab] = useState('')
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)

  const { selection } = useSelectionRange()

  const [toolbarTabName, setToolbarTab] = useState('Home')

  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  // const [displayProps, setDisplayProps] = useState<IHeatMapProps>(
  //   DEFAULT_DISPLAY_PROPS,
  // )

  const { setSettingsTabs, setDefaultSettingsTab } = useSettingsTabs()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const { groupState, setGroups } = useGroups()

  const { sendMessage } = useMessages() //) //'matcalc') //useContext(MessageContext)

  const extGseaWorkerRef = useRef<Worker | null>(null)

  //const branch = searchForBranch(branch?.id??'', history)[0]
  //const step = currentStep(branch)[0]
  //const sheet = currentSheet(step)[0]
  //const sheets = step?.sheets

  useEffect(() => {
    dispatch({ type: HISTORY_ACTION_OPEN_APP, name: MODULE_INFO.name })

    // custom settings for the global settings app
    const settingsTabs: ITab[] = [
      {
        id: MODULE_INFO.name,
        icon: <CubeIcon fill="" />,
        children: [
          {
            id: 'User Interface',
            content: <SettingsPanel />,
          },
          {
            id: 'Apps',
            //icon: <LayersIcon />,
            content: <SettingsAppsPanel />,
          },
        ],
      },
    ]

    setSettingsTabs(settingsTabs)
    setDefaultSettingsTab(MODULE_INFO.name)

    extGseaWorkerRef.current = new Worker(
      new URL('./apps/gsea/ext-gsea.worker.ts', import.meta.url),
      {
        type: 'module',
      }
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

    res = await queryClient.fetchQuery({
      queryKey: ['groups'],
      queryFn: () => axios.get('/data/test/groups.json'),
    })

    //console.log('groups', res.data)

    openBranch(
      `Load "Z Test"`,
      [table.setName('Z Test') as AnnotationDataFrame],
      { mode: 'append', groups: res.data }
    )
  }

  async function loadDeseqTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/deseq2.tsv'),
    })

    const lines = textToLines(res.data)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Deseq Test"`, [
    //   table.setName('Deseq Test') as AnnotationDataFrame,
    // ])

    dispatch({
      type: HISTORY_ACTION_OPEN_BRANCH,
      name: `Load "Deseq Test"`,
      sheets: [table.setName('Deseq Test') as AnnotationDataFrame],
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

    // openBranch(`Load "Gene Test"`, [
    //   table.setName('Gene Test') as AnnotationDataFrame,
    // ])

    dispatch({
      type: HISTORY_ACTION_OPEN_BRANCH,
      name: `Load "Gene Test"`,
      sheets: [table.setName('Gene Test') as AnnotationDataFrame],
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

    // openBranch(`Load "Ext GSEA Test"`, [
    //   table.setName('Ext GSEA Test') as AnnotationDataFrame,
    // ])

    res = await queryClient.fetchQuery({
      queryKey: ['groups'],
      queryFn: () => axios.get('/data/test/extgsea/groups.json'),
    })

    const groups = res.data

    res = await queryClient.fetchQuery({
      queryKey: ['genesets'],
      queryFn: () => axios.get('/data/test/extgsea/genesets.json'),
    })

    const genesets = res.data

    openBranch(
      `Load "Ext GSEA Test"`,
      [table.setName('Ext GSEA Test') as AnnotationDataFrame],
      { mode: 'append', groups, genesets }
    )
  }

  useEffect(() => {
    const lastHistoryAction = historyActions[historyActions.length - 1]!

    const tableChildrenTabs: ITab[] = branches.map((branch, bi) => {
      // const plotChildren: ITab[] = currentPlots(branch).map((plot, pi) => ({
      //   id: plot.id,
      //   name: plot.name ?? `Graph ${pi + 1}`,
      //   type: 'plot',
      //   icon: <ImageIcon />,
      //   onDelete: () => {
      //     dispatch({ type: 'remove-plot', addr: plot.id })
      //   },
      //   onClick: () => {
      //     setSelectedTab(plot.id)
      //     gotoBranch(branch.id)
      //     gotoPlot(plot.id)
      //   },

      //   isOpen: true,
      // }))

      //const plotsTab = { ...makeGraphsTab(), children: plotChildren }

      const step = currentSteps(branch)[0] // history.stepMap[branch.steps[0]!]!
      const sheet = currentSheets(step)[0] // history.sheetMap[step.sheets[0]!]!

      return {
        id: branch.id ?? '',
        icon: <TableIcon strokeWidth={1.5} fill="fill-white" />,
        name: sheet?.name ?? `Data ${bi + 1}`,
        type: 'table',
        onClick: () => {
          setSelectedTab(branch.id)
          gotoBranch(branch.id)
        },
        onDelete: () => {
          removeBranch(branch.id)
        },
        //children: plotChildren.length > 0 ? [plotsTab] : [],
        isOpen: true, // plotChildren.length > 0,
      }
    })

    const dataTablesTab = {
      ...DATA_TABLES_TAB,
      children: tableChildrenTabs,
    }

    const graphChildrenTabs: ITab[] = branches
      .map((branch, bi) => {
        const plotChildren: ITab[] = currentPlots(branch).map((plot, pi) => ({
          id: plot.id,
          name: plot.name ?? `Graph ${pi + 1}`,
          type: 'plot',
          icon: <ChartLine strokeWidth={1.5} className="w-4" />,
          onDelete: () => {
            dispatch({ type: 'remove-plot', addr: plot.id })
          },
          onClick: () => {
            setSelectedTab(plot.id)
            gotoBranch(branch.id)
            gotoPlot(plot.id)
          },

          isOpen: true,
        }))

        //const plotsTab = { ...makeGraphsTab(), children: plotChildren }

        const step = currentSteps(branch)[0] // history.stepMap[branch.steps[0]!]!
        const sheet = currentSheets(step)[0] // history.sheetMap[step.sheets[0]!]!

        return {
          id: nanoid(),

          name: sheet?.name ?? `Data ${bi + 1}`,
          type: 'plot',

          children: plotChildren,
          isOpen: true, // plotChildren.length > 0,
        }
      })
      .filter((tab) => tab.children.length > 0)

    const graphsTab = {
      ...GRAPHS_TAB,
      children: graphChildrenTabs,
    }

    const tab: ITab = {
      ...treeRootTab,
      children: [dataTablesTab, graphsTab],
    }

    setTreeRootTab(tab)

    // if the history says we just added a plot, then try to select it

    if (
      lastHistoryAction.action.includes(HISTORY_ACTION_OPEN_BRANCH) ||
      lastHistoryAction.action.includes('remove-branch') ||
      lastHistoryAction.action.includes('add-plot') ||
      lastHistoryAction.action.includes('remove-plot')
    ) {
      setSelectedTab(lastHistoryAction.ids[0]!)
    }

    // if we opened a branch, default to selecting it
    // if (lastHistoryAction.action.includes(HISTORY_ACTION_OPEN_BRANCH)) {
    //   console.log('ajaaaa', lastHistoryAction.ids[0]!)
    //   //gotoBranch(lastHistoryAction.ids[0]!)
    // }
  }, [history, historyActions])

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          // openBranch(
          //   `Load ${tables[0]!.name}`,
          //   tables,
          //   settings.openFile.multiFileView ? 'append' : 'set'
          // )

          dispatch({
            type: HISTORY_ACTION_OPEN_BRANCH,
            name: `Load ${tables[0]!.name}`,
            sheets: tables,
            mode: settings.openFile.multiFileView ? 'append' : 'set',
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
    if (!sheet) {
      return
    }

    const df = makeGCT(sheet) as AnnotationDataFrame

    addStep(df.name, [df])

    // history.current = ({
    //   step: history.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    if (sheets) {
      const dfOverlaps = createOverlapTableFromDataframes(sheets, mode)

      if (dfOverlaps) {
        addSheets([dfOverlaps])
      }
    }

    // history.current = ({
    //   step: history.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function overlapOneWay() {
    if (sheets) {
      const dfOverlaps = oneWayFromDataframes(sheets)

      if (dfOverlaps) {
        addSheets([dfOverlaps])
      }
    }
  }

  function runExtGsea() {
    if (!sheet) {
      return
    }

    if (groups.length < 2) {
      toast({
        title: 'Extended GSEA',
        description: 'You need to create 2 groups/phenotypes.',
        variant: 'destructive',
      })
      return
    }

    if (genesets.length < 2) {
      toast({
        title: 'Extended GSEA',
        description: 'You need to create 2 gene sets.',
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
      const id = toast({
        title: MODULE_INFO.name,
        description: (
          <ToastSpinner>
            Running Extended GSEA, please do not refresh your browser window...
          </ToastSpinner>
        ),
        durationMs: 60000,
      })

      const group1 = groups[0]! //groupState.groups[groupState.order[0]!]!
      const group2 = groups[1]! //groupState.groups[groupState.order[1]!]!

      const rankedGenes = snrRankGenes(sheet, group1, group2)

      const gs1 = genesets[0]! // genesets[genesetState.order[0]!]!
      const gs2 = genesets[1]! // genesetState.genesets[genesetState.order[1]!]!

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
          ...newPlot('Extended GSEA', { main: sheet }, 'ext-gsea'),
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

        addPlots([plot])
        // we've finished so get rid of the animations
        sonnerToast.dismiss(id)
      }

      extGseaWorkerRef.current.postMessage({ rankedGenes, gs1, gs2 })
    }
  }

  function makeClusterMap(isClusterMap: boolean) {
    setShowDialog({
      id: randId('heatmap'),
      params: { df: sheet, isClusterMap },
    })
  }

  function makeDotPlot(isClusterMap: boolean) {
    setShowDialog({
      id: randId('dotplot'),
      params: { df: sheet, isClusterMap },
    })
  }

  function makeVolcanoPlot() {
    setShowDialog({ id: randId('volcano'), params: { df: sheet } })
  }

  function makeLollipop() {
    const plot: IPlot = newPlot('Lollipop', { main: sheet! }, 'lollipop')

    //console.log('aha', plot, history)

    addPlots([plot])
  }

  function transpose() {
    const df = sheet!.t.setName('Transpose')

    addStep(df?.name ?? 'Transpose', [df as AnnotationDataFrame])
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
                    id: randId('open'),
                  })
                }
              }}
            />

            <ToolbarIconButton
              title="Download"
              onClick={() => {
                sendMessage({
                  source: 'matcalc',
                  target: selectedTab ?? '',
                  text: 'save',
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />

          <ToolbarTabGroup title="Plot">
            <ToolbarIconButton
              onClick={() => makeClusterMap(false)}
              title="Heatmap"
            >
              <HeatmapChartIcon />
              {/* <span>Heatmap</span> */}
            </ToolbarIconButton>
            <ToolbarButton onClick={() => makeDotPlot(false)} title="Dot Plot">
              {/* <Circle className="w-5 h-5" /> */}
              <span>Dot</span>
            </ToolbarButton>

            <ToolbarButton
              title="Create Volcano Plot from Table"
              onClick={() => makeVolcanoPlot()}
            >
              Volcano
            </ToolbarButton>

            <ToolbarIconButton
              title="Create Box Plot from Table"
              onClick={() =>
                setShowDialog({ id: randId('box-whiskers'), params: {} })
              }
            >
              <BoxWhiskerChartIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />

          <ToolbarTabGroup title="Gene Expression">
            <ToolbarButton
              title="Download Gene Expression Data"
              onClick={() => setShowDialog({ id: randId('gex'), params: {} })}
            >
              Gene Expression
            </ToolbarButton>
            {/* <ToolbarButton
              title="Download gene expression metadata"
              onClick={() =>
                setShowDialog({ id: randId('gex-metadata'), params: {} })
              }
            >
              Metadata
            </ToolbarButton> */}
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
              title="Transpose Table"
              onClick={() => transpose()}
            >
              <TransposeIcon />
            </ToolbarIconButton>

            <ToolbarOptionalDropdownButton
              //size="md"
              icon="Log2(x)"
              onMainClick={() => {
                addStep('Log2(x+1)', [log(sheet!, 2, 1)])
              }}
            >
              <DropdownMenuItem
                aria-label="Log2(x)"
                onClick={() => addStep('Log2(x)', [log(sheet!, 2, 0)])}
              >
                Log2(x)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log2(x+1)"
                onClick={() => addStep('Log2(x+1)', [log(sheet!, 2, 1)])}
              >
                Log2(x+1)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log10(x)"
                onClick={() => addStep('Log10(x)', [log(sheet!, 10, 0)])}
              >
                Log10(x)
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Log10(x+1)"
                onClick={() => addStep('Log10(x+1)', [log(sheet!, 10, 0)])}
              >
                Log10(x+1)
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>

            <ToolbarDropdownButton icon={'Z-score'}>
              <DropdownMenuItem
                aria-label="Z-score rows"
                onClick={() => {
                  addStep('Z-score rows', [
                    rowZScore(sheet!) as AnnotationDataFrame,
                  ])
                }}
              >
                Z-score rows
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Z-score columns"
                onClick={() => {
                  if (sheet) {
                    const df = colZScore(sheet)

                    addStep(df.name, [df as AnnotationDataFrame])
                  }
                }}
              >
                Z-score columns
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Z-score table"
                onClick={() => {
                  if (sheet) {
                    const df = zscore(sheet)

                    addStep(df.name, [df as AnnotationDataFrame])
                  }
                }}
              >
                Z-score table
              </DropdownMenuItem>
            </ToolbarDropdownButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Cluster">
            <ToolbarButton
              title="K-means Clustering"
              onClick={() =>
                setShowDialog({ id: randId('kmeans'), params: {} })
              }
            >
              K-means
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />
          <ToolbarTabGroup title="Rows">
            <ToolbarIconButton
              title="Filter Top Rows using Statistics"
              onClick={() =>
                setShowDialog({ id: randId('top-rows'), params: {} })
              }
            >
              <FilterIcon />
              {/* <span>Top Rows</span> */}
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Sort Columns by Specific Rows"
              onClick={() =>
                setShowDialog({ id: randId('sort-row'), params: {} })
              }
            >
              <DataSortIcon />
              {/* <span>Sort By Rows</span> */}
            </ToolbarIconButton>

            <ToolbarButton
              title="Add Row Standard Deviation Column"
              onClick={() => {
                const sd = rowStdev(sheet!)

                const df = sheet!.copy() as AnnotationDataFrame
                df.rowMetaData.setCol('Row Stdev', sd, true)

                //df.setCol('Row Stdev', sd, true)

                addStep(df.name, [df])
                //addStep(df.name, [log(sheet!, 2, 1)])
              }}
            >
              Stdev
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          {process.env.NODE_ENV !== 'development' && (
            <>
              <ToolbarTabGroup title="Clinical">
                <ToolbarButton
                  title="Add row standard deviation column to table"
                  onClick={() => logrankExample()}
                >
                  Survival
                </ToolbarButton>
              </ToolbarTabGroup>

              <ToolbarSeparator />
            </>
          )}
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
              title="Convert Gene Symbols between Human and Mouse"
              onClick={() =>
                setShowDialog({ id: randId('human-mouse'), params: {} })
              }
            >
              Convert Species
            </ToolbarButton>

            <ToolbarButton
              title="Convert Motifs to Gene Symbols"
              onClick={() =>
                setShowDialog({ id: randId('motif-to-gene'), params: {} })
              }
            >
              Motif To Gene
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="GSEA">
            <ToolbarButton
              aria-label="Run Extended GSEA"
              onClick={() => runExtGsea()}
            >
              Extended GSEA
            </ToolbarButton>

            <ToolbarButton
              title="Convert Matrix to GSEA GCT Format"
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
      id: 'Protein',
      content: (
        <>
          <ToolbarTabGroup title="Protein">
            <ToolbarButton
              title="Create lollipop plot from table"
              onClick={() => makeLollipop()}
            >
              Lollipop
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
              title="Minimum Common Regions of Genomic Locations"
              onClick={() => overlapGenomicLocations('mcr')}
            >
              MCR
            </ToolbarButton>
            <ToolbarButton
              title="Maximum Overlap Regions of Genomic Locations"
              onClick={() => overlapGenomicLocations('max')}
            >
              Min/Max
            </ToolbarButton>

            <ToolbarButton
              title="One Way Overlap of Genomic Locations in Files"
              onClick={() => overlapOneWay()}
            >
              One Way
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    // {
    //   id: 'Gene Expression',
    //   content: (
    //     <>
    //       <ToolbarTabGroup title="Gene Expression">
    //         <ToolbarButton
    //           title="Perform a one way overlap of files"
    //           onClick={() => setShowDialog({ id: randId('gex'), params: {} })}
    //         >
    //           Gene Expression
    //         </ToolbarButton>
    //       </ToolbarTabGroup>
    //       <ToolbarSeparator />
    //     </>
    //   ),
    // },
    {
      id: 'Help',
      content: (
        <>
          <ToolbarHelpTabGroup url={HELP_URL} />

          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: randId('open'), params: {} })}
        >
          <UploadIcon />

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
      icon: <DownloadIcon stroke="stroke-theme" />,
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => {
              sendMessage({
                source: 'matcalc',
                target: selectedTab ?? '',
                text: 'save:txt',
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
              sendMessage({
                source: 'matcalc',
                target: selectedTab ?? '',
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
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              sendMessage({
                source: 'matcalc',
                target: selectedTab ?? '',
                text: 'save:png',
              })
              // save("txt")}
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              sendMessage({
                source: 'matcalc',
                target: selectedTab ?? '',
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

  function plotElem(plot: IPlot): ReactNode {
    switch (plot.style) {
      case 'heatmap':
      case 'dot':
        return (
          <HeatmapPanel
            key={plot.id}
            //plotId={plot.id}
            plotAddr={plot.id}
          />
        )
      case 'volcano':
        return (
          <VolcanoPanel
            key={plot.id}
            //plotId={plot.id}
            plotAddr={plot.id}
          />
        )
      case 'box':
        return <BoxPlotPanel key={plot.id} plotAddr={plot.id} />
      case 'ext-gsea':
        return <ExtGseaPanelQuery key={plot.id} plotAddr={plot.id} />
      case 'lollipop':
        return (
          <LollipopPanelQuery key={plot.id} id={plot.id} plotAddr={plot.id} />
        )
      default:
        return null
    }
  }

  const mainContent = useMemo(() => {
    // console.log(
    //   step[0]!.plots,
    //   step[0]!.plotMap,
    //   selectedTab?.id,
    //   step[0]!.plots.map(id => step[0]!.plotMap[id]!)
    // )

    return (
      <Tabs
        //defaultValue={selectedTab.id}
        value={selectedTab ?? ''}
        className="min-h-0 h-full flex flex-col grow"
      >
        {/* <TabsContent key={branch?.id ?? ''} value={branch?.id ?? ''} asChild>
          <DataPanel branchId={branch?.id ?? ''} />
        </TabsContent>

        {plot && plotElem(plot)} */}

        {branches.map((branch) => {
          return (
            <TabsContent key={branch.id} value={branch.id} asChild>
              {/* lazy load */}
              {selectedTab === branch.id && <DataPanel branchId={branch.id} />}
            </TabsContent>
          )
        })}

        {allPlots.map((plot) => {
          return (
            <Fragment key={plot.id}>
              <TabsContent key={plot.id} value={plot.id} asChild>
                {selectedTab === plot.id && plotElem(plot)}
              </TabsContent>
            </Fragment>
          )
        })}
      </Tabs>
    )
  }, [selectedTab, branches, allPlots])

  const sideContent = useMemo(() => {
    return (
      <BaseCol className="px-2 grow">
        <VScrollPanel className="grow">
          <CollapseTree
            tab={treeRootTab}
            value={{ id: selectedTab }}
            showRoot={false}

            ///asChild={false}
          />
        </VScrollPanel>
      </BaseCol>
    )
  }, [treeRootTab, selectedTab])

  //console.log('render check', plots)

  return (
    <>
      {showDialog.id.startsWith('open:') && (
        <OpenFiles
          open={showDialog.id}
          //onOpenChange={() => setShowDialog({...NO_DIALOG})}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              setShowDialog({
                id: randId('open-file-dialog'),
                params: { files },
              })
            })
          }
        />
      )}

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
          //df={sheet!}
          onFilter={() => {
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('heatmap') && (
        <HeatMapDialog
          open={showDialog.id.startsWith('heatmap')}
          isClusterMap={(showDialog.params?.isClusterMap as boolean) ?? false}
          //df={showDialog.params?.df as BaseDataFrame}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('dotplot') && (
        <DotPlotDialog
          open={showDialog.id.startsWith('dotplot')}
          isClusterMap={(showDialog.params?.isClusterMap as boolean) ?? false}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('volcano') && (
        <VolcanoDialog
          open={showDialog.id.startsWith('volcano')}
          //df={showDialog.params?.df as BaseDataFrame}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('box-whiskers') && (
        <BoxPlotDialog
          open={showDialog.id.startsWith('box-whiskers')}
          //df={sheet!}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('human-mouse') && (
        <GeneConvertDialog
          selection={selection}
          onConversion={() => setShowDialog({ ...NO_DIALOG })}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('motif-to-gene') && (
        <MotifToGeneDialog
          selection={selection}
          onConversion={() => setShowDialog({ ...NO_DIALOG })}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('sort-row') && (
        <SortRowDialog
          selection={selection}
          onSort={() => setShowDialog({ ...NO_DIALOG })}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('kmeans') && (
        <KmeansDialog
          //df={sheet as AnnotationDataFrame}
          onResponse={(_, data) => {
            if (data?.drawHeatmap) {
              setShowDialog({
                id: randId('heatmap'),
                params: { df: data.df },
              })
            } else {
              setShowDialog({ ...NO_DIALOG })
            }
          }}
        />
      )}

      {showDialog.id.startsWith('gex:') && (
        <GexDialog
          onResponse={() => {
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {/* {showDialog.id.startsWith('gex-metadata:') && (
        <GexMetadataDialog
          onResponse={() => {
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )} */}

      {showDialog.id.startsWith('alert') && (
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as ReactNode}
        </BasicAlertDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} signedRequired="never">
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
          {/* <LoadingSpinner/> */}
        </HeaderPortal>

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
                <DropdownMenuTrigger asChild>
                  <ToolbarTabButton>Test Data</ToolbarTabButton>
                </DropdownMenuTrigger>

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
                show={settings.sidebar.show}
                onClick={() => {
                  const newSettings = produce(settings, (draft) => {
                    draft.sidebar.show = !draft.sidebar.show
                  })

                  updateSettings(newSettings)
                }}
              />
            }
          />
        </Toolbar>

        {/* <HelpSlideBar
          open={showHelp}
          onOpenChange={setShowHelp}
          helpUrl={HELP_URL}
          className="grow"
        > */}

        <SlideBar
          id="matcalc-folders"
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 50]}
          hideLimit={1}
          initialPosition={15}
          side="left"
          //mainContent={mainContent}
          //sideContent={sideContent}
          className="grow"
        >
          <>{mainContent}</>
          <>{sideContent}</>
        </SlideBar>

        {/* {mainContent} */}

        {/* </HelpSlideBar> */}
      </ShortcutLayout>
    </>
  )
}
