'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { ArrowRightArrowLeftIcon } from '@/icons/arrow-right-arrow-left-icon'
import { getDataFrameInfo } from '@/lib/dataframe/dataframe-utils'

import { useEffect, useRef, useState } from 'react'

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
  TEXT_SAVE_TABLE,
  type IDialogParams,
} from '@/consts'
import type { ISaveAsFileType } from '@/dialogs/save-as-dialog'
import { SaveImageDialog } from '@/dialogs/save-image-dialog'
import { SaveTxtDialog } from '@/dialogs/save-txt-dialog'
import { useZoom } from '@/providers/zoom-provider'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import {
  ToggleButtons,
  ToggleButtonTriggers,
} from '@/components/toggle-buttons'
import { ExportIcon } from '@/icons/export-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { SaveIcon } from '@/icons/save-icon'
import { BaseCol } from '@/layout/base-col'
import { BaseRow } from '@/layout/base-row'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
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
import { PLOT_CLS } from '../matcalc/apps/heatmap/heatmap-panel'

import { BioDrawSvg } from './bio-draw-canvas'
import { DisplayPropsPanel } from './display-props-panel'
import { MotifsPropsPanel } from './motifs-props-panel'

import { DownloadIcon } from '@/components/icons/download-icon'
import { CoreProviders } from '@/providers/core-provider'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import { useMotifSettings, type Mode } from './motifs-settings'

const PLOT_ZOOM_CHANNEL = 'bio-draw-plot-zoom'

import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { useSideTabs } from '@/components/tabs/tab-provider'
import { useAppInfo } from '@/lib/edb/edb-settings'
import {
  useCurrentSheets,
  useFiles,
} from '../matcalc/history/history-provider/history-contexts'
import { useSave } from '../matcalc/hooks/save'
import APP_INFO from './manifest.json'

export function BioDrawPage() {
  //const _id = useStableId('bio-draw-page')

  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  //const search = useContext(MotifSearchContext)!

  //const searchRef = useRef<HTMLTextAreaElement>(null)
  //const [selectedTab, setSelectedTab] = useState('Plot')

  const svgRef = useRef<SVGSVGElement>(null)

  //const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { settings, updateSettings } = useMotifSettings()

  const { goto } = useHistory()

  const { file } = useFiles()
  const { sheets } = useCurrentSheets()
  const { setAppInfo } = useAppInfo()

  const { save } = useSave()

  const df = sheets[0] as AnnotationDataFrame

  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [])

  useEffect(() => {
    setSideTabs([
      {
        id: 'Motifs',
        component: MotifsPropsPanel,
      },
      {
        id: 'Display',
        component: DisplayPropsPanel,
      },
    ])
  }, [setSideTabs])

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.zoom = zoom
      })
    )
  }, [zoom])

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

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      component: () => (
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
      component: () => (
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
      component: () => (
        <>
          <ToolbarTabGroup title="File">
            {/* <ToolbarOpenFile
              onOpen={() => {
                if (open) {
                  
                }
              }}
              multiple={true}
            /> */}

            <ToolbarIconButton
              title="Save motifs"
              onClick={() =>
                setShowDialog({
                  id: randId(`save-plot`),
                })
              }
            >
              <SaveIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Options" className="gap-x-1">
            <ToggleButtons
              tabs={[{ id: 'Prob' }, { id: 'Bits' }]}
              value={settings.mode}
              onTabChange={(selectedTab) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.mode = selectedTab.tab.id as Mode
                  })
                )
              }}
            >
              <ToggleButtonTriggers defaultWidth={3.5} />
            </ToggleButtons>

            <ToolbarIconButton
              checked={settings.revComp}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.revComp = !settings.revComp
                  })
                )
              }}
              title="Reverse complement"
            >
              <ArrowRightArrowLeftIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
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
            const d = data as {
              name: string
            }

            downloadSvgAutoFormat(svgRef, d.name as string)
          }

          setShowDialog({ ...NO_DIALOG })
        }}
      />

      {showDialog.id.includes('save-table') && (
        <SaveTxtDialog
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as {
                name: string
                format: ISaveAsFileType
              }

              save(d.name as string, d.format.ext as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        {/* <TabProvider
          value={selectedTab}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          tabs={sideTabs}
        >
          <BaseCol className="grow">
            <TabContentPanel />
          </BaseCol>
        </TabProvider> */}

        <TabSlideBar side="right" limits={[50, 85]}>
          <ResizablePanelGroup
            orientation="vertical"
            className="px-2"
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
                  <BioDrawSvg

                  //className="absolute"
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
                  //selectedSheet={sheet?.id ?? ''}
                  dataFrames={sheets as AnnotationDataFrame[]}
                  // onTabChange={(selectedTab) => {
                  //   goto({ file, sheet: selectedTab.tab })
                  // }}
                  className="relative grow"
                />
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <FooterPortal className="justify-between">
          <div>{getDataFrameInfo(df)}</div>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function BioDrawQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <BioDrawPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
