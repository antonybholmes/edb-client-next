'use client'

import {
  DEFAULT_DISPLAY_PROPS,
  MotifSvg,
  type IDisplayProps,
  type Mode,
} from '@components/pages/modules/gene/motifs/motif-svg'
import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@components/toolbar/toolbar'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { ArrowRightArrowLeftIcon } from '@components/icons/arrow-right-arrow-left-icon'
import { SlidersIcon } from '@components/icons/sliders-icon'
import { TableIcon } from '@components/icons/table-icon'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { ChartIcon } from '@icons/chart-icon'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { SearchIcon } from '@icons/search-icon'
import { getDataFrameInfo } from '@lib/dataframe/dataframe-utils'
import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'

import { useContext, useEffect, useRef, useState } from 'react'

import { HistoryPanel } from '@components/pages/history-panel'

import { BaseCol } from '@/components/layout/base-col'

import { FileIcon } from '@/components/icons/file-icon'
import { Card } from '@/components/shadcn/ui/themed/card'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { API_MOTIF_DATASETS_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { FileImageIcon } from '@components/icons/file-image-icon'
import { SaveIcon } from '@components/icons/save-icon'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SearchBox } from '@components/search-box'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@components/shadcn/ui/themed/toggle-group'
import { TabContentPanel } from '@components/tab-content-panel'
import { TabProvider, type ITab } from '@components/tab-provider'
import { Shortcuts } from '@components/toolbar/shortcuts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { makeRandId } from '@lib/utils'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import { PLOT_CLS } from '../../matcalc/modules/heatmap/heatmap-panel'
import { DisplayPropsPanel } from './display-props-panel'
import MODULE_INFO from './module.json'
import { MotifsPropsPanel } from './motifs-props-panel'
import { MotifsContext, MotifsProvider } from './motifs-provider'

