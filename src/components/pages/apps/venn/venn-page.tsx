'use client'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { BaseCol } from '@/layout/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ZoomSlider } from '@/toolbar/zoom-slider'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { FileImageIcon } from '@/icons/file-image-icon'

import { downloadSvg, downloadSvgAsPng } from '@/lib/image-utils'

import { FOCUS_RING_CLS } from '@/theme'

import { useEffect, useState } from 'react'

import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/sidebar/tab-slide-bar'
import { UploadIcon } from '@/icons/upload-icon'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
  TEXT_SETTINGS,
} from '@/consts'
import { OpenIcon } from '@/icons/open-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { cn } from '@/lib/shadcn-utils'

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

import { useAppInfo } from '@/components/edb/edb-settings'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { BaseRow } from '@/components/layout/base-row'
import {
  useSideTabs,
  useToolbarTabs,
  type ITab,
} from '@/components/tabs/tab-provider'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { FileIcon } from '@/icons/file-icon'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { vfill } from '@/lib/fill'
import { CoreProviders } from '@/providers/core-providers'
import { Card } from '@/themed/card'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { MonitorDown } from 'lucide-react'
import { useHistory } from '../matcalc/history/history-provider/history-provider'

import { SVGProvider, useSVG } from '@/providers/svg-provider'
import {
  useCurrentSheets,
  useFiles,
} from '../matcalc/history/history-provider/history-contexts'
import APP_INFO from './manifest.json'
import { SVGFourWayVenn } from './svg-four-way-venn'
import { SVGOneWayVenn } from './svg-one-way-venn'
import { SVGThreeWayVenn } from './svg-three-way-venn'
import { SVGTwoWayVenn } from './svg-two-way-venn'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useOpen } from './use-open'
import { VennLists } from './venn-lists'
import { VennPropsPanel } from './venn-props-panel'
import {
  makeVennList,
  useVenn,
  VENN_LIST_IDS,
  type IVennList,
} from './venn-store'

const PLOT_ZOOM_CHANNEL = 'venn-plot-zoom'

