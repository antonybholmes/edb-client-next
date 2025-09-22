'use client'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { ArrowRightArrowLeftIcon } from '@icons/arrow-right-arrow-left-icon'
import { SearchIcon } from '@icons/search-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { getDataFrameInfo } from '@lib/dataframe/dataframe-utils'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { useContext, useEffect, useRef, useState } from 'react'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/shadcn/ui/themed/toggle-group'
import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  type IDialogParams,
} from '@/consts'
import { useZoom } from '@/providers/zoom-provider'
import { Autocomplete } from '@components/autocomplete'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { DownloadIcon } from '@components/icons/download-icon'
import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { type ITab } from '@components/tabs/tab-provider'
import { ExportIcon } from '@icons/export-icon'
import { FileIcon } from '@icons/file-icon'
import { FileImageIcon } from '@icons/file-image-icon'
import { BaseCol } from '@layout/base-col'
import { BaseRow } from '@layout/base-row'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { randId } from '@lib/utils'
import { Card } from '@themed/card'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { IconButton } from '@themed/icon-button'
import { ResizablePanel, ResizablePanelGroup } from '@themed/resizable'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'
import { produce } from 'immer'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import {
  HISTORY_ACTION_OPEN_APP,
  useHistory,
} from '../../matcalc/history/history-store'
import { DisplayPropsPanel } from './display-props-panel'
import MODULE_INFO from './module.json'
import { MotifSvg } from './motif-svg'
import { MotifsPropsPanel } from './motifs-props-panel'
import { MotifsContext, MotifsProvider } from './motifs-provider'
import { useMotifSettings, type Mode } from './motifs-settings'

