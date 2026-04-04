'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'

import { BaseCol } from '@/layout/base-col'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'
import { produce } from 'immer'

import { useEffect, useRef, useState } from 'react'

import { FileImageIcon } from '@/icons/file-image-icon'

import { downloadSvgAutoFormat } from '@/lib/image-utils'

import { LayersIcon } from '@/icons/layers-icon'

import { OpenDialog } from '@/components/pages/apps/matcalc/open-dialog'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { type ITab } from '@/components/tabs/tab-provider'
import {
  NO_DIALOG,
  TEXT_ADD,
  TEXT_CANCEL,
  TEXT_DISPLAY,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  TEXT_SAVE_IMAGE,
  TEXT_SAVE_TABLE,
  type IDialogParams,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { makeUuid, randId } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { truncate } from '@/lib/text/text'
import { useZoom } from '@/providers/zoom-provider'
import { Card } from '@/themed/card'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { SlidersIcon } from '@/components/icons/sliders-icon'
import { BaseRow } from '@/components/layout/base-row'
import { IconButton } from '@/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { SaveImageDialog } from '../../../save-image-dialog'
import { ShowSideButton } from '../../../show-side-button'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { ClusterPropsPanel } from './cluster-props-panel'
import MODULE_INFO from './module.json'
import { PlotsPropsPanel } from './plots-props-panel'

import { ExportIcon } from '@/components/icons/export-icon'
import { FileIcon } from '@/components/icons/file-icon'
import { Button } from '@/themed/v2/button'

import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import { useStableId } from '@/hooks/stable-id'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { CoreProviders } from '@/providers/core-providers'
import { SelectItem, SelectList } from '@/themed/v2/select'
import {
  OPTS_SIDEBAR_ID,
  ShowOptsSidebarBtn,
} from '../../matcalc/data/data-panel'
import { DisplayPropsPanel } from './display-props-panel'
import { usePlotGrid } from './plot-grid-store'
import { useSingleCellSettings, type GeneSetMode } from './single-cell-settings'
import { UmapPlotSvg } from './umap-plot-svg'

const PLOT_ZOOM_CHANNEL = 'single-cell-plot-zoom'

export function SingleCellPage() {
  const _id = useStableId('single-cell-page')

  const { goto, openFile } = useHistory()

  const app = useApp()!
  const file = useFile()!
  const sheets = useSheets()
  const sheet = useSheet()

  //const [clusterFrame, setClusterFrame] = useState<BaseDataFrame | null>(null)
  //const [cmap, setCMap] = useState<ColorMap>(BRIGHT_20_CMAP) //BWR_CMAP)

  //const [genome] = useState<IGenome>(GENOMES[0]!)
  //const [datasets, setDatasets] = useState<IScrnaDataset[]>([])

  //const [metadata, setMetadata] = useState<IScrnaDatasetMetadata | null>(null)

  //const [gexData, setGexData] = useState<Record<string, number[]>>({})

  const [showSideBar, setShowSideBar] = useState(true)

  const { searchGenes, dataset, datasets, setDataset } = usePlotGrid()

  //const [genes, setGenes] = useState<IScrnaGene[]>([])
  const [genesForUse, setGenesForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [search, setSearch] = useState('=aicda')

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  //const [selectedTab, setSelectedTab] = useState('Data')
  //const [selectedRightTab, setSelectedRightTab] = useState(0)
  //const [selectedPlotTab, setSelectedPlotTab] = useState('Display')
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)

  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  //const [scale, setScale] = useState(1)

  const { settings, updateSettings } = useSingleCellSettings()

  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const [filesToOpen, setFilesToOpen] = useState<ITextFileOpen[]>([])

  //const { fetchAccessToken } = useEdbAuth()

  // useEffect(() => {
  //   const palette = new ColorMap(
  //     'Clusters',
  //     clusterInfo.clusters.map(l => l.color)
  //   )

  //   setPalette(palette)
  // }, [clusterInfo])

  // useEffect(() => {
  //   //setPlot({ ...plot, palette: COLOR_MAPS[settings.cmap]! })
  //   //if (settings.mode.includes('gex')) {

  //   loadGex(settings.genesets) // setupGexPlot(selectedDataset, settings.genesets, gexData)
  // }, [
  //   //settings.cmap,
  //   //settings.zscore.on,
  //   settings.grid.on,
  //   settings.zscore.range[0],
  //   settings.zscore.range[1],
  //   settings.genesets,
  // ])

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    if (files.length < 1) {
      return
    }

    const file = files[0]!
    const name = file.name

    const { indexCols, colNames } = options

    const lines = textToLines(file.text)

    const sep = name.endsWith('csv') ? ',' : '\t'

    const table = new DataFrameReader()
      .delimiter(sep)
      .colNames(colNames!)
      .indexCols(indexCols!)
      .read(lines)

    //resolve({ ...table, name: file.name })

    openFile(name, {
      sheets: [table.setName(truncate(name, { length: 16 }))],
    })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    setShowFileMenu(false)

    setFilesToOpen([])
  }

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  function save(format: 'txt' | 'csv') {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'
    const hasHeader = !sheet.name.includes('GCT')
    const hasIndex = !sheet.name.includes('GCT')

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader,
      hasIndex,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            {/* <ToolbarOpenFile
                
                onOpenChange={open => setShowDialog(open ? "open" : "")}
                onFileChange={onFileChange}
                multiple={true}
              /> */}

            {/* <ToolbarButton
                arial-label="Save matrix to local file"
                onClick={() => save("txt")}
              >
                <FloppyDiskIcon className="-scale-100 fill-blue-400" />
                Save
              </ToolbarButton>

              {selectedTab === 1 && (
                <ToolbarSaveSvg
                  svgRef={svgRef}
                />
              )} */}

            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() =>
                setShowDialog({
                  id: randId(`save-plot`),
                })
              }
            >
              <DownloadImageIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          {/* <ToolbarSeparator />
          <ToolbarTabGroup title="UMAP">
            <ToolbarButton
              arial-label="Create UMAP"
              onClick={() => loadClusters()}
            >
              <PlayIcon />
              Cluster
            </ToolbarButton>
          </ToolbarTabGroup> */}
          <ToolbarSeparator />
        </>
      ),
    },
    // {
    //   //id: nanoid(),
    //   id: 'Chart',
    //   content: (
    //     <>
    //       <ToolbarOptionalDropdownButton
    //         icon="Right"
    //         onMainClick={() => dfLog(sheet!, addStep, 2, 1)}
    //       >
    //         <DropdownMenuItem
    //           aria-label="Top"
    //           onClick={() => dfLog(sheet!, addStep, 2, 0)}
    //         >
    //           Top
    //         </DropdownMenuItem>

    //         <DropdownMenuItem
    //           aria-label="Add 1 to matrix then log2"
    //           onClick={() => dfLog(sheet!, addStep, 2, 1)}
    //         >
    //           Left
    //         </DropdownMenuItem>

    //         <DropdownMenuItem
    //           aria-label="Log10"
    //           onClick={() => dfLog(sheet!, addStep, 10, 0)}
    //         >
    //           Bottom
    //         </DropdownMenuItem>

    //         <DropdownMenuItem
    //           aria-label="Add 1 to matrix then log10"
    //           onClick={() => dfLog(sheet!, addStep, 10, 1)}
    //         >
    //           Right
    //         </DropdownMenuItem>
    //       </ToolbarOptionalDropdownButton>
    //     </>
    //   ),
    // },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_DISPLAY,
      icon: <SlidersIcon />,
      content: <DisplayPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Plots',
      content: <PlotsPropsPanel datasetId={dataset?.id ?? ''} />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Clusters',
      content: <ClusterPropsPanel />,
    },
    // {
    //   //id: nanoid(),
    //   icon: <ClockIcon />,
    //   id: 'History',
    //   content: <HistoryPanel />,
    // },
  ]

  //const plotTabs: ITab[] = useMemo(() => [], [filterRowMode, state, groups])

  // const sideTabs: ITab[] = [
  //   {
  //     //id: nanoid(),
  //     icon: <TableIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
  //     id: 'Data',
  //     content: (
  //       <>
  //         <TabSlideBar
  //           id="umap"
  //           side="Right"
  //           key="sidebar-table"
  //           tabs={rightTabs}
  //           value={selectedPlotTab}
  //           onTabChange={selectedTab => setSelectedPlotTab(selectedTab.tab.id)}
  //         >
  //           <TabbedDataFrames
  //             key="tabbed-data-frames"
  //             selectedSheet={sheet?.id ?? ''}
  //             dataFrames={sheets as AnnotationDataFrame[]}
  //             onTabChange={selectedTab => {
  //               gotoSheet(selectedTab.tab.id)
  //             }}
  //             className={SHEET_PANEL_CLS}
  //           />
  //         </TabSlideBar>

  //         <ToolbarFooterPortal className="justify-between">
  //           <>{getFormattedShape(sheet)} </>
  //           <></>
  //           <ZoomSlider />
  //         </ToolbarFooterPortal>
  //       </>
  //     ),
  //   },
  //   {
  //     //id: nanoid(),
  //     icon: <LineChartIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
  //     id: 'Chart',
  //     content: (
  //       <>
  //         <TabSlideBar
  //           id="umap-table"
  //           side="Right"
  //           key="sidebar-table"
  //           tabs={rightTabs}
  //           value={selectedPlotTab}
  //           onTabChange={selectedTab => setSelectedPlotTab(selectedTab.tab.id)}
  //         >
  //           <Card variant="content" className="ml-2">
  //             <div
  //               key="scatter"
  //               className={'relative overflow-scroll custom-scrollbar grow'}
  //             >
  //               {clusterFrame && (
  //                 <ScatterPlotCanvas
  //                   df={clusterFrame}
  //                   cmap={cmap}
  //                   x="UMAP1"
  //                   y="UMAP2"
  //                   hue="Hue"
  //                   displayProps={settings}
  //                   className="absolute bottom-0 left-0 right-0 top-0"
  //                 />
  //               )}
  //             </div>
  //           </Card>
  //         </TabSlideBar>

  //         <ToolbarFooterPortal className="justify-between">
  //           <></>

  //           <></>
  //           <ZoomSlider
  //             className={cn([selectedTab === 'Chart', 'visible', 'invisible'])}
  //           />
  //         </ToolbarFooterPortal>
  //       </>
  //     ),
  //   },
  // ]

  const fileMenuTabs: ITab[] = [
    // {
    //   //id: nanoid(),
    //   id: 'Open',
    //   icon: <OpenIcon className="fill-white" w="w-5" />,
    //   content: (
    //     <BaseCol className="gap-y-6 p-6">
    //       <h1 className="text-2xl">Open</h1>

    //       <ul className="flex flex-col gap-y-2 text-xs">
    //         <li>
    //           <MenuButton
    //             aria-label="Open file on your computer"
    //             onClick={() => setShowDialog({ id: randId('open') })}
    //           >
    //             <OpenIcon className="text-amber-300" />
    //             <p>
    //               <span className={FILE_MENU_ITEM_HEADING_CLS}>
    //                 Open local file
    //               </span>
    //               <br />
    //               <span className={FILE_MENU_ITEM_DESC_CLS}>
    //                 Open a local file on your computer.
    //               </span>
    //             </p>
    //           </MenuButton>
    //         </li>
    //       </ul>
    //     </BaseCol>
    //   ),
    // },

    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      icon: <DownloadIcon stroke="stroke-theme" />,
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => save('txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_CSV}
            onClick={() => save('csv')}
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
              downloadSvgAutoFormat(svgRef, `motifs.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `motifs.svg`)
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  // const sideContent = useMemo(() => {
  //   return (
  //     <BaseCol className="px-2 grow">
  //       <VScrollPanel className="grow">
  //         {datasets?.map(dataset => {
  //           return (
  //             <Checkbox
  //               key={dataset.name}
  //               checked={dataset.name === selectedDataset?.name}
  //               onClick={() => setSelectedDataset(dataset)}
  //             >
  //               {dataset.name}
  //             </Checkbox>
  //           )
  //         })}
  //       </VScrollPanel>
  //     </BaseCol>
  //   )
  // }, [datasets, selectedDataset])

  function handleSearch(value: string) {
    setSearch(value)

    // const lc = value.toLowerCase()

    // setSearchGenes(
    //   genes.filter(
    //     g =>
    //       g.sym.toLowerCase().startsWith(lc) ||
    //       g.ens.toLowerCase().startsWith(lc)
    //   )
    // )
  }

  return (
    <>
      {filesToOpen && (
        <OpenDialog
          files={filesToOpen}
          openFiles={openFiles}
          onCancel={() => setFilesToOpen([])}
        />
      )}

      {showDialog.id.includes('open') && (
        <OpenFiles
          //open={showDialog}
          //onOpenChange={open => setShowDialog(open ? "open" : "")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => setFilesToOpen(files))
          }
        />
      )}

      {/* <SaveImageDialog
        open={showDialog.id.includes('save-plot')}
        name="umap"
        onResponse={(response, data) => {
          if (response !== TEXT_CANCEL) {
            downloadCanvasAsPng(canvasRef, data!.name as string)
          }

          setShowDialog({ ...NO_DIALOG })
        }}
        formats={[PNG_FILE_FORMAT]}
      /> */}

      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          open={showDialog.id.startsWith('save')}
          name="umap"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string }
              downloadSvgAutoFormat(svgRef, d.name)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderPortal>
        <ModuleInfoButton info={MODULE_INFO} />

        <Autocomplete
          value={search}
          onTextChange={handleSearch}
          className="w-3/4 lg:w-1/2 text-sm"
        >
          {searchGenes?.map((g) => {
            return (
              <AutocompleteLi key={g.geneId}>
                <Checkbox
                  aria-label={`Select ${g.geneSymbol}`}
                  checked={genesForUse.get(g.geneId) ?? false}
                  onCheckedChange={() => {
                    setGenesForUse(
                      new Map<string, boolean>([
                        ...genesForUse.entries(),
                        [g.geneId, !genesForUse.get(g.geneId)],
                      ])
                    )
                  }}
                />

                <span className="grow text-xs truncate">{g.geneSymbol}</span>

                <span className="truncate shrink  opacity-50 text-xxs">
                  {g.geneId}
                </span>
              </AutocompleteLi>
            )
          })}

          <li className="flex items-center justify-end pt-2 px-2" key="add">
            <Button
              onClick={() => {
                const selectedGenes =
                  searchGenes?.filter(
                    (g) => genesForUse.get(g.geneId) ?? false
                  ) ?? []

                updateSettings(
                  produce(settings, (draft) => {
                    draft.genesets = [
                      ...draft.genesets,
                      ...selectedGenes.map((g) => ({
                        id: makeUuid(),
                        name: g.geneSymbol,
                        genes: [g],
                        mode: 'global-gex' as GeneSetMode,
                      })),
                    ]
                  })
                )

                // clear selections
                //setGenesForUse(new Map<string, boolean>())
                //setSearch('')
              }}
            >
              {TEXT_ADD}
            </Button>
          </li>
        </Autocomplete>

        <SelectList
          variant="header"
          value={dataset?.id ?? ''}
          onValueChange={(v) => {
            setDataset(datasets?.find((d) => d.id === v)!)
          }}
          // make display nicer
          items={datasets.map((d) => ({ value: d.id, label: d.name })) || []}
          className="text-sm"
        >
          {datasets.map((dataset) => (
            <SelectItem key={dataset.id} value={dataset.id} variant="theme">
              {dataset.name}
            </SelectItem>
          ))}
        </SelectList>
      </HeaderPortal>

      <ShortcutLayout
        signinRequired={false}

        // shortcuts={
        //   <Shortcuts
        //     tabs={sideTabs}
        //     onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
        //   />
        // }
      >
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={
              <>
                <ShowSideButton
                  onClick={() => setFoldersIsOpen(!foldersIsOpen)}
                />
                <UndoShortcuts />
              </>
            }
          />
          <ToolbarPanel
            groupId={_id}
            tabs={tabs}
            tabShortcutMenu={
              <ShowOptsSidebarBtn
                open={edbSettings.sidebar.show}
                onClick={(open) => {
                  updateEdbSettings(
                    produce(edbSettings, (draft) => {
                      draft.sidebar.show = open
                    })
                  )
                }}
              />
            }
          />
        </Toolbar>

        {/* <SlideBar
          id="matcalc-folders"
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 50]}
          hideLimit={1}
          initialPosition={15}
          side="left"
          className="grow"
        > */}
        <TabSlideBar
          id={OPTS_SIDEBAR_ID}
          side="right"
          key="sidebar-table"
          tabs={rightTabs}
          //value={selectedPlotTab}
          //onTabChange={selectedTab => setSelectedPlotTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup
            orientation="vertical"
            className="px-2"
            //autoSaveId="rev-comp-vert"
          >
            <ResizablePanel
              id="chart"
              defaultSize="75%"
              minSize="0%"
              className="flex flex-col text-sm"
              collapsible={true}
            >
              <Card className="grow" variant="content">
                <div className={PLOT_CLS}>
                  <UmapPlotSvg
                    ref={svgRef}
                    //plot={plot}
                    displayProps={settings}
                    className="absolute left-0 top-0"
                  />
                </div>
              </Card>
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              className="flex flex-col text-sm"
              id="output"
              defaultSize="25%"
              minSize="0%"
              collapsible={true}
            >
              <BaseRow className="gap-x-2 grow">
                <BaseCol className="shrink-0">
                  <IconButton
                    title={TEXT_SAVE_TABLE}
                    onClick={() =>
                      setShowDialog({
                        id: randId(`save-table`),
                      })
                    }
                  >
                    <DownloadIcon />
                  </IconButton>
                </BaseCol>
                <TabbedDataFrames
                  selectedSheet={sheet?.id ?? ''}
                  dataFrames={sheets.map((s) => s) as AnnotationDataFrame[]}
                  onTabChange={(selectedTab) => {
                    goto({ app, file, sheet: selectedTab.tab })
                  }}
                  className="relative grow"
                />
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        {/* <>{sideContent}</> */}
        {/* </SlideBar> */}

        <ToolbarFooterPortal className="justify-between">
          <>{getFormattedShape(sheet as AnnotationDataFrame)} </>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SingleCellQueryPage() {
  return (
    <CoreProviders>
      {/* <PlotGridProvider> */}
      <SingleCellPage />
      {/* </PlotGridProvider> */}
    </CoreProviders>
  )
}
