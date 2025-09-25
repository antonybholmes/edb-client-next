'use client'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { BaseCol } from '@layout/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { ZoomSlider } from '@toolbar/zoom-slider'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarButton } from '@toolbar/toolbar-button'

import { FileImageIcon } from '@icons/file-image-icon'
import { LayersIcon } from '@icons/layers-icon'
import { SaveIcon } from '@icons/save-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { TableIcon } from '@icons/table-icon'

import {
  downloadSvg,
  downloadSvgAsPng,
  downloadSvgAutoFormat,
} from '@lib/image-utils'

import { FOCUS_RING_CLS, TOOLBAR_BUTTON_ICON_CLS } from '@/theme'

import { useEffect, useRef, useState } from 'react'

import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { PropsPanel } from '@components/props-panel'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@icons/upload-icon'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@themed/resizable'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_SAVE_AS,
  TEXT_SAVE_IMAGE,
  TEXT_SETTINGS,
  type IDialogParams,
} from '@/consts'
import { OpenIcon } from '@icons/open-icon'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { randID } from '@lib/id'
import { rangeMap } from '@lib/math/range'
import { cn } from '@lib/shadcn-utils'
import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { BaseSvg } from '@/components/base-svg'
import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import { Tabs } from '@/components/shadcn/ui/themed/tabs'
import { SideTabs } from '@/components/tabs/side-tabs'
import { httpFetch } from '@/lib/http/http-fetch'
import { useZoom } from '@/providers/zoom-provider'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { TabContentPanel } from '@components/tabs/tab-content-panel'
import { TabProvider, type ITab } from '@components/tabs/tab-provider'
import { FileIcon } from '@icons/file-icon'
import { ListIcon } from '@icons/list-icon'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { textToLines } from '@lib/text/lines'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@themed/card'
import { Textarea } from '@themed/textarea'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import { useHistory } from '../matcalc/history/history-store'
import MODULE_INFO from './module.json'
import { SVGFourWayVenn } from './svg-four-way-venn'
import { SVGOneWayVenn } from './svg-one-way-venn'
import { SVGThreeWayVenn } from './svg-three-way-venn'
import { SVGTwoWayVenn } from './svg-two-way-venn'
import { VennList } from './venn-list'
import { VennPropsPanel } from './venn-props-panel'
import { IVennList, makeVennList, useVenn, VENN_LIST_IDS } from './venn-store'

