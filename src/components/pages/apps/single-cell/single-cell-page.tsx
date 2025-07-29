'use client'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { BaseCol } from '@layout/base-col'
import { ToolbarButton } from '@toolbar/toolbar-button'
import { ToolbarOptionalDropdownButton } from '@toolbar/toolbar-optional-dropdown-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'
import { ZoomSlider } from '@toolbar/zoom-slider'

import {
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'
import { produce } from 'immer'

import { useContext, useEffect, useRef, useState } from 'react'

import { FileImageIcon } from '@icons/file-image-icon'

import { BWR_CMAP_V2 } from '@lib/color/colormap'
import { downloadSvgAutoFormat } from '@lib/image-utils'

import { ClockIcon } from '@icons/clock-icon'
import { LayersIcon } from '@icons/layers-icon'
import { PlayIcon } from '@icons/play-icon'

import {
  NO_DIALOG,
  TEXT_ADD,
  TEXT_CANCEL,
  TEXT_DISPLAY,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  TEXT_SAVE_IMAGE,
  TEXT_SAVE_TABLE,
  type IDialogParams,
} from '@/consts'
import { useZoom } from '@/providers/zoom-provider'
import { OpenDialog } from '@components/pages/apps/matcalc/open-dialog'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { dfLog } from '@components/table/dataframe-ui'
import { type ITab } from '@components/tabs/tab-provider'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { textToLines } from '@lib/text/lines'
import { truncate } from '@lib/text/text'
import { nanoid, randId } from '@lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@themed/card'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { SaveIcon } from '@/components/icons/save-icon'
import { SlidersIcon } from '@/components/icons/sliders-icon'
import { BaseRow } from '@/components/layout/base-row'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/themed/resizable'
import { ThinVResizeHandle } from '@/components/split-pane/thin-v-resize-handle'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { argsort } from '@/lib/math/argsort'
import { findCenter } from '@/lib/math/centroid'
import { ordered } from '@/lib/math/ordered'
import { where } from '@/lib/math/where'
import { queryClient } from '@/query'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import {
  API_SCRNA_DATASETS_URL,
  API_SCRNA_GEX_URL,
  API_SCRNA_METADATA_URL,
  API_SCRNA_SEARCH_GENES_URL,
} from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { zeros } from '@lib/math/zeros'
import { SaveImageDialog } from '../../save-image-dialog'
import { ShowSideButton } from '../../show-side-button'
import { PLOT_CLS } from '../matcalc/apps/heatmap/heatmap-panel'
import { HistoryPanel } from '../matcalc/history/history-panel'
import { useHistory } from '../matcalc/history/history-store'
import { UndoShortcuts } from '../matcalc/history/undo-shortcuts'
import { ClusterPropsPanel } from './cluster-props-panel'
import MODULE_INFO from './module.json'
import { PlotsPropsPanel } from './plots-props-panel'

import { ExportIcon } from '@/components/icons/export-icon'
import { FileIcon } from '@/components/icons/file-icon'
import { Button } from '@/components/shadcn/ui/themed/button'
import {
  makeDomain,
  PlotGridContext,
  PlotGridProvider,
  type IScrnaCluster,
  type IScrnaDataset,
  type IScrnaDatasetMetadata,
  type IScrnaGene,
  type IScrnaGexResults,
} from './plot-grid-provider'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { useUmapSettings } from './single-cell-settings'
import { UmapPlotSvg } from './umap-plot-svg'
import { UmapPropsPanel } from './umap-props-panel'

interface ISpecies {
  name: string
  assembly: string
}

interface ISpeciesSet {
  name: string
  species: ISpecies[]
}

const SPECIES: ISpeciesSet[] = [
  { name: 'Human', species: [{ name: 'Human', assembly: 'GRCh38' }] },
  { name: 'Mouse', species: [{ name: 'Mouse', assembly: 'GRCm38' }] },
]

export function SingleCellPage() {
  const { branch, sheet, sheets, history, gotoSheet, addStep, openBranch } =
    useHistory()

  //const [clusterFrame, setClusterFrame] = useState<BaseDataFrame | null>(null)
  //const [cmap, setCMap] = useState<ColorMap>(BRIGHT_20_CMAP) //BWR_CMAP)

  const [species] = useState<ISpecies>(SPECIES[0]!.species[0]!)
  //const [datasets, setDatasets] = useState<IScrnaDataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<IScrnaDataset | null>(
    null
  )

  //const [metadata, setMetadata] = useState<IScrnaDatasetMetadata | null>(null)

  const [gexData, setGexData] = useState<Record<string, number[]>>({})

  const [showSideBar, setShowSideBar] = useState(true)

  const { set: setPlot, setMode, setupGexPlot } = useContext(PlotGridContext)!

  //const [genes, setGenes] = useState<IScrnaGene[]>([])
  const [genesForUse, setGenesForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  // const [plot, setPlot] = useState<IUmapPlot>({
  //   xdata: [],
  //   ydata: [],
  //   genes: [],

  //   palette: BRIGHT_20_CMAP,
  // })

  const [search, setSearch] = useState('=aicda')
  const { zoom } = useZoom()

  //const [selectedTab, setSelectedTab] = useState('Data')
  //const [selectedRightTab, setSelectedRightTab] = useState(0)
  const [selectedPlotTab, setSelectedPlotTab] = useState('Display')
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)

  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  //const [scale, setScale] = useState(1)

  const { settings, updateSettings } = useUmapSettings()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const [filesToOpen, setFilesToOpen] = useState<ITextFileOpen[]>([])

  const { fetchAccessToken } = useEdbAuth()

  const { data: searchGenes } = useQuery({
    queryKey: ['genes', selectedDataset?.publicId ?? '', search],
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      if (!accessToken || !search || !selectedDataset) {
        return []
      }

      const res = await httpFetch.getJson<{ data: IScrnaGene[] }>(
        `${API_SCRNA_SEARCH_GENES_URL}/${selectedDataset.publicId}?q=${encodeURIComponent(search)}`,

        { headers: bearerHeaders(accessToken) }
      )

      //console.log(res.data)

      return res.data
    },
  })

  // useEffect(() => {
  //   if (data) {
  //     const lines = textToLines(data)

  //     const table = new DataFrameReader()
  //       .indexCols(1)
  //       .read(lines)
  //       .setName('Z Tesst dfdfdf')

  //     //resolve({ ...table, name: file.name })

  //     openBranch(`Load "Z Test"`, [table])
  //   }
  // }, [data])

  // useEffect(() => {
  //   //setSelectedSheet(0) //currentStep(history)[0]!.df.length - 1)
  // }, [history])

  // useEffect(() => {
  //   async function loadDatasets() {
  //     try {
  //       const accessToken = await fetchAccessToken()

  //       if (!accessToken) {
  //         return
  //       }

  //       // console.log(
  //       //   `${API_SCRNA_DATASETS_URL}/datasets/${species.name}/${species.assembly}`
  //       // )

  //       const res = await queryClient.fetchQuery({
  //         queryKey: ['datasets', species.name, species.assembly],
  //         queryFn: () => {
  //           return httpFetch.getJson<{ data: IScrnaDataset[] }>(
  //             `${API_SCRNA_DATASETS_URL}/${species.name}/${species.assembly}`,

  //             { headers: bearerHeaders(accessToken) }
  //           )
  //         },
  //       })

  //       //console.log(res.data)

  //       const datasets: IScrnaDataset[] = res.data

  //       setDatasets(datasets)

  //       if (datasets.length > 0) {
  //         setSelectedDataset(datasets[0]!)
  //       }
  //     } catch {
  //       console.error('error loading datasets from remote')
  //     }
  //   }

  //   loadDatasets()
  // }, [species.assembly, species.name])

  const { data: datasets } = useQuery({
    queryKey: ['datasets', species.assembly, species.name],
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return []
      }

      const res = await httpFetch.getJson<{ data: IScrnaDataset[] }>(
        `${API_SCRNA_DATASETS_URL}/${species.name}/${species.assembly}`,

        { headers: bearerHeaders(accessToken) }
      )

      //console.log(res.data)

      return res.data
    },
  })

  useEffect(() => {
    if (datasets && datasets.length > 0) {
      setSelectedDataset(datasets[0]!)
    }
  }, [datasets])

  useEffect(() => {
    async function loadMetadata() {
      try {
        const accessToken = await fetchAccessToken()

        if (!accessToken) {
          return
        }

        const res = await queryClient.fetchQuery({
          queryKey: ['metadata', selectedDataset?.publicId],
          queryFn: () => {
            return httpFetch.getJson<{ data: IScrnaDatasetMetadata }>(
              `${API_SCRNA_METADATA_URL}/${selectedDataset?.publicId}`,

              { headers: bearerHeaders(accessToken) }
            )
          },
        })

        //console.log(res.data)

        const metadata = res.data

        //const xdata = metadata.cells.map(m => m.umapX)
        //const ydata = metadata.cells.map(m => m.umapY)
        const points = metadata.cells.map((m) => m.pos)

        const clusters: IScrnaCluster[] = metadata.clusters.map((c) => {
          const idx = where(
            metadata.cells,
            (cell) => cell.clusterId === c.clusterId
          )

          const xc = ordered(
            points.map((p) => p.x),
            idx
          )
          const yc = ordered(
            points.map((p) => p.y),
            idx
          )
          const pos = findCenter(xc, yc)

          // add extended properties
          return {
            ...c,
            id: nanoid(),
            pos,
            show: true,
            showRoundel: true,
          }
        })

        updateSettings(
          produce(settings, (draft) => {
            draft.axes.xaxis.domain = makeDomain(points.map((p) => p.x))
            draft.axes.yaxis.domain = makeDomain(points.map((p) => p.y))
          })
        )

        // const normMap = Object.fromEntries(
        //   clusters.map((c, i) => [c.clusterId, i / (clusters.length - 1)])
        // )

        let hue = metadata.cells.map((c) => c.clusterId) //metadata.cells.map(c => normMap[c.clusterId]!)

        // if we sort by hue, we are sorting by color norm and
        // therefore cluster, so all points in a cluster will
        // be drawn at the same z-level
        const idx = argsort(hue)

        // resort points so higher z drawn last and on top

        setPlot({
          //xdata,
          //ydata,
          points,
          clusterInfo: {
            clusters,
            cdata: metadata.cells.map((c) => c.clusterId),
            order: idx,
            //map: Object.fromEntries(clusters.map((c, ci) => [c.clusterId, ci])),
          },
          plots: [
            {
              id: nanoid(),
              title: 'Clusters',
              genes: [],
              mode: 'clusters',

              clusters,

              gex: {
                hue: [],
                hueOrder: [],
                useMean: true,
                range: [0, 1],
              },
              palette: BWR_CMAP_V2,
            },
          ],

          globalGexRange: [0, 1],
        })
      } catch (e) {
        console.error('error loading datasets from remote' + e)
      }
    }

    // async function loadGenes() {
    //   try {
    //     const accessToken = await fetchAccessToken()

    //     if (!accessToken) {
    //       return
    //     }

    //     const res = await queryClient.fetchQuery({
    //       queryKey: ['genes', selectedDataset?.publicId],
    //       queryFn: () => {
    //         return httpFetch.getJson<{ data: IScrnaGene[] }>(
    //           `${API_SCRNA_GENES_URL}/${selectedDataset?.publicId}`,

    //           { headers: bearerHeaders(accessToken) }
    //         )
    //       },
    //     })

    //     console.log(res.data)

    //     setGenes(res.data)
    //   } catch (e) {
    //     console.error('error loading datasets from remote' + e)
    //   }
    // }

    if (selectedDataset) {
      loadMetadata()
      //loadGenes()
    }
  }, [selectedDataset?.publicId ?? ''])

  // useEffect(() => {
  //   const palette = new ColorMap(
  //     'Clusters',
  //     clusterInfo.clusters.map(l => l.color)
  //   )

  //   setPalette(palette)
  // }, [clusterInfo])

  useEffect(() => {
    //setPlot({ ...plot, palette: COLOR_MAPS[settings.cmap]! })
    //if (settings.mode.includes('gex')) {
    console.log('Say waht', settings.geneSets)

    if (selectedDataset) {
      setupGexPlot(selectedDataset, settings.geneSets, gexData)
    }
  }, [
    settings.cmap,
    settings.zscore.on,
    settings.grid.on,
    settings.zscore.range[0],
    settings.zscore.range[1],
    settings.geneSets,
  ])

  async function loadGex() {
    try {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      //const genes =
      //  settings.genes.filter(g => genesForUse.get(g.geneId) ?? false) ?? []

      if (settings.geneSets.length < 1) {
        return
      }

      const res = await queryClient.fetchQuery({
        queryKey: [
          'gex',
          selectedDataset?.publicId,
          settings.geneSets
            .flat()
            .map((g) => g.geneId)
            .join(','),
        ],
        queryFn: () => {
          return httpFetch.postJson<{ data: IScrnaGexResults }>(
            `${API_SCRNA_GEX_URL}/${selectedDataset?.publicId}`,

            {
              headers: bearerHeaders(accessToken),
              body: {
                genes: settings.geneSets.flat().map((g) => g.geneId),
              },
            }
          )
        },
      })

      const results: IScrnaGexResults = res.data

      // make some empty arrays to store the gene data
      const gexData = Object.fromEntries(
        settings.geneSets
          .flat()
          .map((g) => [g.geneId, zeros(selectedDataset?.cells ?? 0)])
      )

      for (const gene of results.genes) {
        for (const gx of gene.gex) {
          gexData[gene.geneId]![gx[0]!] = gx[1]!
        }
      }

      setGexData(gexData)

      setupGexPlot(selectedDataset!, settings.geneSets, gexData)
      //
    } catch (e) {
      console.error('error loading datasets from remote' + e)
    }
  }

  function loadClusters() {
    if (!sheet) {
      return
    }

    setMode('clusters')

    // const gridMode = settings.grid.on

    // let clusterIds = metadata?.cells.map(m => m.clusterId) ?? []

    // metadata.clusters

    // // scale indices between 0-1
    // const n = gridMode ? metadata.clusters.length : metadata.clusters.length - 1

    // //const indexMap = Object.fromEntries(uniqueClusters.map((x, i) => [x, i]))
    // // in grid mode we reserve 0 for gray
    // const normMap = gridMode
    //   ? Object.fromEntries(
    //       metadata.clusters.map((c, i) => [c.clusterId, (i + 1) / n])
    //     )
    //   : Object.fromEntries(
    //       metadata.clusters.map((c, i) => [c.clusterId, i / n])
    //     )

    // let hue = clusterIds.map(c => normMap[c]!)

    // const hueIdx = argsort(hue)

    // // resort points so higher z drawn last and on top

    // let xdata = metadata!.cells.map(m => m.umapX)

    // let ydata = metadata!.cells.map(m => m.umapY)

    // // find centers of clusters
    // const clusters: IScrnaCluster[] = []

    // if (gridMode) {
    //   clusters.push({
    //     pos: [-1, -1],
    //     show: true,
    //     showRoundel: false,
    //     color: '#dddddd',
    //     clusterId: 0,
    //     group: '',
    //     scClass: '',
    //     cells: -1,
    //   })
    // }

    // //for (const [ci, clusterId] of uniqueClusters.entries()) {
    // for (const cluster of metadata.clusters) {
    //   const idx = where(clusterIds, c => c === cluster.clusterId)

    //   const xc = ordered(xdata, idx)
    //   const yc = ordered(ydata, idx)
    //   const pos = findCenter(xc, yc)

    //   clusters.push({
    //     ...cluster,
    //     pos,
    //     show: true,
    //     showRoundel: true,
    //   })
    // }

    // const palette = new ColorMap(
    //   'Clusters',
    //   clusters.map(l => l.color)
    // )

    // // sort for display purposes
    // //hue = ordered(hue, idx)
    // //xdata = ordered(xdata, idx)
    // //ydata = ordered(ydata, idx)

    // updateSettings(
    //   produce(settings, draft => {
    //     //draft.mode = 'clusters'
    //     //draft.clusters = clusters

    //     if (settings.autoAxes) {
    //       draft.axes.xaxis.domain = makeDomain(xdata)
    //       draft.axes.yaxis.domain = makeDomain(ydata)
    //     }
    //   })
    // )

    // const plots: IUmapPlot[] = []

    // if (gridMode) {
    //   for (const cluster of metadata.clusters) {
    //     const idx = where(clusterIds, c => c === cluster.clusterId)

    //     // zero points to gray. Real clusters are normalized
    //     // between 1-n.
    //     const clusterSpecificHue = zeros(hue.length)

    //     for (const i of idx) {
    //       clusterSpecificHue[i] = hue[i]!
    //     }

    //     plots.push({
    //       id: nanoid(),
    //       title: `Cluster ${cluster.clusterId}`,
    //       genes: [],
    //       //mode: 'cluster',
    //       hueOrder: hueIdx,
    //       hue: clusterSpecificHue,
    //       gex: {
    //         useMean: true,
    //         range: [0, 1],
    //       },
    //       mode: 'clusters',
    //     })
    //   }
    // } else {
    //   console.log('nnnnn')
    //   plots.push({
    //     id: nanoid(),
    //     title: `Clusters`,
    //     genes: [],
    //     //mode: 'cluster',
    //     hueOrder: hueIdx,
    //     hue,
    //     gex: {
    //       useMean: true,

    //       range: [0, 1],
    //     },
    //     mode: 'clusters',
    //   })
    // }

    // setPlot({
    //   xdata,
    //   ydata,
    //   plots,
    //   palette,
    //   globalGexRange,
    //   clusterInfo,
    // })
  }

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

    openBranch(`Load ${name}`, [table.setName(truncate(name, { length: 16 }))])

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
              <SaveIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="UMAP">
            <ToolbarButton
              arial-label="Create UMAP"
              onClick={() => loadClusters()}
            >
              <PlayIcon />
              Cluster
            </ToolbarButton>

            <ToolbarButton arial-label="GEX" onClick={() => loadGex()}>
              GEX
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    {
      //id: nanoid(),
      id: 'Chart',
      content: (
        <>
          <ToolbarOptionalDropdownButton
            icon="Right"
            onMainClick={() => dfLog(sheet!, addStep, 2, 1)}
          >
            <DropdownMenuItem
              aria-label="Top"
              onClick={() => dfLog(sheet!, addStep, 2, 0)}
            >
              Top
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Add 1 to matrix then log2"
              onClick={() => dfLog(sheet!, addStep, 2, 1)}
            >
              Left
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Log10"
              onClick={() => dfLog(sheet!, addStep, 10, 0)}
            >
              Bottom
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Add 1 to matrix then log10"
              onClick={() => dfLog(sheet!, addStep, 10, 1)}
            >
              Right
            </DropdownMenuItem>
          </ToolbarOptionalDropdownButton>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_DISPLAY,
      icon: <SlidersIcon />,
      content: <UmapPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Clusters',
      content: <ClusterPropsPanel />,
    },

    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Genes',
      content: <PlotsPropsPanel datasetId={selectedDataset?.publicId ?? ''} />,
    },

    {
      //id: nanoid(),
      icon: <ClockIcon />,
      id: 'History',
      content: <HistoryPanel branchId={branch?.id ?? ''} />,
    },
  ]

  //const plotTabs: ITab[] = useMemo(() => [], [filterRowMode, history, groups])

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
            aria-label="Download as PNG"
            onClick={() => {
              console.log('SDfsdf')
              downloadSvgAutoFormat(svgRef, `motifs.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as SVG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `motifs.svg`)
            }}
          >
            <span>Download as SVG</span>
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
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        signedRequired="never"
        // shortcuts={
        //   <Shortcuts
        //     tabs={sideTabs}
        //     onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
        //   />
        // }
      >
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

                  <span className="truncate shrink-1 opacity-50 text-xxs">
                    {g.geneId}
                  </span>
                </AutocompleteLi>
              )
            })}

            <li className="flex items-center justify-end pt-2 px-2">
              <Button>{TEXT_ADD}</Button>
            </li>
          </Autocomplete>

          <Select
            value={selectedDataset?.publicId ?? ''}
            onValueChange={(v) => {
              setSelectedDataset(
                datasets?.find((d) => d.publicId === v) ?? null
              )
            }}
          >
            <SelectTrigger
              variant="header"
              className="text-sm"
              title="Select Genome"
            >
              <SelectValue placeholder="Select a genome" />
            </SelectTrigger>
            <SelectContent align="end">
              {datasets?.map((dataset) => (
                <SelectItem
                  key={dataset.publicId}
                  value={dataset.publicId}
                  variant="theme"
                >
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HeaderPortal>

        <Toolbar tabs={tabs}>
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
              <ShowOptionsMenu
                show={showSideBar}
                onClick={() => {
                  setShowSideBar(!showSideBar)
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
          id="umap"
          side="right"
          key="sidebar-table"
          tabs={rightTabs}
          value={selectedPlotTab}
          onTabChange={(selectedTab) => setSelectedPlotTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup
            direction="vertical"
            className="px-2"
            //autoSaveId="rev-comp-vert"
          >
            <ResizablePanel
              id="chart"
              defaultSize={70}
              minSize={10}
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
              defaultSize={30}
              minSize={10}
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
                  dataFrames={sheets as AnnotationDataFrame[]}
                  onTabChange={(selectedTab) => {
                    gotoSheet(selectedTab.tab.id)
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
          <>{getFormattedShape(sheet)} </>
          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SingleCellQueryPage() {
  return (
    <PlotGridProvider>
      <SingleCellPage />
    </PlotGridProvider>
  )
}
