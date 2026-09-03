'use client'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { BaseCol } from '@/layout/base-col'
import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ZoomSlider } from '@/toolbar/zoom-slider'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { FileImageIcon } from '@/icons/file-image-icon'

import { useEffect, useState } from 'react'

import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'
import { OpenIcon } from '@/icons/open-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import { SvgBase } from '@/components/plot/svg-base'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { AppInfoButton } from '@/components/header/app-info-button'
import { httpFetch } from '@/lib/http/http-fetch'
import { useZoom } from '@/providers/zoom-provider'

import { ClientLayout } from '@/app/client-layout'
import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { BaseRow } from '@/components/layout/base-row'
import { useToolbarTabs, type ITab } from '@/components/tabs/tab-provider'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { FileIcon } from '@/icons/file-icon'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { MonitorDown } from 'lucide-react'
import { useHistory } from '../matcalc/history/history-provider/history-provider'

import { useSVG } from '@/providers/svg-provider'
import { useCurrentSheets } from '../matcalc/history/history-provider/history-contexts'
import APP_INFO from './manifest.json'
import { SVGFourWayVenn } from './svg-four-way-venn'
import { SVGOneWayVenn } from './svg-one-way-venn'
import { SVGThreeWayVenn } from './svg-three-way-venn'
import { SVGTwoWayVenn } from './svg-two-way-venn'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useOpen } from './use-open'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { HCenterRow } from '@/components/layout/h-center-row'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { produce } from 'immer'
import { HeatmapProvider } from '../matcalc/apps/heatmap/heatmap-provider'
import { HeatMapSvg } from '../matcalc/apps/heatmap/heatmap-svg'
import { OptsSidebarMenu } from '../matcalc/data/opts-sidebar-menu'
import { useAllPlots } from '../matcalc/history/history-provider/history-hooks'
import { IHeatMapPlot } from '../matcalc/history/history-provider/history-types'
import { VennPropsPanel } from './venn-props-panel'
import { makeVennList, useVenn } from './venn-store'

