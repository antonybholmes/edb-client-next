'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { ArrowRightArrowLeftIcon } from '@/icons/arrow-right-arrow-left-icon'
import { SearchIcon } from '@/icons/search-icon'
import { SlidersIcon } from '@/icons/sliders-icon'
import { getDataFrameInfo } from '@/lib/dataframe/dataframe-utils'

import { useEffect, useRef, useState } from 'react'

import { Autocomplete } from '@/components/autocomplete'
import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveImageDialog } from '@/components/pages/save-image-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  TEXT_SAVE_IMAGE,
  TEXT_SAVE_TABLE,
  TEXT_SEARCH,
  TEXT_SORT_BY,
  type IDialogParams,
} from '@/consts'
import { useStableId } from '@/hooks/stable-id'
import { CoreProviders } from '@/providers/core-providers'
import { useZoom } from '@/providers/zoom-provider'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownSortOrderGroup,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { ExportIcon } from '@/icons/export-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { BaseCol } from '@/layout/base-col'
import { BaseRow } from '@/layout/base-row'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { randId } from '@/lib/id'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { Card } from '@/themed/card'
import { IconButton } from '@/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'
import { produce } from 'immer'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { DisplayPropsPanel } from './display-props-panel'
import MODULE_INFO from './module.json'
import { MotifSvg } from './motif-svg'
import { MotifsPropsPanel } from './motifs-props-panel'

import { DownloadImageIcon } from '@/components/icons/download-image-icon'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { ArrowUpDown } from 'lucide-react'
import {
  OPTS_SIDEBAR_ID,
  ShowOptsSidebarBtn,
} from '../../matcalc/data/data-panel'
import { useMotifSettings, type Mode } from './motifs-settings'
import { useMotifs } from './motifs-store'

const PLOT_ZOOM_CHANNEL = 'motifs-plot-zoom'