export function MotifsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const { state, search, setSearch } = useContext(MotifsContext)!

  const [showSideBar, setShowSideBar] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { zoom } = useZoom()

  const { settings, updateSettings } = useMotifSettings()

  const { sheet, sheets, dispatch, openBranch, gotoSheet } = useHistory()

  useEffect(() => {
    dispatch({ type: HISTORY_ACTION_OPEN_APP, name: MODULE_INFO.name })
  }, [])

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.zoom = zoom
      })
    )
  }, [zoom])

  function loadTestData() {
    setSearch({
      search: 'BCL6',
      reverse: settings.revComp,
      complement: settings.revComp,
    })
  }

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: true,
      file: name,
      sep,
    })

    //setShowFileMenu(false)
  }

  // const datasetsQuery = useQuery({
  //   queryKey: ['datasets'],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()
  //     console.log(API_MOTIF_DATASETS_URL)
  //     const res = await httpFetch.getJson<{ data: string[] }>(
  //       API_MOTIF_DATASETS_URL
  //     )

  //     return res.data
  //   },
  // })

  // useEffect(() => {
  //   if (datasetsQuery.data) {
  //     setDatasets(
  //       new Map<string, boolean>(
  //         datasetsQuery.data.map((dataset: string) => [dataset, true])
  //       )
  //     )
  //   }
  // }, [datasetsQuery.data])

  // if (datasetsQuery.isPending) {
  //   return "Loading..."
  // }

  // if (datasetsQuery.error) {
  //   return "An error has occurred: " + datasetsQuery.error.message
  // }

  useEffect(() => {
    setSearch({
      ...search,
      reverse: settings.revComp,
      complement: settings.revComp,
    })
  }, [settings.revComp])

  useEffect(() => {
    const dataframes: BaseDataFrame[] = state.order.map((i) => {
      const motif = state.motifs.get(i)!

      const df = new AnnotationDataFrame({
        name: motif.motifName,
        data: motif.weights,
        columns: ['A', 'C', 'G', 'T'],
      }).t

      df.setIndexName('Base', true)

      return df
    })

    if (dataframes.length > 0) {
      openBranch(`Load`, dataframes)
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
              save('motifs.txt', 'txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('motifs.csv', 'csv')
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
              downloadSvgAutoFormat(svgRef, `motifs.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
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

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          {/* <ToolbarTabGroup title="File">
             

            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() =>
                setShowDialog({
                  id: randId(`save-plot`),
                })
              }
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator /> */}

          <ToolbarTabGroup title="Options" className="gap-x-1">
            {/* <Tabs
              value={settings.mode}
              onValueChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.mode = v as Mode
                  })
                )
              }}
            >
              <IOSTabsList
                defaultWidth="64px"
                value={settings.mode}
                tabs={[
                  { id: 'prob', name: 'Prob' },
                  { id: 'bits', name: 'Bits' },
                ]}
              />
            </Tabs> */}

            <ToggleGroup
              //variant="outline"
              type="single"
              value={settings.mode}
              onValueChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.mode = v as Mode
                  })
                )
              }}
            >
              <ToggleGroupItem
                value="prob"
                className="w-16"
                aria-label="Probability view"
              >
                Prob
              </ToggleGroupItem>

              <ToggleGroupItem
                value="bits"
                className="w-16"
                aria-label="Bits view"
              >
                Bits
              </ToggleGroupItem>
            </ToggleGroup>

            <ToolbarIconButton
              checked={settings.revComp}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.revComp = !settings.revComp
                  })
                )
              }}
              title="Reverse Complement"
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

  // const rightTabs: ITab[] = [
  //   {
  //     //id: nanoid(),
  //     id: 'History',
  //     icon: <ClockRotateLeftIcon />,
  //     content: <HistoryPanel />,
  //   },
  // ]

  const chartTabs: ITab[] = [
    {
      id: 'Motifs',
      icon: <SearchIcon />,
      content: <MotifsPropsPanel />,
    },
    {
      id: 'Display',
      icon: <SlidersIcon />,
      content: <DisplayPropsPanel />,
    },
  ]

  // const sideTabs: ITab[] = [
  //   {
  //     id: 'Plot',
  //     icon: <ChartIcon stroke="" />,
  //     content: (
  //       <TabSlideBar tabs={chartTabs} side="Right">
  //         <Card className="ml-2 mb-2 grow" variant="content">
  //           <div className={PLOT_CLS}>
  //             <MotifSvg
  //               ref={svgRef}
  //               //dfs={plotFrames}
  //               className="absolute"
  //             />
  //           </div>
  //         </Card>
  //       </TabSlideBar>
  //     ),
  //   },
  //   {
  //     id: 'Table',
  //     icon: (
  //       <TableIcon
  //         stroke=""
  //         fill="fill-white"
  //       />
  //     ),

  //     content: (
  //       <TabSlideBar tabs={rightTabs} side="Right">
  //         <BaseCol className="ml-2  grow">
  //           <TabbedDataFrames
  //             selectedSheet={sheet?.id ?? ''}
  //             dataFrames={sheets as AnnotationDataFrame[]}
  //             onTabChange={selectedTab => {
  //               gotoSheet(selectedTab.tab.id)
  //             }}
  //             className="relative"
  //           />
  //         </BaseCol>
  //       </TabSlideBar>
  //     ),
  //   },
  // ]

  return (
    <>
      <SaveImageDialog
        open={showDialog.id.includes('save-plot')}
        name="motifs"
        onResponse={(response, data) => {
          if (response !== TEXT_CANCEL) {
            downloadSvgAutoFormat(svgRef, data!.name as string)
          }

          setShowDialog({ ...NO_DIALOG })
        }}
      />

      {showDialog.id.includes('save-table') && (
        <SaveTxtDialog
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              save(
                data!.name as string,
                (data!.format as ISaveAsFormat)!.ext! as string
              )
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout
        signedRequired={false}

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
            value={search.search}
            onTextChange={(v) =>
              setSearch({
                search: v,
                reverse: settings.revComp,
                complement: settings.revComp,
              })
            }
            className="w-80 text-xs font-medium"
          />
        </HeaderPortal>

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

        {/* <TabProvider
          value={selectedTab}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          tabs={sideTabs}
        >
          <BaseCol className="grow">
            <TabContentPanel />
          </BaseCol>
        </TabProvider> */}

        <TabSlideBar
          tabs={chartTabs}
          side="right"
          id="motifs"
          limits={[50, 85]}
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
                  <MotifSvg
                    ref={svgRef}
                    //dfs={plotFrames}
                    className="absolute"
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

        <ToolbarFooterPortal className="justify-between">
          <div>{getDataFrameInfo(sheet)}</div>
          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function MotifsQueryPage() {
  return (
    <MotifsProvider>
      <MotifsPage />
    </MotifsProvider>
  )
}