function VennPage() {
  const { openFiles } = useOpen()
  const { autoSave } = useSVG()
  const { setTabs: setToolbarTabs } = useToolbarTabs()

  //const { setPlot } = useHeatmapContext()
  //const { setTabs: setViewTabs } = useTabs('venn-side-tabs')

  //const [scale, setScale] = useState(1)

  //const [selectedSideTab, setSelectedSideTab] = useState(0)

  const { zoom } = useZoom({
    onChange: ({ zoom }) => {
      updateSettings(
        produce(settings, (draft) => {
          draft.scale = zoom
        })
      )
    },
  })

  const [, setKeyPressed] = useState<string | null>(null)

  const { settings, updateSettings } = useVennSettings()
  const { setAppInfo } = useAppInfo()

  const {
    //vennLists,
    setVennLists,

    vennElemMap,
    vennListsInUse,
    //setvennLists,
  } = useVenn()

  //const [listIds] = useState<number[]>(range(4))

  // Stores a mapping between the lowercase labels used for
  // matching and the original values. Note that this picks
  // the last value found as being original, so if you overlap
  // Lab1, and lAb1, lAb1 will be kept as the original value
  // const [_originalMap, setOriginalMap] = useState<Map<string, string>>(
  //   new Map()
  // )

  //const [vennSets, setVennSets] = useState<Record<number, IVennList>>({})

  // track what is unique to each set so we get rid of repeats
  // const [uniqueCountMap, setUniqueCountMap] = useState<
  //   Map<number, Set<string>>
  // >(new Map(listIds.map((i) => [i, new Set<string>()])))

  // const [listLabelMap, setListLabelMap] = useState<Map<number, string>>(
  //   new Map<number, string>(listIds.map((i) => [i, `List ${i + 1}`]))
  // )

  // const [labelToIndexMap, setLabelToIndexMap] = useState<Map<string, number>>(
  //   new Map()
  // )

  // map of list id to the text contents for each list,
  // we split these later to get the actual items
  //const [listTextMap, setListTextMap] = useState<Map<number, string>>(new Map())

  // https://github.com/benfred/venn.js/
  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [settings.isProportional, setProportional] = useState(true)

  //const [sets, setSets] = useState<ISet[]>([])

  // const { setTabs: setSideTabs } = useSideTabs()

  const { settings: edbSettings } = useEdbSettings()

  const { openFile } = useHistory()

  const { sheets } = useCurrentSheets()

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

  //         openFiles([{ name, text, ext: name.split('.').pop() || '' }])

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

  async function loadTestData() {
    const res = await httpFetch.getJson<{ name: string; items: string[] }[]>(
      '/data/test/venn.json'
    )

    setVennLists(
      res.map(({ items }, ci) =>
        makeVennList((ci + 1).toString(), `List ${ci + 1}`, items)
      )
    )
  }

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

  // useEffect(() => {
  //   setSideTabs([
  //     {
  //       id: 'Lists',
  //       component: VennLists,
  //     },
  //     {
  //       //id: nanoid(),
  //       id: TEXT_SETTINGS,
  //       component: VennPropsPanel,
  //     },
  //   ])
  // }, [setSideTabs])

  // useEffect(() => {

  //   const viewTabs: ITab[] = [
  //     {
  //       //id: nanoid(),
  //       id: 'List view',
  //       icon: <ListIcon className={TOOLBAR_BUTTON_ICON_CLS} size="w-4" />,

  //       render: () => (
  //         <Textarea
  //           ref={overlapRef}
  //           id="text-overlap"
  //           aria-label="Overlaps"
  //           className="h-full text-sm my-2 grow"
  //           placeholder="A list of the items in each Venn subset will appear here when you click on the diagram..."
  //           readOnly
  //           value={[
  //             selectedItems.name,
  //             ...selectedItems.items.sort().map((s) => originalNames[s] || s),
  //           ].join('\n')}
  //         />
  //       ),
  //     },
  //     {
  //       //id: nanoid(),
  //       id: 'Table view',
  //       icon: <TableIcon />,

  //       render: () => (
  //         <BaseRow className="grow mt-2 gap-x-1">
  //           <BaseCol className="text-xs">
  //             <ToolbarIconButton
  //               title="Download pathway table"
  //               onClick={() => save('txt')}
  //             >
  //               <MonitorDown size={20} strokeWidth={1.5} />
  //             </ToolbarIconButton>
  //           </BaseCol>

  //           <TabbedDataFrames
  //             key="tabbed-data-frames"
  //             selectedSheet={sheet?.id ?? ''}
  //             //dataFrames=sheets.map((s) => s as AnnotationDataFrame)}
  //             onTabChange={(selectedTab) => {
  //               goto({ file, sheet: selectedTab.tab })
  //             }}
  //           />
  //         </BaseRow>
  //       ),
  //     },
  //   ]

  // }, [])

  // useHydratedUpdateEffect(
  //   () => {
  //     updateSettings(
  //       produce(settings, (draft) => {
  //         draft.scale = zoom
  //       })
  //     )
  //   },
  //   [zoom],
  //   hasHydrated
  // )

  function save(format: 'txt' | 'csv') {
    const sep = format === 'csv' ? ',' : '\t'

    const df = sheets[0] as AnnotationDataFrame

    downloadDataFrame(df, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  // function onWheel(e: { deltaY: number }) {
  //   if (keyPressed === 'Shift') {
  //     setScale(
  //       Math.max(
  //         DEFAULT_ZOOM_SCALES[0]!,
  //         Math.min(
  //           DEFAULT_ZOOM_SCALES[DEFAULT_ZOOM_SCALES.length - 1]!,
  //           scale + (e.deltaY >= 0 ? 0.25 : -0.25)
  //         )
  //       )
  //     )
  //   }
  // }

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      render: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) =>
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openFiles(files)
                }),
            })
          }}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: '<divider>',
    },
    {
      id: TEXT_SAVE_AS,
      render: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
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
      id: 'Export',
      render: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              autoSave('venn.png')
            }}
          >
            <FileImageIcon fill="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              autoSave('venn.svg')
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <HeaderSlotPortal>
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to demo the Venn diagram"
                className="text-xs"
              >
                Test data
              </ToolbarButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <ResizableSidebar
          //limits={[50, 85]}
          side="right"
          //open={showSideBar}
          //onOpenChange={setShowSideBar}
          //className="mx-2"
        >
          <FileDropZonePanel
            onFileDrop={(files) => {
              if (files.length > 0) {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }

                  openFiles(files)
                })
              }
            }}
            className="grow h-full"
          >
            <ResizablePanelGroup orientation="vertical" className="h-full">
              <ResizablePanel
                defaultSize="60%"
                minSize="0%"
                className="flex flex-col overflow-hidden px-2"
                id="venn"
              >
                <HCenterRow className="pb-2">
                  <ToggleGroup
                    className="text-xs gap-x-px"
                    value={[settings.view.tab]}
                    onValueChange={(v) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.view.tab = v[0] as 'venn' | 'heatmap'
                        })
                      )
                    }}
                    rounded="full"
                    variant="app-theme"
                  >
                    <GroupToggle value="venn" className="w-18">
                      Venn
                    </GroupToggle>

                    <GroupToggle value="heatmap" className="w-18">
                      Heatmap
                    </GroupToggle>
                  </ToggleGroup>
                </HCenterRow>

                <ExtScrollCard
                  tabIndex={0}
                  onKeyDown={(e) => setKeyPressed(e.key)}
                  onKeyUp={() => setKeyPressed(null)}
                >
                  <Tabs
                    value={settings.view.tab}
                    onValueChange={() => {}}
                    className="grow h-full"
                  >
                    <TabsContent value="venn">
                      <SvgBase
                        scale={zoom}
                        width={settings.w}
                        height={settings.w}
                      >
                        {vennListsInUse.length < 2 && <SVGOneWayVenn />}
                        {vennListsInUse.length === 2 && <SVGTwoWayVenn />}
                        {vennListsInUse.length === 3 && <SVGThreeWayVenn />}
                        {vennListsInUse.length > 3 && <SVGFourWayVenn />}
                      </SvgBase>
                    </TabsContent>
                    <TabsContent value="heatmap">
                      {/* <HeatmapPanel /> */}
                      <HeatMapSvg />
                    </TabsContent>
                  </Tabs>
                </ExtScrollCard>
              </ResizablePanel>
              <ThinVResizeHandle />
              <ResizablePanel
                id="list"
                defaultSize="40%"
                minSize="0%"
                collapsible={true}
                className="grow flex flex-col text-xs pl-2"
              >
                <BaseRow className="grow mt-2 gap-x-1">
                  <BaseCol className="text-xs">
                    <ToolbarIconButton
                      title="Download pathway table"
                      onClick={() => save('txt')}
                    >
                      <MonitorDown size={20} strokeWidth={1.5} />
                    </ToolbarIconButton>
                  </BaseCol>

                  <TabbedDataFrames
                    key="tabbed-data-frames"
                    //selectedSheet={sheet?.id ?? ''}
                    //dataFrames=sheets.map((s) => s as AnnotationDataFrame)}
                    // onTabChange={(selectedTab) => {
                    //   goto({ file, sheet: selectedTab.tab })
                    // }}
                  />
                </BaseRow>
              </ResizablePanel>
            </ResizablePanelGroup>
          </FileDropZonePanel>
          <VennPropsPanel />
        </ResizableSidebar>
      </ShortcutLayout>

      <FooterPortal>
        <></>
        <></>

        <ZoomSlider />
      </FooterPortal>
    </>
  )
}

export function VennPlotPage() {
  const allPlots = useAllPlots()

  return (
    <HeatmapProvider plot={allPlots[0] as IHeatMapPlot}>
      <VennPage />
    </HeatmapProvider>
  )
}

export function VennPageQuery() {
  return (
    <ClientLayout>
      <VennPlotPage />
    </ClientLayout>
  )
}
