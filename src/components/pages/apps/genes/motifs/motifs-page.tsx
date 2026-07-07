'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { useEffect, useState } from 'react'

import { Autocomplete } from '@/components/autocomplete'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  TEXT_SORT_BY,
} from '@/consts'
import { CoreProviders } from '@/providers/core-providers'
import { useZoom } from '@/providers/zoom-provider'

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
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'
import { produce } from 'immer'

import APP_INFO from './manifest.json'
import { MotifsSvg } from './motifs-svg'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { AppHeaderIcon } from '@/components/header/app-header-icon'

import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'
import { DownloadIcon } from '@/components/icons/download-icon'
import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { TabSlideBar } from '@/components/sidebar/tab-slide-bar'
import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-provider'
import { useFooter } from '@/providers/footer-provider'
import { SVGProvider, useSVG } from '@/providers/svg-provider'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { ArrowUpDown } from 'lucide-react'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { useSave } from '../../matcalc/hooks/save'
import { DatasetFilter } from './dataset-filter'
import { DisplayPropsPanel } from './display-props-panel'
import { MotifsPropsPanel } from './motifs-props-panel'
import { useMotifSettings } from './motifs-settings'
import { useMotifs } from './motifs-store'
import { HomeToolbar } from './toolbars/home-toolbar'

const PLOT_ZOOM_CHANNEL = 'motifs-plot-zoom'

export function MotifsPage() {
  const { search, searchResult, updateSearch } = useMotifs()
  const { setAppInfo } = useAppInfo()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { settings, updateSettings } = useMotifSettings()

  const { settings: edbSettings } = useEdbSettings()

  const { openFile, addSheets } = useHistory()

  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()
  const { svgRef } = useSVG()

  const { save } = useSave()
  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  useEffect(() => {
    openFile('Motifs')
  }, [openFile])

  // useEffect(() => {
  //   if (dfTab?.id) {
  //     //goto({ file, sheet: dfTab.id }) //, 'sheet')
  //   }
  // }, [dfTab?.id])

  // useEffect(() => {
  //   if (sheet.id) {
  //     setDFTab(sheet.id)
  //   }
  // }, [sheet.id, setDFTab])

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
        id: 'Tracks',
        component: MotifsPropsPanel,
      },
      {
        id: 'Display',
        component: DisplayPropsPanel,
      },
    ])
  }, [setSideTabs])

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
    // don't update if we don't have to
    if (zoom === settings.zoom) {
      return
    }

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

  // function save(name: string, format: string) {
  //   if (!sheet) {
  //     return
  //   }

  //   const sep = format === 'csv' ? ',' : '\t'

  //   downloadDataFrame(sheet as AnnotationDataFrame, {
  //     hasHeader: true,
  //     hasIndex: true,
  //     file: name,
  //     sep,
  //   })

  //   //setShowFileMenu(false)
  // }

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
      addSheets(dataframes)
    }
  }, [searchResult.motifs])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      render: (
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

  // const rightTabs: ITab[] = [
  //   {
  //     //id: nanoid(),
  //     id: 'History',
  //     icon: <ClockRotateLeftIcon />,
  //     content: ()=> <HistoryPanel />,
  //   },
  // ]

  // const sideTabs: ITab[] = [
  //   {
  //     id: 'Plot',
  //     icon: <ChartIcon stroke="" />,
  //     content: ()=>(
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

  //     content: ()=>(
  //       <TabSlideBar tabs={rightTabs} side="Right">
  //         <BaseCol className="ml-2  grow">
  //           <TabbedDataFrames
  //             selectedSheet={sheet?.id ?? ''}
  //             //dataFrames=sheets as AnnotationDataFrame[]}
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
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
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
            className="w-9/10 xl:w-3/5 text-xs font-medium"
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
          </SelectList>
        </>
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            fileMenuShortcuts={
              <>
                <DatasetFilter />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <ToolbarIconButton title={TEXT_SORT_BY}>
                        <ArrowUpDown className="w-4.5" />
                      </ToolbarIconButton>
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
              </>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <TabSlideBar side="right">
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
              <ExtScrollCard>
                <MotifsSvg
                  ref={svgRef}
                  //dfs={plotFrames}
                  //className="absolute"
                />
              </ExtScrollCard>
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              //className="flex flex-col text-sm"
              id="output"
              defaultSize="30%"
              minSize="0%"
              collapsible={true}
            >
              <BaseRow className="gap-x-2 grow h-full">
                <BaseCol className="shrink-0">
                  <IconButton
                    title={TEXT_SAVE_TABLE}
                    onClick={() => {
                      openDialog({
                        type: 'save',
                        payload: {
                          name: 'motifs',
                          callback: (data) => {
                            save(data.name, data.format.ext)
                          },
                        },
                      })
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </BaseCol>
                <TabbedDataFrames className="relative grow overflow-hidden" />
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <FooterPortal className="justify-between">
          <></>
          <>{searchResult.total > 0 ? `${searchResult.total} results` : null}</>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function MotifsQueryPage() {
  return (
    <CoreProviders>
      <SVGProvider>
        <MotifsPage />
      </SVGProvider>
    </CoreProviders>
  )
}
