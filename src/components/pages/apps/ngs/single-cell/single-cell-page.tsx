'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { BaseCol } from '@/layout/base-col'

import { ZoomSlider } from '@/toolbar/zoom-slider'

import { produce } from 'immer'

import { useEffect, useRef, useState } from 'react'

import { FileImageIcon } from '@/icons/file-image-icon'

import { downloadSvgAutoFormat } from '@/lib/image-utils'

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
  TEXT_SAVE_TABLE,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { makeUuid } from '@/lib/id'
import { useZoom } from '@/providers/zoom-provider'
import { Card } from '@/themed/card'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import { BaseRow } from '@/components/layout/base-row'
import { IconButton } from '@/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
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
import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-provider'
import { useStableId } from '@/hooks/stable-id'
import { useAppInfo, useEdbSettings } from '@/lib/edb/edb-settings'
import { CoreProviders } from '@/providers/core-providers'
import { useFooter } from '@/providers/footer-provider'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { CirclePlus } from 'lucide-react'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { useSave } from '../../matcalc/hooks/save'
import { DisplayPropsPanel } from './display-props-panel'
import { usePlotGrid } from './plot-grid-store'
import { SingleCellDialogsRoot } from './single-cell-dialogs'
import { useSingleCellSettings, type GeneSetMode } from './single-cell-settings'
import { HomeToolbar } from './toolbars/home-toolbar'
import { UmapPlotSvg } from './umap-plot-svg'

const PLOT_ZOOM_CHANNEL = 'single-cell-plot-zoom'

export function SingleCellPage() {
  const _id = useStableId('single-cell-page')

  const { goto } = useHistory()

  const { file } = useFiles()
  const { sheets } = useCurrentSheets()

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

  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

  const { save } = useSave()

  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

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
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  useEffect(() => {
    setSideTabs([
      {
        id: TEXT_DISPLAY,
        component: DisplayPropsPanel,
      },
      {
        id: 'Plots',
        component: PlotsPropsPanel,
      },
      {
        id: 'Clusters',
        component: ClusterPropsPanel,
      },
    ])
  }, [setSideTabs])

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      icon: <DownloadIcon />,
      render: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => save('single-cell', 'txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_CSV}
            onClick={() => save('single-cell', 'csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      render: (
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
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <TabSlideBar
          side="right"
          //value={selectedPlotTab}
          //onTabChange={selectedTab => setSelectedPlotTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup orientation="vertical" className="px-2">
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
                          name: sheets[0].name,
                          callback: (data) => {
                            save('single-cell', data.format.ext)
                          },
                        },
                      })
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </BaseCol>
                <TabbedDataFrames
                  //selectedSheet={sheet?.id ?? ''}
                  //dataFrames=sheets.map((s) => s) as AnnotationDataFrame[]}
                  // onTabChange={(selectedTab) => {
                  //   goto({ file, sheet: selectedTab.tab })
                  // }}
                  className="relative grow"
                />
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        {/* <>{sideContent}</> */}
        {/* </SlideBar> */}

        <FooterPortal className="justify-between">
          <> </>
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
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <SingleCellPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
