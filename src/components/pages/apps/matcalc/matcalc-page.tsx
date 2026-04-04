'use client'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { ToolbarButton } from '@/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@/toolbar/toolbar-optional-dropdown-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import {
  colZScore,
  log,
  makeGCT,
  rowStdev,
  rowZScore,
  zscore,
} from '@/lib/dataframe/dataframe-utils'

import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  DOCS_URL,
  NO_DIALOG,
  TEXT_DOWNLOAD,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_HOME,
  TEXT_OK,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { BasicAlertDialog } from '@/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { type IClusterFrame } from '@/lib/math/hcluster'

import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { OpenDialog } from '@/components/pages/apps/matcalc/open-dialog'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { GeneConvertDialog } from './apps/gene-convert/gene-convert-dialog'
import { HeatMapDialog } from './apps/heatmap/heatmap-dialog'
import { VolcanoDialog } from './apps/volcano/volcano-dialog'
import { SortRowDialog } from './sort-row-dialog'
import { TopRowsDialog } from './top-rows-dialog'

import { CollapseTree, ROOT_NODE } from '@/components/collapse-tree'
import { makeUuid, randId } from '@/lib/id'
import { useSelectionRange } from '@/providers/selection-range'

import { MotifToGeneDialog } from './apps/motif-to-gene/motif-to-gene-dialog'

import { VolcanoPanel } from './apps/volcano/volcano-panel'
import { type PlotStyle } from './plots-provider'

import { DataSortIcon } from '@/icons/data-sort-icon'
import { DownloadIcon } from '@/icons/download-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { FilterIcon } from '@/icons/filter-icon'
import { OpenIcon } from '@/icons/open-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { BaseCol } from '@/layout/base-col'

import { ToolbarDropdownButton } from '@/toolbar/toolbar-dropdown-button'

import { ShowSideButton } from '@/components/pages/show-side-button'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { type ITab } from '@/components/tabs/tab-provider'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TransposeIcon } from '@/icons/transpose-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  type OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import { snrRankGenes } from '@/lib/gsea/gsea'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'

import { BoxPlotDialog } from './apps/boxplot/boxplot-dialog'
import { BoxPlotPanel } from './apps/boxplot/boxplot-panel'
import MODULE_INFO from './module.json'

import { useSettingsTabs } from '@/components/dialog/settings/setting-tabs-store'

import { CubeIcon } from '@/icons/cube-icon'
import { ExportIcon } from '@/icons/export-icon'

import { logrankExample } from '@/lib/math/logrank'
import { useMessages } from '@/providers/message-provider'

import { GexDialog } from './apps/gex/gex-dialog'
import { ExtGseaPanelQuery } from './apps/gsea/ext-gsea-panel'
import { DotPlotDialog } from './apps/heatmap/dot-plot-dialog'
import { KmeansDialog } from './apps/kmeans/kmeans-dialog'
import {
  DataPanel,
  MESSAGE_CHANNEL,
  ShowOptsSidebarBtn,
} from './data/data-panel'

import { HeaderSlotPortal } from '@/components/header/header-slot-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'
import { useSlideBar } from '@/components/slide-bar/slide-bar-store'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarHelpTabGroup } from '@/help/toolbar-help-tab-group'
import { HeaderButton } from '@/layouts/header-button'
import type { IClusterGroup } from '@/lib/cluster-group'
import type { IGeneset } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'
import { Toast } from '@base-ui/react/toast'
import { FileChartColumnIncreasing, FileSpreadsheet } from 'lucide-react'
import { HeatmapPanel } from './apps/heatmap/heatmap-panel'
import { HistoryLayout, HistoryShowButton } from './history/history-layout'

import {
  getPlots,
  getSheets,
  newExtGseaPlot,
  pathJoin,
  useApp,
  useFile,
  useFiles,
  useGenesets,
  useGroups,
  //newLollipopPlot,
  useHistory,
  usePlot,
  usePlots,
  useSheet,
  useSheets,
  type HistoryPlot,
} from './history/history-store'
import { UndoShortcuts } from './history/undo-shortcuts'
import { useMatcalcSettings } from './settings/matcalc-settings'
import { SettingsAppsPanel } from './settings/settings-apps-panel'

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

