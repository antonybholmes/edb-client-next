import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@components/toolbar/toolbar'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import { ArrowRotateRightIcon } from '@icons/arrow-rotate-right'

import { TableIcon } from '@components/icons/table-icon'
import { LineChartIcon } from '@icons/line-chart-icon'

import { BaseCol } from '@/components/layout/base-col'
import { MenuButton } from '@components/toolbar/menu-button'
import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@components/toolbar/toolbar-optional-dropdown-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { VCenterRow } from '@/components/layout/v-center-row'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import { Tooltip } from '@components/tooltip'
import { OpenIcon } from '@icons/open-icon'
import { cn } from '@lib/class-names'
import {
  BaseDataFrame,
  DEFAULT_SHEET_NAME,
} from '@lib/dataframe/base-dataframe'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import {
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
// import {
//   faClockRotateLeft,
//   faLayerGroup,
//   faPaintBrush,
// } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import {
  FILE_MENU_ITEM_DESC_CLS,
  FILE_MENU_ITEM_HEADING_CLS,
  TOOLBAR_BUTTON_ICON_CLS,
} from '@/theme'

import { useContext, useEffect, useRef, useState } from 'react'

import { FileImageIcon } from '@components/icons/file-image-icon'

import { type IClusterGroup } from '@lib/cluster-group'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { downloadCanvasAsPng } from '@lib/image-utils'

import { ClockIcon } from '@components/icons/clock-icon'
import { LayersIcon } from '@components/icons/layers-icon'
import { PlayIcon } from '@components/icons/play-icon'

import { OpenDialog } from '@/components/pages/modules/matcalc/open-dialog'
import { ScatterPlotCanvas } from '@/components/plot/scatter/scatter-plot-canvas'
import { DEFAULT_SCATTER_PROPS } from '@/components/plot/scatter/scatter-plot-svg'
import { Card } from '@/components/shadcn/ui/themed/card'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { dfLog } from '@/components/table/dataframe-ui'
import { TEXT_DOWNLOAD_AS_TXT, TEXT_SAVE_AS } from '@/consts'
import { textToLines } from '@/lib/text/lines'
import { HistoryPanel } from '@components/pages/history-panel'
import { SHEET_PANEL_CLS } from '@components/pages/modules/matcalc/data-panel'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { TabContentPanel } from '@components/tab-content-panel'
import { TabProvider, type ITab } from '@components/tab-provider'
import { Shortcuts } from '@components/toolbar/shortcuts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { truncate } from '@lib/text/text'
import { makeRandId } from '@lib/utils'
import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ClustersPanel } from './clusters-panel'
import MODULE_INFO from './module.json'