export function MotifsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const _id = useStableId('motifs-page')

  const { search, searchResult, updateSearch } = useMotifs()

  const [showSideBar, setShowSideBar] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { settings, updateSettings } = useMotifSettings()

  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

  const { openApp, openFile, goto } = useHistory()

  const app = useApp()!
  const file = useFile()!
  const sheet = useSheet()
  const sheets = useSheets()

  //const [q, setQ] = useState<string>(search.query)

  // so we don't trigger search on every keystroke
  //const debouncedQ = useDebounce(q, DEBOUNCE_DELAY_MS)

  useEffect(() => {
    openApp(MODULE_INFO.name)
  }, [])

  // // sync local query state when the global search query changes
  // useEffect(() => {
  //   setQ(search.query)
  // }, [search.query])

  // // periodically trigger a search when the debounced query changes
  // useEffect(() => {
  //   updateSearch(
  //     produce(search, draft => {
  //       draft.query = debouncedQ
  //     })
  //   )
  // }, [debouncedQ])

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.zoom = zoom
      })
    )
  }, [zoom])

  // function loadTestData() {
  //   setSearch({
  //     query: 'BCL6',
  //     //reverse: settings.revComp,
  //     //complement: settings.revComp,
  //   })
  // }

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

  // useEffect(() => {
  //   setSearch({
  //     ...search,
  //     reverse: settings.revComp,
  //     complement: settings.revComp,
  //   })
  // }, [settings.revComp])

  useEffect(() => {
    console.log('searchResult.motifs changed', searchResult.motifs)
    const dataframes: BaseDataFrame[] = searchResult.motifs.map((motif) => {
      const df = new AnnotationDataFrame({
        name: motif.name,
        data: motif.weights,
        columns: ['A', 'C', 'G', 'T'],
      }).t

      df.setIndexName('Base', true)

      return df
    })

    if (dataframes.length > 0) {
      openFile(`Motifs`, { sheets: dataframes })
    }
  }, [searchResult.motifs])

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

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
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

          <ToolbarSeparator />

          <ToolbarTabGroup title="Display" className="gap-x-1">
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

              value={[settings.mode]}
              onValueChange={(v) => {
                if (v) {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.mode = v[0] as Mode
                    })
                  )
                }
              }}
              size="toolbar"
              //rounded="none"
              //className="rounded-theme overflow-hidden"
            >
              <GroupToggle
                value="prob"
                className="w-12"
                aria-label="Probability view"
              >
                Prob
              </GroupToggle>

              <GroupToggle value="bits" className="w-12" aria-label="Bits view">
                Bits
              </GroupToggle>
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

          <ToolbarTabGroup title={TEXT_SEARCH} className="gap-x-1">
            <ToolbarButton
              checked={search.mode === 'advanced'}
              onClick={() => {
                updateSearch(
                  produce(search, (draft) => {
                    if (search.mode === 'advanced') {
                      draft.mode = 'basic'
                    } else {
                      draft.mode = 'advanced'
                    }
                  })
                )
              }}
              aria-label="Advanced Search"
            >
              Advanced
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />
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
            const d = data as { name: string; format: ISaveAsFormat }
            downloadSvgAutoFormat(svgRef, d.name)
          }

          setShowDialog({ ...NO_DIALOG })
        }}
      />

      {showDialog.id.includes('save-table') && (
        <SaveTxtDialog
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string; format: ISaveAsFormat }
              save(d.name, d.format.ext as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderPortal>
        <>
          <ModuleInfoButton info={MODULE_INFO} />
        </>
        <>
          <Autocomplete
            value={search.query}
            onTextChange={
              (v) =>
                updateSearch(
                  produce(search, (draft) => {
                    draft.query = v
                  })
                )

              //setQ(v)
            }
            className="w-80 text-xs font-medium"
          />
        </>
        <>
          <SelectList
            w="xxs"
            variant="header"
            className="text-xs"
            value={search.paging.pageSize.toString()}
            onValueChange={(value) => {
              updateSearch(
                produce(search, (draft) => {
                  draft.paging.pageSize = value ? parseInt(value as string) : 10
                  draft.paging.page = 1 // reset to first page
                })
              )
            }}
          >
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            {/* <SelectItem value="100">100</SelectItem> */}
          </SelectList>

          {/* {searchResult.total > 0 && (
            <span className="text-xs px-3 bg-muted/60 rounded-full py-1.5 mx-4">
              {searchResult.total} results
            </span>
          )} */}
        </>
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <IconButton title={TEXT_SORT_BY}>
                      <ArrowUpDown className="w-4.5" />
                    </IconButton>
                  }
                />
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={settings.sort.by === 'dataset,motif-id'}
                      onClick={() =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.sort.by = 'dataset,motif-id'
                          })
                        )
                      }
                    >
                      Dataset, Motif
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={settings.sort.by === 'motif-id'}
                      onClick={() =>
                        updateSettings(
                          produce(settings, (draft) => {
                            console.log('Setting sort by motif-id')
                            draft.sort.by = 'motif-id'
                          })
                        )
                      }
                    >
                      Motif
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuGroup>

                  <MenuSeparator />

                  <DropdownSortOrderGroup
                    asc={settings.sort.asc}
                    setAsc={(v) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.sort.asc = v
                        })
                      )
                    }}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
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
          id={OPTS_SIDEBAR_ID}
          tabs={chartTabs}
          side="right"
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup
            orientation="vertical"
            className="px-2 h-full"
            //autoSaveId="rev-comp-vert"
          >
            <ResizablePanel
              id="chart"
              defaultSize="70%"
              minSize="0%"
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
              defaultSize="30%"
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
                  dataFrames={sheets as AnnotationDataFrame[]}
                  onTabChange={(selectedTab) => {
                    goto({ app, file, sheet: selectedTab.tab })
                  }}
                  className="relative grow"
                />
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-between">
          <div>{getDataFrameInfo(sheet as AnnotationDataFrame)}</div>
          <>{searchResult.total > 0 ? `${searchResult.total} results` : null}</>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function MotifsQueryPage() {
  return (
    <CoreProviders>
      <MotifsPage />
    </CoreProviders>
  )
}