export const TEXT_HEATMAP = 'Heatmap'
export const TEXT_DOT_PLOT = 'Dot Plot'

// const DEFAULT_DATA_TABLE_TAB: ITab = {
//   //id: nanoid(),
//   id: DEFAULT_TABLE_NAME,
//   icon: <TableIcon />,
//   isOpen: true,
// }

const DATA_TABLES_TAB: ITab = Object.freeze({
  id: TAB_DATA_TABLES,
  //isOpen: true,
  type: 'folder',
  children: [],
})

const PLOTS_TAB: ITab = Object.freeze({
  id: 'Plots',

  type: 'folder',
  //isOpen: true,
})

const TREE_ROOT_TAB: ITab = Object.freeze({
  ...ROOT_NODE,
  children: [{ ...DATA_TABLES_TAB }, { ...PLOTS_TAB }],
})

export function MatcalcPage() {
  const {
    store,
    state,
    currentFile,
    currentSelection,
    goto,
    remove,
    removeFiles,
    openApp,
    openFile,
    addSheets,

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
  const [selectedPanelTab, setSelectedPanelTab] = useState<string>('')

  const folderId = 'matcalc-folders'

  const { sendMessage } = useMessages(MESSAGE_CHANNEL)

  const { selection } = useSelectionRange()

  //const [toolbarTabName, setToolbarTab] = useState('Home')

  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  // const [displayProps, setDisplayProps] = useState<IHeatMapProps>(
  //   DEFAULT_DISPLAY_PROPS,
  // )

  const app = useApp()!
  //const appPath = `/${app?.id}`
  const files = useFiles()
  const file = useFile()

  //const currentFile = `${appPath}/${file?.id}`

  const groups = useGroups()
  const genesets = useGenesets()

  const sheet = useSheet()
  const sheets = useSheets()
  const plot = usePlot()
  const plots = usePlots()

  const { setSettingsTabs, setDefaultSettingsTab } = useSettingsTabs()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const { groupState, setGroups } = useGroups()

  const { barProps, setOpen } = useSlideBar(folderId) //) //'matcalc') //useContext(MessageContext)

  const extGseaWorkerRef = useRef<Worker | null>(null)

  const { add: addToast, close: closeToast } = Toast.useToastManager()

  //const {setTab: setToolbarTab} = useTabs(TOOLBAR_GROUP_ID)

  //const branch = searchForBranch(branch?.id??'', history)[0]
  //const step = currentStep(branch)[0]
  //const sheet = currentSheet(step)[0]
  //const sheets = step?.sheets

  useEffect(() => {
    openApp(MODULE_INFO.name)

    // custom settings for the global settings app
    const settingsTabs: ITab[] = [
      {
        id: MODULE_INFO.name,
        icon: <CubeIcon fill="" />,
        children: [
          // {
          //   id: 'User Interface',
          //   content: <SettingsPanel />,
          // },
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
    //setSelectedPanelTab(branch.id)

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

  useEffect(() => {
    if (currentSelection?.path) {
      setSelectedPanelTab(currentSelection.path)
    }
  }, [currentSelection])

  async function loadZTestData() {
    let res = await httpFetch.getText('/data/test/z_table.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    const resg = await httpFetch.getJson<IClusterGroup[]>(
      '/data/test/groups.json'
    )

    //console.log('groups', res.data)

    console.log('open file', table.id)

    openFile(`Z Test`, {
      //mode: 'append',
      groups: resg,
      sheets: [table.setName('Z Test') as AnnotationDataFrame],
    })
  }

  async function loadDeseqTestData() {
    const res = await httpFetch.getText('/data/test/deseq2.tsv')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Deseq Test"`, [
    //   table.setName('Deseq Test') as AnnotationDataFrame,
    // ])

    openFile(`Deseq Test`, {
      //mode: 'append',

      sheets: [table.setName('Deseq Test') as AnnotationDataFrame],
    })
  }

  function _addPlots(plots: HistoryPlot[]) {
    console.log('adding plots', plots, currentFile)
    addPlots(plots)
    setSelectedPanelTab(pathJoin(currentFile, plots[0]!))
  }

  async function loadGeneTestData() {
    const res = await httpFetch.getText('/data/test/geneconv.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().read(lines)

    console.log(table)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Gene Test"`, [
    //   table.setName('Gene Test') as AnnotationDataFrame,
    // ])

    openFile(`Gene Test`, {
      //mode: 'append',
      sheets: [table.setName('Gene Test') as AnnotationDataFrame],
    })
  }

  async function loadExtGseaTestData() {
    let res = await httpFetch.getText('/data/test/extgsea/vst_tpm0-01_in_3.tsv')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Ext GSEA Test"`, [
    //   table.setName('Ext GSEA Test') as AnnotationDataFrame,
    // ])

    const groups = await httpFetch.getJson<IClusterGroup[]>(
      '/data/test/extgsea/groups.json'
    )

    const genesets = await httpFetch.getJson<IGeneset[]>(
      '/data/test/extgsea/genesets.json'
    )

    openFile(`Ext GSEA Test`, {
      //mode: 'append',
      groups,
      genesets,
      sheets: [table.setName('Ext GSEA Test') as AnnotationDataFrame],
    })
  }

  useEffect(() => {
    //const lastHistoryAction = historyActions[historyActions.length - 1]!

    // ignore the default branch created at startup
    const filesWithoutDefault = files.length > 1 ? files.slice(1) : files

    const tableChildrenTabs: ITab[] = []
    const plotChildrenTabs: ITab[] = []

    const allPlots: HistoryPlot[] = []

    for (const [fi, file] of filesWithoutDefault.entries()) {
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

      const sheet = getSheets(store, state, file)[0]! // history.sheetMap[step.sheets[0]!]!

      //const sheetPath = pathJoin(app, file, sheet)

      // const sheetNode: ITab = {
      //   id: `${branch.id}-sheet`,
      //   icon: (
      //     <FileSpreadsheet
      //       strokeWidth={2}
      //       className="w-4 fill-background stroke-foreground"
      //     />
      //   ),
      //   name: 'Data', //sheet?.name ?? `Data ${bi + 1}`,
      //   type: 'table',
      //   onClick: () => {
      //     setSelectedPanelTab(branch.id)
      //     goto(branch.id, 'branch')
      //   },

      //   //children: plotChildren.length > 0 ? [plotsTab] : [],
      //   isOpen: true, // plotChildren.length > 0,
      // }

      const fileNode: ITab = {
        id: sheet.id, //file.id,
        name: sheet?.name ?? `File ${fi + 1}`,
        icon: <FileSpreadsheet strokeWidth={1.5} size={20} />,
        // isOpen: true,
        //type: 'folder',
        //children: plotChildren.length > 0 ? [plotsNode] : [],
        onClick: () => {
          setSelectedPanelTab(sheet.id) //file.id)
          //goto(branch.id, 'branch')

          console.log('goto sheet dd', sheet.id)

          //goto(sheet?.path ?? '', 'path')
          goto({ app, file, sheet }) //, 'branch')
        },
        onDelete: () => {
          // find the branch above it

          //const idx = where(branches, b => b.id === file.id)

          //const b = idx.length > 0 ? branches[idx[0]! - 1] : branches[0]

          removeFiles([{ app, file }]) //file.id], 'file')

          //console.log('b', b)
          //if (b) {
          //setSelectedPanelTab(b.id)
          //goto(b.path, 'path')
          //}
        },
      }

      tableChildrenTabs.push(fileNode)

      allPlots.push(...getPlots(store, state, file))
    }

    for (const [pi, plot] of allPlots.entries()) {
      //const plotPath = pathJoin(currentFile, plot)
      const plotNode: ITab = {
        id: plot.id,
        name: plot.name ?? `Graph ${pi + 1}`,
        type: 'plot',
        icon: <FileChartColumnIncreasing strokeWidth={1.5} size={20} />,
        onDelete: () => {
          if (allPlots.length > 0) {
            if (allPlots.length === 1) {
              // select the branch if we are removing the last plot
              setSelectedPanelTab(plot.id) //file.id)
            } else {
              // select the first plot that is not the one being removed
              // so that something is selected
              setSelectedPanelTab(
                allPlots.filter((p) => p.id !== plot.id)[0]!.id
              ) //file.id)
            }
          }

          remove([{ app, file, plot }]) // [plot.id], 'plot')
        },
        onClick: () => {
          setSelectedPanelTab(plot.id)
          //goto(branch.id, 'branch')
          //goto(plot.id, 'plot')

          goto({ app, file, sheet, plot }) //plot.id, 'plot')
        },

        ///isOpen: true,
      }

      plotChildrenTabs.push(plotNode)
    }

    // const dataTablesTab = {
    //   ...DATA_TABLES_TAB,
    //   children: tableChildrenTabs,
    // }

    // const graphChildrenTabs: ITab[] = branches
    //   .map((branch, bi) => {
    //     const plotChildren: ITab[] = currentPlots(branch).map((plot, pi) => ({
    //       id: plot.id,
    //       name: plot.name ?? `Graph ${pi + 1}`,
    //       type: 'plot',
    //       icon: (
    //         <FileChartLine
    //           strokeWidth={1.5}
    //           className="w-4 stroke-foreground fill-background"
    //         />
    //       ),
    //       onDelete: () => {
    //         remove(plot.id, 'plot')
    //       },
    //       onClick: () => {
    //         setSelectedPanelTab(plot.id)
    //         goto(branch.id, 'branch')
    //         goto(plot.id, 'plot')
    //       },

    //       isOpen: true,
    //     }))

    //     //const plotsTab = { ...makeGraphsTab(), children: plotChildren }

    //     const step = currentSteps(branch)[0] // history.stepMap[branch.steps[0]!]!
    //     const sheet = currentSheets(step)[0] // history.sheetMap[step.sheets[0]!]!

    //     return {
    //       id: makeRandId(),

    //       name: sheet?.name ?? `Data ${bi + 1}`,
    //       type: 'plot',

    //       children: plotChildren,
    //       isOpen: true, // plotChildren.length > 0,
    //     }
    //   })
    //   .filter(tab => tab.children.length > 0)

    // const graphsTab = {
    //   ...GRAPHS_TAB,
    //   children: graphChildrenTabs,
    // }

    // const tab: ITab = {
    //   ...treeRootTab,
    //   children: [dataTablesTab],
    // }

    setTreeRootTab({
      ...ROOT_NODE,
      children: [
        { ...DATA_TABLES_TAB, children: tableChildrenTabs },
        { ...PLOTS_TAB, children: plotChildrenTabs },
      ],
    })

    // if the history says we just added a plot, then try to select it

    // if (
    //   lastHistoryAction.action.includes(HISTORY_ACTION_OPEN_BRANCH) ||
    //   lastHistoryAction.action.includes('remove-branch') ||
    //   lastHistoryAction.action.includes('add-plot') ||
    //   lastHistoryAction.action.includes('remove-plot')
    // ) {
    //   setSelectedPanelTab(lastHistoryAction.ids[0]!)
    // }

    // if we opened a branch, default to selecting it
    // if (lastHistoryAction.action.includes(HISTORY_ACTION_OPEN_BRANCH)) {
    //   console.log('ajaaaa', lastHistoryAction.ids[0]!)
    //   //gotoBranch(lastHistoryAction.ids[0]!)
    // }
  }, [state, files, plots, sheets])

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          // openBranch(
          //   `Load ${tables[0]!.name}`,
          //   tables,
          //   settings.openFile.multiFileView ? 'append' : 'set'
          // )

          openFile(tables[0]!.name, {
            mode: settings.openFile.multiFileView ? 'append' : 'set',
            sheets: tables,
          })
        }
      },
      onFailure: () => {
        addToast({
          id: makeUuid(),
          title: MODULE_INFO.name,
          description:
            'Your files could not be opened. Check they are formatted correctly.',
          type: 'destructive',
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

    const df = makeGCT(sheet as AnnotationDataFrame) as AnnotationDataFrame

    addSheets([df])

    // history.current = ({
    //   step: history.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    if (sheets) {
      const dfOverlaps = createOverlapTableFromDataframes(
        sheets.map((s) => s as AnnotationDataFrame),
        mode
      )

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
      const dfOverlaps = oneWayFromDataframes(
        sheets.map((s) => s as AnnotationDataFrame)
      )

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
      addToast({
        id: makeUuid(),
        title: 'Extended GSEA',
        description: 'You need to create 2 groups/phenotypes.',
        type: 'destructive',
      })
      return
    }

    if (genesets.length < 2) {
      addToast({
        id: makeUuid(),
        title: 'Extended GSEA',
        description: 'You need to create 2 gene sets.',
        type: 'destructive',
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
      const id = makeUuid()

      addToast({
        id,
        title: MODULE_INFO.name,
        description:
          'Running Extended GSEA, please do not refresh your browser window...',

        timeout: 60000,
      })

      const group1 = groups[0]! //groupState.groups[groupState.order[0]!]!
      const group2 = groups[1]! //groupState.groups[groupState.order[1]!]!

      const rankedGenes = snrRankGenes(
        sheet as AnnotationDataFrame,
        group1,
        group2
      )

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
          ...newExtGseaPlot(
            'Extended GSEA',

            {
              rankedGenes,
              gs1: gs1,
              gs2: gs2,
              extGseaRes,
              gseaRes1,
              gseaRes2,
            }
          ),
        }

        _addPlots([plot])
        // we've finished so get rid of the animations
        closeToast(id)
      }

      extGseaWorkerRef.current.postMessage({
        rankedGenes,
        gs1,
        gs2,
      })
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

  // function makeLollipop() {
  //   const plot = newLollipopPlot('Lollipop', {
  //     main: sheet!.df as AnnotationDataFrame,
  //   })

  //   //console.log('aha', plot, history)

  //   _addPlots([plot])
  // }

  function transpose() {
    const df = (sheet! as AnnotationDataFrame).t.setName('Transpose')

    addSheets([df as AnnotationDataFrame])
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
              title={TEXT_DOWNLOAD}
              onClick={() => {
                console.log('save', file?.id ?? '')
                sendMessage({
                  type: 'info',
                  source: 'matcalc',
                  target: file?.id ?? '',
                  data: 'save',
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />

          <ToolbarTabGroup title="Plot" className="items-start">
            <ToolbarCol>
              <ToolbarButton
                onClick={() => makeClusterMap(false)}
                aria-label={TEXT_HEATMAP}
              >
                {/* <HeatmapChartIcon /> */}
                {TEXT_HEATMAP}
              </ToolbarButton>
              <ToolbarButton
                onClick={() => makeDotPlot(false)}
                aria-label={TEXT_DOT_PLOT}
              >
                {/* <Circle className="w-5 h-5" /> */}
                Dot
              </ToolbarButton>
            </ToolbarCol>
            <ToolbarCol>
              <ToolbarButton
                title="Create Volcano Plot from Table"
                onClick={() => makeVolcanoPlot()}
              >
                Volcano
              </ToolbarButton>

              <ToolbarButton
                title="Create Box Plot from Table"
                onClick={() =>
                  setShowDialog({ id: randId('box-whiskers'), params: {} })
                }
              >
                {/* <BoxWhiskerChartIcon /> */}
                Box
              </ToolbarButton>
            </ToolbarCol>
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
                addSheets(
                  [log(sheet! as AnnotationDataFrame, 2, 1)],

                  {
                    name: 'Log2(x+1)',
                  }
                )
              }}
            >
              <DropdownMenuItem
                aria-label="Log2(x)"
                onClick={() =>
                  addSheets(
                    [log(sheet! as AnnotationDataFrame, 2, 0)],

                    {
                      name: 'Log2(x)',
                    }
                  )
                }
              >
                Log2(x)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log2(x+1)"
                onClick={() =>
                  addSheets(
                    [log(sheet! as AnnotationDataFrame, 2, 1)],

                    {
                      name: 'Log2(x+1)',
                    }
                  )
                }
              >
                Log2(x+1)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log10(x)"
                onClick={() =>
                  addSheets(
                    [log(sheet! as AnnotationDataFrame, 10, 0)],

                    {
                      name: 'Log10(x)',
                    }
                  )
                }
              >
                Log10(x)
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Log10(x+1)"
                onClick={() =>
                  addSheets(
                    [log(sheet! as AnnotationDataFrame, 10, 1)],

                    {
                      name: 'Log10(x+1)',
                    }
                  )
                }
              >
                Log10(x+1)
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>

            <ToolbarDropdownButton icon="Z-score">
              <DropdownMenuItem
                aria-label="Z-score rows"
                onClick={() => {
                  addSheets(
                    [
                      rowZScore(
                        sheet! as AnnotationDataFrame
                      ) as AnnotationDataFrame,
                    ],

                    { name: 'Z-score rows' }
                  )
                }}
              >
                Z-score rows
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Z-score columns"
                onClick={() => {
                  if (sheet) {
                    const df = colZScore(sheet! as AnnotationDataFrame)

                    addSheets([df as AnnotationDataFrame], {
                      name: 'Z-score columns',
                    })
                  }
                }}
              >
                Z-score columns
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Z-score table"
                onClick={() => {
                  if (sheet) {
                    const df = zscore(sheet! as AnnotationDataFrame)

                    addSheets([df as AnnotationDataFrame], {
                      name: 'Z-score table',
                    })
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
                const sd = rowStdev(sheet! as AnnotationDataFrame)

                const df = (
                  sheet! as AnnotationDataFrame
                ).copy() as AnnotationDataFrame
                df.rowObs.setCol('Row Stdev', sd, true)

                //df.setCol('Row Stdev', sd, true)

                addSheets([df], { name: 'Row Standard Deviation' })
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
    // {
    //   id: 'Protein',
    //   content: (
    //     <>
    //       <ToolbarTabGroup title="Protein">
    //         <ToolbarButton
    //           title="Create lollipop plot from table"
    //           onClick={() => makeLollipop()}
    //         >
    //           Lollipop
    //         </ToolbarButton>
    //       </ToolbarTabGroup>

    //       <ToolbarSeparator />
    //     </>
    //   ),
    // },
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
      icon: <OpenIcon variant="colorful" />,
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
                type: 'info',
                source: 'matcalc',
                target: file?.id ?? '',
                data: 'save:txt',
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
                type: 'info',
                source: 'matcalc',
                target: file?.id ?? '',
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
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: plot?.id ?? '',
                data: 'save:png',
              })
              // save("txt")}
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: plot?.id ?? '',
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

  const mainContent = (
    <Tabs
      //defaultValue={selectedTab.id}
      value={selectedPanelTab}
      className="min-h-0 h-full flex flex-col grow"
    >
      {/* <TabsContent key={branch?.id ?? ''} value={branch?.id ?? ''} asChild>
          <DataPanel branchId={branch?.id ?? ''} />
        </TabsContent>

        {plot && plotElem(plot)} */}

      {/* {branches.map(branch => {
          return ( */}

      {files.map((file) => {
        //const path = pathJoin(app, file, file.sheets[0]!)
        const sheet = getSheets(store, state, file)[0]!

        return (
          <TabsContent key={sheet.id} value={sheet.id}>
            <DataPanel />
          </TabsContent>
        )
      })}

      {/* )
        })} */}

      {/* {sheet && (
          <TabsContent key={sheet.id} value={sheet.id} asChild>
            <DataPanel />
          </TabsContent>
        )} */}

      {/* {branch && (
          <TabsContent key={branch.id} value={branch.id} asChild>
            <DataPanel />
          </TabsContent>
        )} */}

      {plots.map((plot) => {
        return (
          <TabsContent key={plot.id} value={plot.id}>
            {plotElem(plot)}
          </TabsContent>
        )
      })}
    </Tabs>
  )

  const sideContent = (
    <BaseCol className="pl-1 grow">
      <VScrollPanel className="grow">
        <CollapseTree
          tab={treeRootTab}
          value={{ id: selectedPanelTab }}
          showRoot={false}

          ///asChild={false}
        />
      </VScrollPanel>
    </BaseCol>
  )

  //console.log('render check', plots)

  return (
    <>
      {showDialog.id.startsWith('open:') && (
        <OpenFiles
          message={showDialog.id}
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
          onResponse={(response, data) => {
            console.log('heatmap dialog response', response, data)
            if (response === TEXT_OK) {
              const plot = data as HistoryPlot

              console.log('plot from heatmap dialog', plot)

              _addPlots([plot])
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.startsWith('dotplot') && (
        <DotPlotDialog
          open={showDialog.id.startsWith('dotplot')}
          isClusterMap={(showDialog.params?.isClusterMap as boolean) ?? false}
          onResponse={(response, data) => {
            if (response === TEXT_OK) {
              const plot = data as HistoryPlot

              _addPlots([plot])
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.startsWith('volcano') && (
        <VolcanoDialog
          open={showDialog.id.startsWith('volcano')}
          //df={showDialog.params?.df as BaseDataFrame}
          onResponse={(response, data) => {
            if (response === TEXT_OK) {
              const plot = data as HistoryPlot

              _addPlots([plot])
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.startsWith('box-whiskers') && (
        <BoxPlotDialog
          open={showDialog.id.startsWith('box-whiskers')}
          //df={sheet!}
          onResponse={(response, data) => {
            if (response === TEXT_OK) {
              const plot = data as HistoryPlot

              _addPlots([plot])
            }
            setShowDialog({ ...NO_DIALOG })
          }}
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
          onResponse={(text, data) => {
            if (text === TEXT_OK) {
              const d = data as {
                df: AnnotationDataFrame
                drawHeatmap: boolean
              }
              if (d.drawHeatmap) {
                setShowDialog({
                  id: randId('heatmap'),
                  params: { df: d.df },
                })
              } else {
                setShowDialog({ ...NO_DIALOG })
              }
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

      <HeaderSlotPortal slot="header-left">
        <ModuleInfoButton info={MODULE_INFO} />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<HeaderButton className="text-xs">Test Data</HeaderButton>}
          />

          <DropdownMenuContent align="end" className="text-sm">
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
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId="matcalc-toolbar"
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            leftShortcuts={
              <>
                <ShowSideButton
                  open={barProps.open}
                  onClick={() => {
                    setOpen(!barProps.open)
                  }}
                />
                <UndoShortcuts />
              </>
            }
            rightShortcuts={<HistoryShowButton />}
          />
          <ToolbarPanel
            groupId="matcalc-toolbar"
            tabs={tabs}
            tabShortcutMenu={
              <ShowOptsSidebarBtn
                open={settings.sidebar.show}
                onClick={(open) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.sidebar.show = open
                    })
                  )
                }}
              />
            }
          />
        </Toolbar>
        <HistoryLayout>
          <ResizableSidebar id={folderId} side="left" className="grow">
            <>{mainContent}</>
            <>{sideContent}</>
          </ResizableSidebar>
        </HistoryLayout>
      </ShortcutLayout>
    </>
  )
}

export function MatcalcQueryPage() {
  return (
    <CoreProviders>
      {/* <MatcalcSettingsProvider> */}
      {/* <SearchFilterProvider> */}
      {/* <GroupsProvider> */}
      {/* <GenesetsProvider> */}
      {/* <MessagesProvider> */}
      <MatcalcPage />
      {/* </MessagesProvider> */}
      {/* </GenesetsProvider> */}
      {/* </GroupsProvider> */}
      {/* </SearchFilterProvider> */}
      {/* </MatcalcSettingsProvider> */}
    </CoreProviders>
  )
}

function plotElem(plot: HistoryPlot): ReactElement {
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
    // case 'lollipop':
    //   return (
    //     <LollipopPanelQuery key={plot.id} id={plot.id} plotAddr={plot.id} />
    //   )
    default:
      return <></>
  }
}