export function UMAPPage() {
  const { history, historyDispatch } = useContext(HistoryContext)

  const [clusterFrame, setClusterFrame] = useState<BaseDataFrame | null>(null)
  const [cmap, setCMap] = useState<ColorMap>(BWR_CMAP)
  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)

  const [selectedTab, setSelectedTab] = useState('Data')
  //const [selectedRightTab, setSelectedRightTab] = useState(0)
  const [selectedPlotTab, setSelectedPlotTab] = useState('Clusters')
  //const [search] = useState<string[]>([])

  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const [scale, setScale] = useState(1)

  const [displayProps, setDisplayProps] = useState({ ...DEFAULT_SCATTER_PROPS })

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<string>('')

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const [filesToOpen, setFilesToOpen] = useState<ITextFileOpen[]>([])

  const [groups, setGroups] = useState<IClusterGroup[]>([])

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

  //const { data } = useFetch('/data/modules/sc_rna/large/umap.txt.gz')

  const { data } = useQuery({
    queryKey: ['databases'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await axios.post(
        '/data/modules/sc_rna/large/umap.txt.gz',
        {},
        {
          headers: {
            //Authorization: bearerTokenHeader(token),
            'Content-Type': 'application/json',
          },
        }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (data) {
      const lines = textToLines(data)

      const table = new DataFrameReader()
        .indexCols(1)
        .read(lines)
        .setName('Z Tesst dfdfdf')

      //resolve({ ...table, name: file.name })

      historyDispatch({
        type: 'open',
        description: `Load "Z Test"`,
        sheets: [table],
      })
    }
  }, [data])

  useEffect(() => {
    //setSelectedSheet(0) //currentStep(history)[0]!.df.length - 1)
  }, [history])

  useEffect(() => {
    if (clusterFrame) {
      setSelectedTab('Chart')
    }
  }, [clusterFrame])

  // function onFileChange(_message: string, files: FileList | null) {
  //   if (!files) {
  //     return
  //   }

  //   const file = files[0]!
  //   const name = file.name

  //   //setFile(files[0])
  //   //setShowLoadingDialog(true)

  //   const fileReader = new FileReader()

  //   fileReader.onload = e => {
  //     const result = e.target?.result

  //     if (result) {
  //       // since this seems to block rendering, delay by a second so that the
  //       // animation has time to start to indicate something is happening and
  //       // then finish processing the file
  //       setTimeout(() => {
  //         const text: string =
  //           typeof result === 'string' ? result : Buffer.from(result).toString()

  //         setFilesToOpen([{ name, text, ext: name.split('.').pop() || '' }])

  //         // historyState.current = {
  //         //   step: 0,
  //         //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
  //         // }

  //         //setShowLoadingDialog(false)
  //       }, 2000)
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

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

    historyDispatch({
      type: 'open',
      description: `Load ${name}`,
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

  function getCurrentDataFrame(): BaseDataFrame | null {
    const ret = currentSheet(history)[0]!

    if (ret.size == 0) {
      return null
    }

    if (ret.name === DEFAULT_SHEET_NAME) {
      return null
    }

    return ret
  }

  function makeUMAP() {
    let df = getCurrentDataFrame()

    if (!df) {
      return
    }

    const clusters = df.col('Cluster')!.values
    // add hue col
    const uniqueClusters = [...new Set(df.col('Cluster')!.values)].sort()

    // scale indices between 0-1
    const n = uniqueClusters.length - 1

    const indexMap = Object.fromEntries(uniqueClusters.map((x, i) => [x, i]))
    const normMap = Object.fromEntries(uniqueClusters.map((x, i) => [x, i / n]))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cmap = uniqueClusters.map(_x => 'gray') //JET_CMAP.get(i / n))

    // modify palette for custom groups

    groups.forEach(group => {
      if (group.search.filter(s => s in normMap).length > 0) {
        cmap[indexMap[group.name]] = group.color
      }
    })

    const colorMap = new ColorMap(cmap)

    setCMap(colorMap)

    df = df.copy()
    df.setCol(
      'Hue',
      clusters.map(c => normMap[c.toString()] ?? -1)
    )

    historyDispatch({
      type: 'add-step',
      description: 'Add Hue',
      sheets: [df],
    })

    setClusterFrame(df)
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

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  function save(format: 'txt' | 'csv') {
    const df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'
    const hasHeader = !df.name.includes('GCT')
    const hasIndex = !df.name.includes('GCT')

    downloadDataFrame(df, downloadRef, {
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
          <ToolbarTabGroup>
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
                  canvasRef={svgCanvasRef}
                  downloadRef={downloadRef}
                />
              )} */}

            <ToolbarButton arial-label="Create UMAP" onClick={() => makeUMAP()}>
              <PlayIcon />
              UMAP
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <VCenterRow>
            <Tooltip content="Undo">
              <ToolbarIconButton
                aria-label="Undo action"
                onClick={() => {
                  historyDispatch({
                    type: 'undo',
                  })
                }}
                className="fill-foreground"
              >
                <ArrowRotateRightIcon className="-scale-x-100" />
              </ToolbarIconButton>
            </Tooltip>
            <Tooltip content="Redo">
              <ToolbarIconButton
                aria-label="Redo action"
                onClick={() => {
                  historyDispatch({
                    type: 'redo',
                  })
                }}
                className="fill-foreground"
              >
                <ArrowRotateRightIcon />
              </ToolbarIconButton>
            </Tooltip>
          </VCenterRow>
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
            onMainClick={() =>
              dfLog(getCurrentDataFrame(), historyDispatch, 2, 1)
            }
          >
            <DropdownMenuItem
              aria-label="Top"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 2, 0)
              }
            >
              Top
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Add 1 to matrix then log2"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 2, 1)
              }
            >
              Left
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Log10"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 10, 0)
              }
            >
              Bottom
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Add 1 to matrix then log10"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 10, 1)
              }
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
      icon: <LayersIcon />,
      id: 'Clusters',
      content: (
        <ClustersPanel
          df={currentSheet(history)[0]!}
          onGroupsChange={setGroups}
          downloadRef={downloadRef}
          groups={groups}
        />
      ),
    },
    {
      //id: nanoid(),
      icon: <ClockIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  //const plotTabs: ITab[] = useMemo(() => [], [filterRowMode, history, groups])

  const sideTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <TableIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
      id: 'Data',
      content: (
        <>
          <TabSlideBar
            side="Right"
            key="sidebar-table"
            tabs={rightTabs}
            value={selectedPlotTab}
            onTabChange={selectedTab => setSelectedPlotTab(selectedTab.tab.id)}
          >
            <TabbedDataFrames
              key="tabbed-data-frames"
              selectedSheet={currentSheetId(history)[0]!}
              dataFrames={currentSheets(history)[0]!}
              onTabChange={selectedTab => {
                historyDispatch({
                  type: 'goto-sheet',
                  sheetId: selectedTab.index,
                })
              }}
              className={SHEET_PANEL_CLS}
            />
          </TabSlideBar>

          <ToolbarFooter className="justify-between">
            <div>
              <button onClick={() => setSelectedTab('Data')}>
                {getFormattedShape(currentSheet(history)[0]!)}
              </button>
            </div>
          </ToolbarFooter>
        </>
      ),
    },
    {
      //id: nanoid(),
      icon: <LineChartIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
      id: 'Chart',
      content: (
        <>
          <TabSlideBar
            side="Right"
            key="sidebar-table"
            tabs={rightTabs}
            value={selectedPlotTab}
            onTabChange={selectedTab => setSelectedPlotTab(selectedTab.tab.id)}
          >
            <Card variant="content" className="ml-2">
              <div
                key="scatter"
                className={'relative overflow-scroll custom-scrollbar grow'}
              >
                {clusterFrame && (
                  <ScatterPlotCanvas
                    onCanvasChange={e => {
                      setCanvas(e)
                    }}
                    df={clusterFrame}
                    cmap={cmap}
                    x="UMAP1"
                    y="UMAP2"
                    hue="Hue"
                    displayProps={displayProps}
                    className="absolute bottom-0 left-0 right-0 top-0"
                  />
                )}
              </div>
            </Card>
          </TabSlideBar>

          <ToolbarFooter className="justify-between">
            <></>

            <></>
            <ZoomSlider
              scale={scale}
              onZoomChange={adjustScale}
              className={cn([selectedTab === 'Chart', 'visible', 'invisible'])}
            />
          </ToolbarFooter>
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon className="fill-white" w="w-5" />,
      content: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">Open</h1>

          <ul className="flex flex-col gap-y-2 text-xs">
            <li>
              <MenuButton
                aria-label="Open file on your computer"
                onClick={() => setShowDialog(makeRandId('open'))}
              >
                <OpenIcon className="text-amber-300" />
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Open local file
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Open a local file on your computer.
                  </span>
                </p>
              </MenuButton>
            </li>
          </ul>
        </BaseCol>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

          <ul className="flex flex-col gap-y-1 text-xs">
            <li>
              <MenuButton
                aria-label="Save text file"
                onClick={() => save('txt')}
              >
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    {TEXT_DOWNLOAD_AS_TXT}
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save table as a tab-delimited text file.
                  </span>
                </p>
              </MenuButton>
            </li>
            <li>
              <MenuButton
                aria-label="Save CSV file"
                onClick={() => save('csv')}
              >
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as CSV
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save table as a comma separated text file.
                  </span>
                </p>
              </MenuButton>
            </li>
          </ul>
        </BaseCol>
      ),
    },
    {
      //id: nanoid(),
      id: 'Export',
      content: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">Export</h1>

          <ul className="flex flex-col gap-y-1 text-xs">
            <li>
              <MenuButton
                aria-label="Download as PNG"
                onClick={() =>
                  //drawScatter(canvas, df, x, y, hue, size, cmap, displayProps)
                  downloadCanvasAsPng(canvas, downloadRef)
                }
              >
                <FileImageIcon fill="" />
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as PNG
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save chart as PNG.
                  </span>
                </p>
              </MenuButton>
            </li>
            {/* <li>
                <MenuButton
                  aria-label="Download SVG"
                  onClick={() => downloadCanvasAsPng(canvasRef, downloadRef)}
                >
                  <></>
                  <p>
                    <span>
                      <strong>Download as SVG</strong>
                    </span>
                    <br />
                    <span>Save chart as SVG file.</span>
                  </p>
                </MenuButton>
              </li> */}
          </ul>
        </BaseCol>
      ),
    },
  ]

  return (
    <>
      {filesToOpen && (
        <OpenDialog
          files={filesToOpen}
          openFiles={openFiles}
          onCancel={() => setFilesToOpen([])}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        showSignInError={false}
        shortcuts={
          <Shortcuts
            tabs={sideTabs}
            onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
          />
        }
      >
        {/* <LoadingDialog visible={showLoadingDialog} /> */}

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel />
        </Toolbar>

        {/* <TabSlideBar
          tabs={sideTabs}
          value={selectedTab}
          onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
        /> */}

        <TabProvider
          value={selectedTab}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          tabs={sideTabs}
        >
          <BaseCol className="grow pr-2">
            <TabContentPanel />
          </BaseCol>
        </TabProvider>

        {showDialog.includes('open') && (
          <OpenFiles
            open={showDialog}
            //onOpenChange={open => setShowDialog(open ? "open" : "")}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, files => setFilesToOpen(files))
            }
          />
        )}

        <a ref={downloadRef} className="hidden" />
      </ShortcutLayout>
    </>
  )
}