function VennPage() {
  const queryClient = useQueryClient()

  const [activeSideTab, setActiveSideTab] = useState('Items')
  const [rightTab, setSelectedRightTab] = useState('Lists')

  const { selectedItems } = useVenn()

  //const [scale, setScale] = useState(1)

  const { zoom } = useZoom()

  const [keyPressed, setKeyPressed] = useState<string | null>(null)

  const {
    settings,
    updateSettings,
    resetSettings,
    circles,
    updateCircles,
    resetCircles,
    updateRadius,
  } = useVennSettings()

  const {
    vennLists,
    setVennLists,
    originalNames,
    vennElemMap,
    setVennElemMap,
    vennListsInUse,
    setVennListsInUse,
  } = useVenn()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

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
  const [listTextMap, setListTextMap] = useState<Map<number, string>>(new Map())

  // https://github.com/benfred/venn.js/
  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [settings.isProportional, setProportional] = useState(true)

  //const [sets, setSets] = useState<ISet[]>([])

  const svgRef = useRef<SVGSVGElement>(null)
  const overlapRef = useRef<HTMLTextAreaElement>(null)

  const [showSideBar, setShowSideBar] = useState(true)

  const { sheet, sheets, openBranch, gotoSheet } = useHistory()

  //useWindowScrollListener((e: unknown) => console.log(e))

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

  function openFiles(files: ITextFileOpen[]) {
    const file = files[0]!
    const name = file.name

    const lines = textToLines(file.text)

    const sep = name.endsWith('csv') ? ',' : '\t'

    const table = new DataFrameReader()
      .delimiter(sep)
      .indexCols(0)
      .colNames(1)
      .read(lines).t

    setVennLists(
      Object.fromEntries(
        rangeMap((ci) => {
          const id = (ci + 1).toString()

          return [
            id,
            makeVennList(
              (ci + 1).toString(),
              table.index.str(ci),
              table.row(ci).strs
            ),
          ]
        }, table.shape[0])
      )
    )

    setListTextMap(
      new Map(
        table.values.map((r, ri) => [ri, r.map((c) => c.toString()).join('\n')])
      )
    )

    //resolve({ ...table, name: file.name })

    // historyDispatch({
    //   type: "reset",
    //   title: `Load ${name}`,
    //   df: table.setName(truncate(name, { length: 16 })),
    // })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => httpFetch.getJson<string[][]>('/data/test/venn.json'),
    })

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
    const vennSetList: IVennList[] = []
    let inUse: number = 0

    //console.log(vennLists, 'vennLists')

    for (const [i, id] of VENN_LIST_IDS.entries()) {
      const vl = vennLists[id]

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
    // itemA -> [0, 1]
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
      const id = [...listIds].sort().join(':')

      if (!(id in vennMap)) {
        vennMap[id] = []
      }

      vennMap[id].push(item)
    }

    setVennElemMap(vennMap)

    setVennListsInUse(inUse + 1)
  }, [vennLists, listTextMap, settings])

  useEffect(() => {
    // make a dataframe

    if (vennListsInUse === 0 || Object.keys(vennElemMap).length === 0) {
      return
    }

    const index = [...Object.keys(vennElemMap)].sort((a, b) =>
      a.length !== b.length ? a.length - b.length : a.localeCompare(b)
    )

    const maxRows = index
      .map((n) => vennElemMap[n].length)
      .reduce((a, b) => Math.max(a, b), 0)

    const d = index.map((n) =>
      [...vennElemMap[n]]
        .sort()
        .concat(Array(maxRows - vennElemMap[n].length).fill(''))
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

    openBranch(`Venn Sets`, [df])
  }, [vennElemMap])

  useEffect(() => {
    updateSettings({ scale: zoom })
  }, [zoom])

  function save(format: 'txt' | 'csv') {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
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
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: randID('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() => {
                setShowDialog({ id: 'export', params: {} })
              }}
            >
              <DownloadImageIcon />
            </ToolbarIconButton>

            {/* <ToolbarSaveSvg
              svgRef={svgRef}
            /> */}
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const vennRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Lists',
      icon: <LayersIcon />,

      content: (
        <PropsPanel>
          <ScrollAccordion value={VENN_LIST_IDS.map((vl) => `List ${vl}`)}>
            {VENN_LIST_IDS.map((vi) => {
              const name = `List ${vi}`
              const vennList = vennLists[vi]
              return (
                <AccordionItem value={name} key={name}>
                  <AccordionTrigger>{vennList.name}</AccordionTrigger>
                  <AccordionContent>
                    <VennList vennList={vennList} />
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SETTINGS,
      icon: <SlidersIcon />,
      content: <VennPropsPanel />,
    },
  ]

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

  const sidebarTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'List view',
      icon: <ListIcon className={TOOLBAR_BUTTON_ICON_CLS} w="w-4" />,

      content: (
        <Textarea
          ref={overlapRef}
          id="text-overlap"
          aria-label="Overlaps"
          className="h-full text-sm my-2 grow"
          placeholder="A list of the items in each Venn subset will appear here when you click on the diagram..."
          readOnly
          value={[
            selectedItems.name,
            ...selectedItems.items.sort().map((s) => originalNames[s] || s),
          ].join('\n')}
        />
      ),
    },
    {
      //id: nanoid(),
      id: 'Table view',
      icon: <TableIcon />,

      content: (
        <BaseCol className="grow mt-2 gap-y-1">
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Download pathway table"
              tooltip="Download pathway table"
              onClick={() => save('txt')}
            >
              <SaveIcon />
              <span>{TEXT_EXPORT}</span>
            </ToolbarButton>
          </ToolbarTabGroup>

          <TabbedDataFrames
            key="tabbed-data-frames"
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              gotoSheet(selectedTab.tab.id)
            }}
          />
        </BaseCol>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: randID('open'), params: {} })}
        >
          <UploadIcon stroke="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: '<divider>',
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
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
      //id: nanoid(),
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAsPng(svgRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvg(svgRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.id.includes('export') && (
        <SaveImageDialog
          name="venn"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signedRequired={false} showAccountButton={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
        </HeaderPortal>

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
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

        <TabSlideBar
          id="venn-sidebar"
          limits={[50, 85]}
          side="right"
          tabs={vennRightTabs}
          onTabChange={(selectedTab) => setSelectedRightTab(selectedTab.tab.id)}
          value={rightTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="mx-2"
        >
          <ResizablePanelGroup
            direction="vertical"
            className="grow"
            //autoSaveId="venn-resizable-panels-v"
          >
            <ResizablePanel
              defaultSize={75}
              minSize={10}
              className="grow flex flex-col  overflow-hidden px-2"
              id="venn"
            >
              <Card className="grow" variant="content">
                <div
                  className={cn(
                    FOCUS_RING_CLS,
                    'custom-scrollbar relative grow overflow-scroll rounded-theme bg-background'
                  )}
                  id="venn"
                  //onWheel={onWheel}
                  tabIndex={0}
                  onKeyDown={(e) => setKeyPressed(e.key)}
                  onKeyUp={() => setKeyPressed(null)}
                >
                  <BaseSvg
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
                  </BaseSvg>
                  {/* <div
                    id="tooltip"
                    className="venntooltip absolute z-(--z-modal) rounded-theme bg-black/80 px-4 py-2 text-white opacity-0"
                  />   */}
                </div>
              </Card>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              id="list"
              defaultSize={25}
              minSize={10}
              collapsible={true}
              className="grow flex flex-col"
            >
              {/* <TopTabs
                tabs={sidebarTabs}
                value={activeSideTab}
                onValueChange={setActiveSideTab}
              /> */}

              {/* <ToggleButtons
                tabs={sidebarTabs}
                value={activeSideTab}
                onTabChange={selectedTab =>
                  setActiveSideTab(selectedTab.tab.name)
                }
                className="grow"
              >
                <VCenterRow>
                  <ToggleButtonTriggers className="text-xs" />
                </VCenterRow>
                <TabContentPanel />
              </ToggleButtons> */}

              <Tabs
                value={activeSideTab}
                className="grow flex flex-row gap-x-2 px-2"
                orientation="vertical"
              >
                <SideTabs
                  tabs={sidebarTabs}
                  value={activeSideTab}
                  showLabels={false}
                  //defaultWidth={2}
                  onTabChange={(selectedTab) =>
                    setActiveSideTab(selectedTab.tab.id)
                  }
                />

                <TabProvider
                  value={activeSideTab}
                  //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
                  tabs={sidebarTabs}
                >
                  <BaseCol className="grow">
                    <TabContentPanel />
                  </BaseCol>
                </TabProvider>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <ToolbarFooterPortal>
          <></>
          <></>
          <>
            <ZoomSlider />
          </>
        </ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => openFiles(files))
            }
          />
        )}
      </ShortcutLayout>
    </>
  )
}

export function VennPageQuery() {
  return (
    <CoreProviders>
      {/* <ZoomProvider> */}
      <VennPage />
      {/* </ZoomProvider> */}
    </CoreProviders>
  )
}
