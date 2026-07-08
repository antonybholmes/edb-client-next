'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

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
import { CoreProviders } from '@/providers/core-providers'
import { useZoom } from '@/providers/zoom-provider'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { ExportIcon } from '@/icons/export-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'
import { produce } from 'immer'

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
import { SVGProvider, useSVG } from '@/providers/svg-provider'

import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { OptsSidebarMenu } from '../matcalc/data/opts-sidebar-menu'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import { useSave } from '../matcalc/hooks/save'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { useUpdateEffect } from '@/hooks/update-effect'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { MatcalcDialogsRoot } from '../matcalc/matcalc-dialogs'
import { SankeyPropsPanel } from './props-panel/sankey-props-panel'
import { SankeyProvider } from './sankey-provider'
import { useSankeySettings } from './sankey-settings-store'
import { SankeySvg } from './sankey-svg'
import { HomeToolbar } from './toolbars/home-toolbar'

const PLOT_ZOOM_CHANNEL = 'sankey-plot-zoom'

export function SankeyPage() {
  const { setAppInfo } = useAppInfo()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { settings, updateSettings } = useSankeySettings()

  const { settings: edbSettings } = useEdbSettings()

  const { openFile } = useHistory()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

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

  useUpdateEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      render: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save('sankey.txt', 'txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('sankey.csv', 'csv')
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

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/sankey.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(0).read(lines)

    openFile(`Sankey Test`, {
      sheets: [table.setName('Sankey Test') as AnnotationDataFrame],
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
                <SankeySvg
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

          <SankeyPropsPanel />
        </ResizableSidebar>

        <FooterPortal className="justify-between">
          <></>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SankeyQueryPage() {
  return (
    <CoreProviders>
      <SankeyProvider>
        <SVGProvider>
          <SankeyPage />
        </SVGProvider>
      </SankeyProvider>
    </CoreProviders>
  )
}
