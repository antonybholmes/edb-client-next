'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'
import {
  IGseaBubblePlot,
  useGseaBubbleContext,
} from '../gsea-plot/bubble/gsea-bubble-provider'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { useEffect, useState } from 'react'

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
} from '@/consts'
import { ClientLayout } from '@/app/client-layout'
import { useZoom } from '@/providers/zoom-provider'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { ExportIcon } from '@/icons/export-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import APP_INFO from './manifest.json'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { AppHeaderIcon } from '@/components/header/app-header-icon'

import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'
import { DownloadIcon } from '@/components/icons/download-icon'
import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { useFooter } from '@/providers/footer-provider'
import { useSVG } from '@/providers/svg-provider'

import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'

import { GseaBubbleProvider } from '../gsea-plot/bubble/gsea-bubble-provider'

import { produce } from 'immer'
import { OptsSidebarMenu } from '../../../matcalc/data/opts-sidebar-menu'
import { useAllPlots } from '../../../matcalc/history/history-provider/history-hooks'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useSave } from '../../../matcalc/hooks/save'
import { MatcalcDialogsRoot } from '../../../matcalc/matcalc-dialogs'
import { GseaBubbleDisplayPropsPanel } from '../gsea-plot/bubble/gsea-bubble-display-props-panel'
import { useGseaBubbleSettings } from '../gsea-plot/bubble/gsea-bubble-settings-store'
import { GseaBubblePlotSvg } from '../gsea-plot/bubble/gsea-bubble-svg'
import { HomeToolbar } from './toolbars/home-toolbar'

const PLOT_ZOOM_CHANNEL = 'gsea-bubble-zoom'

export function GseaBubblePage() {
  const { setAppInfo } = useAppInfo()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const { setZoom } = useZoom({
    onChange: ({ zoom }) => {
      updateSettings(
        produce(settings, (draft) => {
          draft.page.scale = zoom
        })
      )
    },
  })

  const { settings: edbSettings } = useEdbSettings()

  const { plots } = useGseaBubbleContext()
  const { settings, updateSettings } = useGseaBubbleSettings()

  const { openFile } = useHistory()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { autoSave, saveAs } = useSVG()

  const { save } = useSave()
  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  // useEffect(() => {
  //   openFile('Motifs')
  // }, [openFile])

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

  // load saved zoom from settings
  useEffect(() => {
    setZoom(settings.page.scale)
  }, [settings.page.scale])

  // useEffect(() => {
  //   if (!plot || settings.scale === zoom) {
  //     return
  //   }

  //   updateSettings(
  //     produce(settings, (draft) => {
  //       draft.scale = zoom
  //     })
  //   )
  // }, [plot, zoom])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      render: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save('gsea-bubble.txt', 'txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('gsea-bubble.csv', 'csv')
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
              autoSave(`gsea-bubble.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              autoSave(`gsea-bubble.svg`)
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/gsea/gsea-report.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    openFile(`GSEA Bubble Test`, {
      sheets: [table.setName('GSEA Bubble Test') as AnnotationDataFrame],
      mode: 'set',
    })
  }

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
      </HeaderPortal>

      <MatcalcDialogsRoot />

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  title="Load test data."
                >
                  Test data
                </ToolbarButton>
              </>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <ResizableSidebar side="right">
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
                {plots.length > 0 && <GseaBubblePlotSvg />}
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
                          name: 'gsea-bubble',
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

          <GseaBubbleDisplayPropsPanel />
        </ResizableSidebar>

        <FooterPortal className="justify-between">
          <></>
          <></>
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function GseaBubblePlotPage() {
  const allPlots = useAllPlots()

  return (
    <GseaBubbleProvider
      plots={allPlots.length > 0 ? [allPlots[0] as IGseaBubblePlot] : []}
    >
      <GseaBubblePage />
    </GseaBubbleProvider>
  )
}

export function GseaBubbleQueryPage() {
  return (
    <ClientLayout>
      <GseaBubblePlotPage />
    </ClientLayout>
  )
}
