'use client'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { ToolbarButton } from '@/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@/toolbar/toolbar-optional-dropdown-button'

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
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_HOME,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { type IClusterFrame } from '@/lib/math/hcluster'

import { useEffect, useMemo, useState, type ReactElement } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { makeUuid } from '@/lib/id'
import { useSelectionRange } from '@/providers/selection-range'

import { VolcanoPanel } from './apps/volcano/volcano-panel'
import { type PlotStyle } from './plots-provider'

import { DataSortIcon } from '@/icons/data-sort-icon'
import { DownloadIcon } from '@/icons/download-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { FilterIcon } from '@/icons/filter-icon'
import { OpenIcon } from '@/icons/open-icon'
import { UploadIcon } from '@/icons/upload-icon'

import { ToolbarDropdownButton } from '@/toolbar/toolbar-dropdown-button'

import { ShowSideButton } from '@/components/pages/show-side-button'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { type ITab } from '@/components/tabs/tab-provider'
import { TransposeIcon } from '@/icons/transpose-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  type OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import { snrRankGenes } from '@/lib/gsea/gsea2'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'

import { BoxPlotPanel } from './apps/boxplot/boxplot-panel'
import APP_INFO from './manifest.json'

import { useSettingsTabs } from '@/dialogs/settings/setting-tabs-store'

import { CubeIcon } from '@/icons/cube-icon'
import { ExportIcon } from '@/icons/export-icon'

import { logrankExample } from '@/lib/math/logrank'

import { ExtGseaPanelQuery } from './apps/ext-gsea/ext-gsea-panel'
import { DataPanel, MESSAGE_CHANNEL } from './data/data-panel'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'
import { useSlideBar } from '@/components/slide-bar/slide-bar-store'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarHelpTabGroup } from '@/help/toolbar-help-tab-group'
import { HeaderButton } from '@/layouts/header-button'
import type { IClusterGroup } from '@/lib/cluster-group'
import type { IGeneSet } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'
import { Toast } from '@base-ui/react/toast'
import { DecimalsArrowLeft, DecimalsArrowRight } from 'lucide-react'
import { HeatmapPanel } from './apps/heatmap/heatmap-panel'
import { HistoryLayout, HistoryShowButton } from './history/history-layout'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { CommaIcon } from '@/components/icons/comma-icon'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { useMessages } from '@/providers/messages'
import { useExtGseaWorker } from './apps/ext-gsea/ext-gsea-worker'
import { HeatmapProvider } from './apps/heatmap/heatmap-provider'
import { VolcanoProvider } from './apps/volcano/volcano-provider'
import { OptsSidebarMenu } from './data/opts-sidebar-menu'
import {
  HistoryProvider,
  useHistory,
} from './history/history-provider/history-provider'

import { pathJoin } from './history/history-provider/history-actions'

import {
  useCurrentGroups,
  useCurrentPlots,
  useCurrentSelections,
  useCurrentSheets,
  useFiles,
} from './history/history-provider/history-contexts'
import { newExtGseaPlot } from './history/history-provider/history-factories'
import { useAllPlots } from './history/history-provider/history-hooks'
import { HistoryPlot } from './history/history-provider/history-types'
import { UndoShortcuts } from './history/undo-shortcuts'
import { MatcalcDialogsRoot, useMatcalcDialogs } from './matcalc-dialogs'
import { MatcalcFileTree } from './matcalc-file-tree'
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

export const TAB_PLOTS = 'Plots'

export const TEXT_HEATMAP = 'Heatmap'
export const TEXT_DOT_PLOT = 'Dot Plot'

// const DEFAULT_DATA_TABLE_TAB: ITab = {
//   //id: nanoid(),
//   id: DEFAULT_TABLE_NAME,
//   icon: <TableIcon />,
//   isOpen: true,
// }

function plotElem(plot: HistoryPlot): ReactElement {
  switch (plot.style) {
    case 'heatmap':
    case 'dot':
      return (
        <HeatmapProvider plot={plot}>
          <HeatmapPanel />
        </HeatmapProvider>
      )
    case 'volcano':
      return (
        <VolcanoProvider plot={plot}>
          <VolcanoPanel />
        </VolcanoProvider>
      )
    case 'box':
      return <BoxPlotPanel plotAddr={plot.id} />
    case 'ext-gsea':
      return <ExtGseaPanelQuery plotAddr={plot.id} />
    // case 'lollipop':
    //   return (
    //     <LollipopPanelQuery key={plot.id} id={plot.id} plotAddr={plot.id} />
    //   )
    default:
      return <></>
  }
}