export function MotifsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const { state, search, setSearch, setDatasets } = useContext(MotifsContext)!
  //const search = useContext(MotifSearchContext)!

  //const searchRef = useRef<HTMLTextAreaElement>(null)
  const [selectedTab, setSelectedTab] = useState('Plot')

  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [revComp, setRevComp] = useState(false)
  const [mode, setMode] = useState<Mode>('Bits')
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [scale, setScale] = useState(1)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { history, historyDispatch } = useContext(HistoryContext)

  //const [, setSelection] = useContext(SelectionRangeContext)

  const [displayProps, setDisplayProps] = useState<IDisplayProps>(
    DEFAULT_DISPLAY_PROPS
  )

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  function loadTestData() {
    setSearch({ search: 'BCL6', reverse: revComp, complement: revComp })
  }

  function save(format: string) {
    const df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: true,
      file: `motif.${format}`,
      sep,
    })

    //setShowFileMenu(false)
  }

  const datasetsQuery = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      //const token = await loadAccessToken()
      console.log(API_MOTIF_DATASETS_URL)
      const res = await httpFetch.getJson<{ data: string[] }>(
        API_MOTIF_DATASETS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (datasetsQuery.data) {
      //console.log(datasetsQuery.data)
      setDatasets(
        new Map<string, boolean>(
          datasetsQuery.data.map((dataset: string) => [dataset, true])
        )
      )
    }
  }, [datasetsQuery.data])

  // if (datasetsQuery.isPending) {
  //   return "Loading..."
  // }

  // if (datasetsQuery.error) {
  //   return "An error has occurred: " + datasetsQuery.error.message
  // }

  useEffect(() => {
    setSearch({ ...search, reverse: revComp, complement: revComp })
  }, [revComp])

  useEffect(() => {
    setDisplayProps({ ...displayProps, mode })
  }, [mode])

  useEffect(() => {
    const dataframes: BaseDataFrame[] = state.order.map((i) => {
      const motif = state.motifs.get(i)!

      const df = new DataFrame({
        name: motif.motifName,
        data: motif.weights,
        columns: ['A', 'C', 'G', 'T'],
      }).t()

      return df
    })

    if (dataframes.length > 0) {
      historyDispatch({
        type: 'open',
        description: `Load`,
        sheets: dataframes,
      })
    }
  }, [state.order, state.motifs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save('txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('csv')
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
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `motifs.png`
              )
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as CSV"
            onClick={() => {
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `motifs.svg`
              )
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  // setShowDialog({
                  //   name: makeRandId("open"),
                  //
                  // })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title="Save mutation table"
              onClick={() =>
                setShowDialog({
                  id: makeRandId('save'),
                })
              }
            >
              <SaveIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Options">
            <ToggleGroup
              size="toolbar"
              type="single"
              value={mode}
              onValueChange={(value) => {
                setMode(value as Mode)
              }}
              className="rounded-theme flex flex-row overflow-hidden gap-x-0.5"
            >
              <ToggleGroupItem
                value="Prob"
                className="w-16"
                aria-label="Probability view"
              >
                Prob
              </ToggleGroupItem>

              <ToggleGroupItem
                value="Bits"
                className="w-16"
                aria-label="Bits view"
              >
                Bits
              </ToggleGroupItem>
            </ToggleGroup>

            <ToolbarIconButton
              selected={revComp}
              onClick={() => setRevComp(!revComp)}
              title="Reverse complement"
            >
              <ArrowRightArrowLeftIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />

          {/* <ToggleGroup
            type="single"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="rounded-theme overflow-hidden"
          >
            <ToggleGroupItem
              value="Plot"
              className="w-14"
              aria-label="Plot view"
            >
              Plot
            </ToggleGroupItem>

            <ToggleGroupItem
              value="Table"
              className="w-14"
              aria-label="Table view"
            >
              Table
            </ToggleGroupItem>
          </ToggleGroup> */}
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'History',
      icon: <ClockRotateLeftIcon />,
      content: <HistoryPanel />,
    },
  ]

  const chartTabs: ITab[] = [
    {
      id: 'Motifs',
      icon: <SearchIcon />,
      content: <MotifsPropsPanel />,
    },
    {
      id: 'Display',
      icon: <SlidersIcon />,
      content: (
        <DisplayPropsPanel
          displayProps={displayProps}
          onChange={(props) => setDisplayProps(props)}
        />
      ),
    },
  ]

  const sideTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Plot',
      icon: (
        <ChartIcon fill="fill-theme" w="w-5" style={{ fillOpacity: 0.75 }} />
      ),
      content: (
        <TabSlideBar tabs={chartTabs} side="Right">
          <Card className="ml-2 mb-2 grow" variant="content">
            <div className={PLOT_CLS}>
              <MotifSvg
                ref={svgRef}
                //dfs={plotFrames}
                className="absolute"
                displayProps={displayProps}
              />
            </div>
          </Card>
        </TabSlideBar>
      ),
    },
    {
      //id: nanoid(),
      id: 'Table',
      icon: (
        <TableIcon
          stroke="stroke-theme"
          style={{ strokeOpacity: 0.75 }}
          w="w-5"
        />
      ),

      content: (
        <TabSlideBar tabs={rightTabs} side="Right">
          <BaseCol className="ml-2  grow">
            <TabbedDataFrames
              selectedSheet={currentSheetId(history)[0]!}
              dataFrames={currentSheets(history)[0]!}
              onTabChange={(selectedTab) => {
                historyDispatch({
                  type: 'goto-sheet',
                  sheetId: selectedTab.index,
                })
              }}
              className="relative"
            />
          </BaseCol>
        </TabSlideBar>

        // <HSplitPane
        //   panels={[
        //     <TabbedDataFrames
        //       key="tabbed-data-frames"
        //       selectedSheet={history.step.sheetIndex}
        //       dataFrames={history.step.dataframes}
        //       onTabChange={(tab: number) => {
        //         historyDispatch({ type: "goto-sheet", index: tab })
        //       }}
        //       onSelectionChange={setSelection}
        //     />,
        //     <SideBar side="Right"
        //       key="sidebar-right"
        //       tabs={rightTabs}
        //       activeTabIndex={selectedRightTab}
        //       onTabChange={setSelectedRightTab}
        //     />,
        //   ]}
        // />
      ),
    },
  ]

  return (
    <>
      {showDialog.id.includes('save') && (
        <SaveImageDialog
          open="open"
          onSave={(format) => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `motifs.${format.ext}`
            )
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        showSignInError={false}
        headerCenterChildren={
          <SearchBox
            variant="header"
            value={search.search}
            onChange={(e) =>
              setSearch({
                search: e.target.value,
                reverse: revComp,
                complement: revComp,
              })
            }
            onSearch={(event, value) => {
              if (event === 'search') {
                setSearch({
                  search: value,
                  reverse: revComp,
                  complement: revComp,
                })
              } else {
                setSearch({
                  search: '',
                  reverse: revComp,
                  complement: revComp,
                })
              }
            }}
            className="w-80 text-xs font-medium"
          />
        }
        shortcuts={
          <Shortcuts
            //value={selectedTab}
            tabs={sideTabs}
            onTabChange={(selectedTab) => setSelectedTab(selectedTab.tab.id)}
          />
        }
      >
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <TabProvider
          value={selectedTab}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          tabs={sideTabs}
        >
          <BaseCol className="grow">
            <TabContentPanel />
          </BaseCol>
        </TabProvider>

        <ToolbarFooter className="justify-between">
          <div>{getDataFrameInfo(currentSheet(history)[0]!)}</div>
          <></>
          <ZoomSlider scale={scale} onZoomChange={adjustScale} />
        </ToolbarFooter>

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function MotifsQueryPage() {
  return (
    <CoreProviders>
      <MotifsProvider>
        <MotifsPage />
      </MotifsProvider>
    </CoreProviders>
  )
}