function VennPage() {
  const { selectedItems } = useVenn()

  const { openFiles } = useOpen()
  const { svgRef } = useSVG()
  const { setTabs: setToolbarTabs } = useToolbarTabs()
  //const { setTabs: setViewTabs } = useTabs('venn-side-tabs')

  //const [scale, setScale] = useState(1)

  //const [selectedSideTab, setSelectedSideTab] = useState(0)

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const [, setKeyPressed] = useState<string | null>(null)

  const { settings, updateSettings } = useVennSettings()
  const { setAppInfo } = useAppInfo()

  const {
    vennLists,
    setVennLists,
    originalNames,
    vennElemMap,
    setVennElemMap,
    vennListsInUse,
    setVennListsInUse,
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

  const { setTabs: setSideTabs } = useSideTabs()

  const [showSideBar, setShowSideBar] = useState(true)

  const { openFile, goto } = useHistory()

  const { file } = useFiles()
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
    const res = await httpFetch.getJson<string[][]>('/data/test/venn.json')

    setVennLists(
      Object.fromEntries(
        res.map((items: string[], ci: number) => {
          const id = (ci + 1).toString()
          return [
            id,
            makeVennList((ci + 1).toString(), `List ${ci + 1}`, items),
          ]
        })
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

  useEffect(() => {
    setSideTabs([
      {
        id: 'Lists',
        component: VennLists,
      },
      {
        //id: nanoid(),
        id: TEXT_SETTINGS,
        component: VennPropsPanel,
      },
    ])
  }, [setSideTabs])

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

  useEffect(() => {
    const vennSetList: IVennList[] = []
    let inUse: number = 0

    for (const [i, id] of VENN_LIST_IDS.entries()) {
      const vl = vennLists[id]!

      if (vl.uniqueItems.length > 0) {
        vennSetList.push(vl)
        inUse = Math.max(inUse, i)

        // for (const item of vl.uniqueItems) {
        //   originalNameMap.set(item.toLowerCase(), item)
        // }
      }
    }

    // we need to know which items are in which combination so
    // create a map of item to the lists it is found in for example
    // itemA -> [1, 2]
    const combs = new Map<string, Set<string>>()

    for (const vl of vennSetList) {
      for (const item of vl.uniqueItems) {
        if (!combs.has(item)) {
          combs.set(item, new Set())
        }

        combs.get(item)!.add(vl.id)
      }
    }

    //
    // counts for venn
    //

    const vennMap: Record<string, string[]> = {}

    for (const [item, listIds] of combs.entries()) {
      // make an id from all the lists this item belongs to, e.g 1:2:3
      const id = [...listIds].sort().join(':')

      if (!(id in vennMap)) {
        vennMap[id] = []
      }

      // now we have each set combination and the items in it
      // e.g. 1:2:3 -> [itemA, itemB, itemC] so if three
      // way, these are items shared by all 3 lists,
      // if 1:2, these are items shared by list 1 and 2 but not 3,
      // if 1, these are items unique to list 1 etc.
      vennMap[id]!.push(item)
    }

    setVennElemMap(vennMap)

    setVennListsInUse(inUse + 1)
  }, [vennLists, settings])

  useEffect(() => {
    // make a dataframe

    if (vennListsInUse === 0 || Object.keys(vennElemMap).length === 0) {
      return
    }

    const index = [...Object.keys(vennElemMap)].sort((a, b) =>
      a.length !== b.length ? a.length - b.length : a.localeCompare(b)
    )

    const maxRows = index
      .map((n) => vennElemMap[n]!.length)
      .reduce((a, b) => Math.max(a, b), 0)

    const d = index.map((n) =>
      [...vennElemMap[n]!]
        .sort()
        .concat(vfill('', maxRows - vennElemMap[n]!.length))
    )

    const df = new AnnotationDataFrame({
      name: 'Venn Sets',
      data: d,
      index: index.map((n) =>
        n
          .split(':')
          .map((s) => Number(s))
          .map((s) => vennLists[s]?.name ?? s)
          .join(' AND ')
      ),
    }).t

    openFile(`Venn Sets`, { sheets: [df] })
  }, [vennElemMap])

  useEffect(() => {
    // don't update if we don't have to
    if (zoom === settings.scale) {
      return
    }

    updateSettings({ scale: zoom })
  }, [zoom])

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
              onFileChange: (message, files) =>
                onTextFileChange(message, files, openFiles),
            })
          }}
        >
          <UploadIcon stroke="" />

          <span>Open files from this device</span>
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
              downloadSvgAsPng(svgRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <FileImageIcon fill="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              downloadSvg(svgRef, 'venn')
              //                 setShowFileMenu(false)
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
              <ShowOptionsMenu
                show={showSideBar}
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar>

        <TabSlideBar
          limits={[50, 85]}
          side="right"
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="mx-2"
        >
          <ResizablePanelGroup orientation="vertical" className="h-full">
            <ResizablePanel
              defaultSize="60%"
              minSize="0%"
              className="flex flex-col overflow-hidden px-2"
              id="venn"
            >
              <Card className="grow" variant="content">
                <div
                  className={cn(
                    FOCUS_RING_CLS,
                    'custom-scrollbar relative grow overflow-scroll rounded-theme bg-background'
                  )}
                  id="venn"
                  tabIndex={0}
                  onKeyDown={(e) => setKeyPressed(e.key)}
                  onKeyUp={() => setKeyPressed(null)}
                >
                  <SvgBase
                    className="absolute"
                    ref={svgRef}
                    scale={zoom}
                    width={settings.w}
                    height={settings.w}
                  >
                    {vennListsInUse < 2 && <SVGOneWayVenn />}
                    {vennListsInUse === 2 && <SVGTwoWayVenn />}
                    {vennListsInUse === 3 && <SVGThreeWayVenn />}
                    {vennListsInUse > 3 && <SVGFourWayVenn />}
                  </SvgBase>
                </div>
              </Card>
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
        </TabSlideBar>
      </ShortcutLayout>

      <FooterPortal>
        <></>
        <></>

        <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
      </FooterPortal>
    </>
  )
}

export function VennPageQuery() {
  return (
    <CoreProviders>
      <SVGProvider>
        <VennPage />
      </SVGProvider>
    </CoreProviders>
  )
}
