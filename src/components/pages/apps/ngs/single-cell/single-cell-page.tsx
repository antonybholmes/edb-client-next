'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { BaseCol } from '@/layout/base-col'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'
import { produce } from 'immer'

import { useEffect, useRef, useState } from 'react'

import { FileImageIcon } from '@/icons/file-image-icon'

import { downloadSvgAutoFormat } from '@/lib/image-utils'

import { LayersIcon } from '@/icons/layers-icon'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { type ITab } from '@/components/tabs/tab-provider'
import {
  TEXT_DISPLAY,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  TEXT_SAVE_IMAGE,
  TEXT_SAVE_TABLE,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { makeUuid } from '@/lib/id'
import { useZoom } from '@/providers/zoom-provider'
import { Card } from '@/themed/card'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
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
import { ShowSideButton } from '../../../show-side-button'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'

import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { ClusterPropsPanel } from './cluster-props-panel'
import APP_INFO from './manifest.json'
import { PlotsPropsPanel } from './plots-props-panel'

import { ExportIcon } from '@/components/icons/export-icon'
import { FileIcon } from '@/components/icons/file-icon'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { OPTS_SIDEBAR_ID } from '@/components/slide-bar/resizable-sidebar'
import { useStableId } from '@/hooks/stable-id'
import { useAppInfo, useEdbSettings } from '@/lib/edb/edb-settings'
import { CoreProviders } from '@/providers/core-providers'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { CirclePlus } from 'lucide-react'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import {
  HistoryProvider,
  useHistory,
} from '../../matcalc/history/history-provider/history-provider'
import { DisplayPropsPanel } from './display-props-panel'
import { usePlotGrid } from './plot-grid-store'
import { SingleCellDialogsRoot } from './single-cell-dialogs'
import { useSingleCellSettings, type GeneSetMode } from './single-cell-settings'
import { UmapPlotSvg } from './umap-plot-svg'

const PLOT_ZOOM_CHANNEL = 'single-cell-plot-zoom'

export function SingleCellPage() {
  const _id = useStableId('single-cell-page')

  const { goto } = useHistory()

  const { file } = useFiles()
  const { sheet, sheets } = useCurrentSheets()

  const { open: openDialog } = useDialogs()

  const [showSideBar, setShowSideBar] = useState(true)

  const { searchGenes, dataset, datasets, setDataset } = usePlotGrid()

  //const [genes, setGenes] = useState<IScrnaGene[]>([])
  const [genesForUse, setGenesForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  //const [search, setSearch] = useState('=aicda')

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
  const { setAppInfo } = useAppInfo()

  const { settings: edbSettings } = useEdbSettings()

  const [showFileMenu, setShowFileMenu] = useState(false)

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

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  function save(format: string) {
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
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() => {
                openDialog({
                  type: 'save-image',
                  payload: {
                    name: 'umap',
                    svgRef,
                  },
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      id: TEXT_DISPLAY,
      icon: <SlidersIcon />,
      content: <DisplayPropsPanel />,
    },
    {
      id: 'Plots',
      icon: <LayersIcon />,

      content: <PlotsPropsPanel datasetId={dataset?.id ?? ''} />,
    },
    {
      id: 'Clusters',
      icon: <LayersIcon />,
      content: <ClusterPropsPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      icon: <DownloadIcon />,
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

  function handleSearch(value: string) {
    console.log('search', value)
    updateSettings({ search: value })
  }

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
        <Autocomplete
          value={settings.search}
          clear={() => updateSettings({ search: '' })}
          onTextChange={handleSearch}
          className="w-3/4 lg:w-3/5 text-sm"
          rightChildren={
            <button
              title="Add selected genes"
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
              }}
            >
              <CirclePlus size={16} />
            </button>
          }
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

                <span className="truncate shrink opacity-50 text-xxs">
                  {g.geneId}
                </span>
              </AutocompleteLi>
            )
          })}
        </Autocomplete>

        <SelectList
          variant="header"
          value={dataset?.id ?? ''}
          onValueChange={(v) => {
            setDataset(datasets?.find((d) => d.id === v)!)
          }}
          // make display nicer
          items={datasets.map((d) => ({ value: d.id, label: d.name })) || []}
          className="text-xs"
        >
          {datasets.map((dataset) => (
            <SelectItem key={dataset.id} value={dataset.id}>
              {dataset.name}
            </SelectItem>
          ))}
        </SelectList>
      </HeaderPortal>

      <SingleCellDialogsRoot />

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
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <TabSlideBar
          id={OPTS_SIDEBAR_ID}
          side="right"
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
                    onClick={() => {
                      openDialog({
                        type: 'save',
                        payload: {
                          name: sheet?.name ?? 'table',
                          callback: (data) => {
                            save(data.format.ext)
                          },
                        },
                      })
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </BaseCol>
                <TabbedDataFrames
                  selectedSheet={sheet?.id ?? ''}
                  dataFrames={sheets.map((s) => s) as AnnotationDataFrame[]}
                  onTabChange={(selectedTab) => {
                    goto({ file, sheet: selectedTab.tab })
                  }}
                  className="relative grow"
                />
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        {/* <>{sideContent}</> */}
        {/* </SlideBar> */}

        <FooterPortal className="justify-between">
          <>{getFormattedShape(sheet as AnnotationDataFrame)} </>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SingleCellQueryPage() {
  return (
    <CoreProviders>
      <HistoryProvider app={APP_INFO.name}>
        <SingleCellPage />
      </HistoryProvider>
    </CoreProviders>
  )
}