export function MatcalcPage() {
  const { openFile, addSheets, addPlots } = useHistory()
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  //const {toast} = useToast()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const { setAppInfo } = useAppInfo()

  const { settings, updateSettings } = useMatcalcSettings()

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

  //const appPath = `/${app?.id}`
  //const files = useFiles()
  const { file } = useFiles()

  //const currentFile = `${appPath}/${file?.id}`

  const { groups, genesets } = useCurrentGroups()

  const { sheet, sheets } = useCurrentSheets()

  const { plot } = useCurrentPlots()

  const { selection: currentSelection } = useCurrentSelections()
  //const plots = usePlots()

  // we need all plots from all files in the current app to be
  // able to display them in the file tree and access
  // them when clicking on a plot tab
  const plots = useAllPlots()

  //console.log('plots', plots)

  const { setSettingsTabs, setDefaultSettingsTab } = useSettingsTabs()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { open, setOpen } = useSlideBar(folderId) //) //'matcalc') //useContext(MessageContext)

  //const extGseaWorkerRef = useRef<Worker | null>(null)

  const { run: runExtGseaWorker } = useExtGseaWorker()

  const { add: addToast, close: closeToast } = Toast.useToastManager()

  //const {setTab: setToolbarTab} = useTabs(TOOLBAR_GROUP_ID)

  //const branch = searchForBranch(branch?.id??'', history)[0]
  //const step = currentStep(branch)[0]
  //const sheet = currentSheet(step)[0]
  //const sheets = step?.sheets

  useEffect(() => {
    // open a dedicated history app for this module
    //openApp(APP_INFO.name)
    setAppInfo(APP_INFO)

    // custom settings for the global settings app
    const settingsTabs: ITab[] = [
      {
        id: APP_INFO.name,
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
    setDefaultSettingsTab(APP_INFO.name)
    //setSelectedPanelTab(branch.id)

    // extGseaWorkerRef.current = new Worker(
    //   new URL('./apps/ext-gsea/ext-gsea.worker.ts', import.meta.url),
    //   {
    //     type: 'module',
    //   }
    // )
  }, [])

  useEffect(() => {
    if (currentSelection?.id) {
      setSelectedPanelTab(currentSelection.id)
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

  async function loadAnnotateTestData() {
    const res = await httpFetch.getText('/data/test/annotate.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(0).read(lines)

    openFile(`Test locations`, {
      sheets: [table.setName('Test Locations') as AnnotationDataFrame],
    })
  }

  function _addPlots(plots: HistoryPlot[]) {
    addPlots(plots)
    setSelectedPanelTab(pathJoin(file, plots[0]!))
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

    const genesets = await httpFetch.getJson<IGeneSet[]>(
      '/data/test/extgsea/genesets.json'
    )

    openFile(`Ext GSEA Test`, {
      groups,
      genesets,
      sheets: [table.setName('Ext GSEA Test') as AnnotationDataFrame],
    })
  }

  function openFiles(files: ITextFileOpen[], options: IParseOptions = {}) {
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
      onError: () => {
        addToast({
          id: makeUuid(),
          title: APP_INFO.name,
          description:
            'Your files could not be opened. Check they are formatted correctly.',
          type: 'destructive',
        })
      },
    })

    setShowFileMenu(false)
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

    const id = makeUuid()

    addToast({
      id,
      title: APP_INFO.name,
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

    runExtGseaWorker(
      {
        rankedGenes,
        gs1,
        gs2,
      },
      (data) => {
        const { extGseaRes, gseaRes1, gseaRes2 } = data

        const plot = {
          ...newExtGseaPlot('Extended GSEA', {
            rankedGenes,
            gs1: gs1,
            gs2: gs2,
            extGseaRes,
            gseaRes1,
            gseaRes2,
          }),
        }

        _addPlots([plot])
        // we've finished so get rid of the animations
        closeToast(id)
      }
    )
  }

  function makeClusterMap(isClusterMap: boolean) {
    openMatcalcDialog({
      type: 'heatmap',
      payload: {
        isClusterMap,
        callback: (plot) => _addPlots([plot]),
      },
    })
  }

  function makeDotPlot(isClusterMap: boolean) {
    openMatcalcDialog({
      type: 'dot-plot',
      payload: {
        isClusterMap,
        callback: (plot) => _addPlots([plot]),
      },
    })
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

  function _open(message: string, files: FileList | []) {
    onTextFileChange(message, files, (files) => {
      openMatcalcDialog({
        type: 'open-table-file',
        payload: { files, callback: openFiles },
      })
    })
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_HOME,
      //size: 2.1,
      content: (
        <>
          <ToolbarTabGroup title="File" className="items-start">
            <ToolbarOpenFile
              onOpen={() => {
                openDialog({
                  type: 'open',
                  payload: {
                    callback: _open,
                  },
                })
              }}
            />

            {/* <ToolbarColSmallButton
              title="Download current table locally"
              onClick={() => {
                console.log('save', file?.id ?? '')
                sendMessage({
                  type: 'info',
                  source: 'matcalc',
                  target: file?.id ?? '',
                  data: 'save',
                })
              }}
              icon={<DownloadIcon   />}
            >
              {TEXT_DOWNLOAD}
            </ToolbarColSmallButton> */}

            <ToolbarIconButton
              title="Download current table to device"
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

          <ToolbarTabGroup title="Plot" className="items-start">
            <ToolbarCol>
              <ToolbarButton
                onClick={() => makeClusterMap(false)}
                aria-label={TEXT_HEATMAP}
              >
                {TEXT_HEATMAP}
              </ToolbarButton>
              <ToolbarButton
                onClick={() => makeDotPlot(false)}
                aria-label={TEXT_DOT_PLOT}
              >
                Dot
              </ToolbarButton>
            </ToolbarCol>
            <ToolbarCol>
              <ToolbarButton
                title="Create Volcano Plot from Table"
                onClick={() => {
                  openMatcalcDialog({
                    type: 'volcano-plot',
                    payload: {
                      callback: (plot) => _addPlots([plot]),
                    },
                  })
                }}
              >
                Volcano
              </ToolbarButton>

              <ToolbarButton
                title="Create Box Plot from Table"
                onClick={() => {
                  openMatcalcDialog({
                    type: 'box-whiskers',
                    payload: {
                      callback: (plot) => _addPlots([plot]),
                    },
                  })
                }}
              >
                Box
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Gene Expression">
            <ToolbarButton
              title="Download Gene Expression Data"
              onClick={() => openMatcalcDialog({ type: 'gex', payload: {} })}
            >
              Gene Expression
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Number" className="items-start">
            <ToolbarIconButton
              checked={settings.view.commas}
              title="Comma"
              onClick={() =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.view.commas = !draft.view.commas
                  })
                )
              }
            >
              <CommaIcon />
            </ToolbarIconButton>
            <ToolbarCol>
              <ToolbarIconButton
                title="Decrease Decimal"
                onClick={() =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.view.dp = Math.max(draft.view.dp - 1, 0)
                    })
                  )
                }
              >
                <DecimalsArrowLeft strokeWidth={1.5} size={20} />
              </ToolbarIconButton>
              <ToolbarIconButton
                title="Increase Decimal"
                onClick={() =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.view.dp = Math.min(draft.view.dp + 1, 10)
                    })
                  )
                }
              >
                <DecimalsArrowRight strokeWidth={1.5} size={20} />
              </ToolbarIconButton>
            </ToolbarCol>
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      id: 'Data',

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

          <ToolbarTabGroup title="Cluster">
            <ToolbarButton
              title="K-means Clustering"
              onClick={() => {
                openMatcalcDialog({
                  type: 'kmeans',
                  payload: {
                    callback: (data: {
                      df: AnnotationDataFrame
                      drawHeatmap: boolean
                    }) => {
                      openMatcalcDialog({
                        type: 'heatmap',
                        payload: {
                          sheet: data.df,
                          callback: (plot) => _addPlots([plot]),
                        },
                      })
                    },
                  },
                })
              }}
            >
              K-means
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Rows">
            <ToolbarIconButton
              title="Filter Top Rows using Statistics"
              onClick={() => {
                openMatcalcDialog({
                  type: 'top-rows',
                  payload: {},
                })
              }}
            >
              <FilterIcon />
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Sort Columns by Specific Rows"
              onClick={() => {
                if (selection) {
                  openMatcalcDialog({
                    type: 'sort-rows',
                    payload: {
                      selection,
                    },
                  })
                }
              }}
            >
              <DataSortIcon />
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
            </>
          )}
        </>
      ),
    },
    {
      id: 'Gene',
      content: (
        <>
          <ToolbarTabGroup title="Annotation">
            <ToolbarCol>
              <ToolbarButton
                title="Convert Gene Symbols between Human and Mouse"
                onClick={() => {
                  openMatcalcDialog({
                    type: 'gene-species-convert',
                    payload: {},
                  })
                }}
              >
                Convert Species
              </ToolbarButton>

              <ToolbarButton
                title="Convert Motifs to Gene Symbols"
                onClick={() => {
                  if (selection) {
                    openMatcalcDialog({
                      type: 'motif-to-gene',
                      payload: {
                        selection,
                        // callback: (response, data) => {
                        //   if (response === TEXT_OK && data) {
                        //     addSheets([data])
                        //   }
                        // },
                      },
                    })
                  }
                }}
              >
                Motif To Gene
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="GSEA">
            <ToolbarCol>
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
            </ToolbarCol>
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      id: 'Genomic',
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

          <ToolbarTabGroup title="Annotation">
            <ToolbarCol>
              <ToolbarButton
                title="Annotate Locations"
                onClick={() => {
                  openMatcalcDialog({
                    type: 'annotate',
                    payload: {
                      selection: selection!,
                    },
                  })
                }}
              >
                Annotate
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      id: 'Help',
      content: <ToolbarHelpTabGroup url={HELP_URL} />,
    },
  ]

  const fileMenuTabs: ITab[] = useMemo(
    () => [
      {
        //id: nanoid(),
        id: 'Open',
        icon: <OpenIcon variant="colorful" />,
        content: (
          <DropdownMenuItem
            aria-label={TEXT_OPEN_FILE}
            onClick={() => {
              openDialog({
                type: 'open',
                payload: {
                  callback: _open,
                },
              })
            }}
          >
            <UploadIcon />

            <span>{TEXT_OPEN_FILE}</span>
          </DropdownMenuItem>
        ),
      },
      {
        id: '<divider>',
      },
      {
        id: TEXT_SAVE_AS,
        icon: <DownloadIcon />,
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
    ],
    [file?.id, plot?.id, sendMessage]
  )

  const mainContent = (
    <Tabs
      //defaultValue={selectedTab.id}
      value={selectedPanelTab}
      className="min-h-0 h-full flex flex-col grow"
    >
      {/* Shows the current sheet so tab needs id of current sheet. If no sheet, show empty data panel */}
      <TabsContent value={sheet?.id ?? ''}>
        <DataPanel />
      </TabsContent>

      {plots.map((plot) => {
        return (
          <TabsContent key={plot.id} value={plot.id}>
            {plotElem(plot)}
          </TabsContent>
        )
      })}
    </Tabs>
  )

  return (
    <>
      <MatcalcDialogsRoot />

      <HeaderSlotPortal slot="header-left">
        <AppHeaderIcon />
        <AppInfoButton />
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
            <DropdownMenuItem onClick={() => loadAnnotateTestData()}>
              Annotate
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
            info={APP_INFO}
            leftShortcuts={
              <>
                <ShowSideButton
                  open={open}
                  onClick={() => {
                    setOpen(!open)
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
            tabShortcutMenu={<OptsSidebarMenu open={settings.sidebar.show} />}
          />
        </Toolbar>
        <HistoryLayout>
          <ResizableSidebar
            id={folderId}
            side="left"
            className="grow"
            showCloseButton={false}
          >
            {mainContent}
            <MatcalcFileTree />
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
      <HistoryProvider app={APP_INFO.name}>
        <MatcalcPage />
      </HistoryProvider>
      {/* </MessagesProvider> */}
      {/* </GenesetsProvider> */}
      {/* </GroupsProvider> */}
      {/* </SearchFilterProvider> */}
      {/* </MatcalcSettingsProvider> */}
    </CoreProviders>
  )
}
